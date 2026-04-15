/**
 * /api/v1/recomendaciones — Personalized recommendations endpoint
 * Combines ML feature vector with Oracle data to generate ranked recs
 */
const express = require('express');
const { dbQuery } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Simple logistic regression sigmoid
function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

// Build user feature vector from Oracle data
async function buildFeatures(userId) {
  const [reservasRows, lealtadRows, eventRows] = await Promise.all([
    dbQuery(`
      SELECT r.precio_pagado, r.clase_servicio, r.estado_reserva,
             r.fecha_reserva, p.aeropuerto_destino, p.tipo_vuelo
      FROM   reservas r
      JOIN   vuelos v ON v.id_vuelo = r.id_vuelo
      JOIN   programas_vuelo p ON p.id_programa = v.id_programa
      WHERE  r.id_pasajero = :1 ORDER BY r.fecha_reserva DESC FETCH FIRST 50 ROWS ONLY
    `, [userId]),
    dbQuery(
      "SELECT puntos_acumulados, nivel_membresia FROM programa_lealtad WHERE id_pasajero = :1",
      [userId]
    ),
    dbQuery(
      "SELECT tipo_evento, COUNT(*) cnt FROM analisis_comportamiento WHERE id_pasajero = :1 AND timestamp_evento >= SYSDATE - 30 GROUP BY tipo_evento",
      [userId]
    ),
  ]);

  const reservas = reservasRows;
  const lealtad  = lealtadRows[0] || {};
  const evMap    = Object.fromEntries(eventRows.map(e => [e.TIPO_EVENTO, e.CNT]));

  const totalBookings = reservas.length;
  const totalSpend    = reservas.reduce((s, r) => s + (r.PRECIO_PAGADO || 0), 0);
  const cancellations = reservas.filter(r => r.ESTADO_RESERVA === 'CANCELADA').length;
  const cancellationRate = totalBookings > 0 ? cancellations / totalBookings : 0;
  const searches = evMap['FLIGHT_SEARCH'] || 0;
  const clicks   = evMap['FLIGHT_CLICK'] || 0;
  const ctr      = searches > 0 ? clicks / searches : 0;

  const NIVEL_NUM = { BRONCE: 0, PLATA: 1, ORO: 2, PLATINO: 3 };
  const loyaltyLevel = NIVEL_NUM[lealtad.NIVEL_MEMBRESIA] ?? 0;

  const userScore =
    Math.min(1, totalSpend / 5000) * 25 +
    (loyaltyLevel / 3) * 20 +
    ctr * 15 +
    (1 - cancellationRate) * 15 +
    Math.min(1, totalBookings / 10) * 25;

  const purchaseProb = sigmoid(-1.5 + 0.8*ctr + 0.5*(1-cancellationRate) + 0.4*(loyaltyLevel/3));

  const topDests = [...new Map(
    reservas.map(r => [r.AEROPUERTO_DESTINO, r])
  ).keys()].filter(Boolean).slice(0, 5);

  return { totalBookings, totalSpend, cancellationRate, loyaltyLevel,
           loyaltyPoints: lealtad.PUNTOS_ACUMULADOS || 0,
           userScore, purchaseProb, topDests, ctr };
}

// GET /recomendaciones/:userId
router.get('/:userId', auth(), async (req, res) => {
  try {
    const features = await buildFeatures(req.params.userId);

    // Get available flights
    const vuelos = await dbQuery(`
      SELECT v.id_vuelo, p.numero_vuelo, p.aeropuerto_destino, v.plazas_vacias,
             v.hora_salida_programada
      FROM   vuelos v
      JOIN   programas_vuelo p ON p.id_programa = v.id_programa
      WHERE  v.estado_vuelo = 'PROGRAMADO' AND v.plazas_vacias > 0
        AND  v.fecha_vuelo >= TRUNC(SYSDATE)
      FETCH  FIRST 20 ROWS ONLY
    `);

    // Score flights
    const scored = vuelos.map(v => {
      const dest    = v.AEROPUERTO_DESTINO || '';
      const histIdx = features.topDests.indexOf(dest);
      let score = 0;
      let razon = 'Vuelo disponible';
      if (histIdx === 0) { score += 40; razon = 'Tu destino favorito'; }
      else if (histIdx > 0) { score += 20; razon = 'Destino conocido'; }
      const scarcity = 1 - ((v.PLAZAS_VACIAS || 30) / 162);
      if (scarcity > 0.85) { score += 15; }
      return { ...v, score, razon };
    }).sort((a, b) => b.score - a.score).slice(0, 5);

    // Hotels
    const hoteles = await dbQuery(`
      SELECT id_hotel, nombre_hotel, categoria, distancia_km, tarifa_noche_desde,
             tiene_shuttle FROM hoteles_cercanos WHERE activo = 1
      ORDER  BY convenio_aeropuerto DESC, tarifa_noche_desde ASC
      FETCH  FIRST 3 ROWS ONLY
    `).catch(() => []);

    // Cluster
    const cluster = features.userScore >= 80 ? 'VIP'
      : features.userScore >= 60 ? 'HIGH_VALUE'
      : features.totalBookings === 0 ? 'NEW'
      : features.cancellationRate > 0.3 ? 'CHURNING'
      : 'REGULAR';

    const mensaje = {
      VIP:        'Bienvenido de vuelta. Tenemos ofertas exclusivas para ti.',
      HIGH_VALUE: 'Recomendaciones basadas en tus viajes anteriores.',
      NEW:        '¡Bienvenido! Descubre los destinos más populares.',
      CHURNING:   'Te extrañamos. Mira estas ofertas especiales.',
      REGULAR:    'Recomendaciones personalizadas para ti.',
    }[cluster];

    res.json({
      vuelos:      scored,
      hoteles,
      userInsights: {
        score:          Math.round(features.userScore),
        cluster,
        purchaseReady:  features.purchaseProb > 0.5,
        topDests:       features.topDests,
      },
      mensaje,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
