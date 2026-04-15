/**
 * /api/v1/reservas — Booking routes
 */
const express = require('express');
const { dbQuery, dbExecute } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /reservas — create booking
router.post('/', auth(), async (req, res) => {
  try {
    const {
      id_vuelo, id_pasajero, clase_servicio,
      numero_asiento, precio_pagado, moneda,
      metodo_pago,
    } = req.body;

    // Validate flight availability
    const vRows = await dbQuery(
      'SELECT plazas_vacias, estado_vuelo FROM vuelos WHERE id_vuelo = :1',
      [id_vuelo]
    );
    if (!vRows.length) return res.status(404).json({ message: 'Vuelo no encontrado.' });
    const v = vRows[0];
    if (v.PLAZAS_VACIAS <= 0) return res.status(409).json({ message: 'Sin disponibilidad.', oracle_error: 'ORA-20003' });
    if (v.ESTADO_VUELO === 'CANCELADO') return res.status(409).json({ message: 'El vuelo fue cancelado.' });

    // Check passenger flight ban
    const banRows = await dbQuery(
      `SELECT 1 FROM prohibiciones_vuelo
       WHERE id_pasajero = :1 AND activa = 1 AND (fecha_fin IS NULL OR fecha_fin > SYSDATE)`,
      [id_pasajero]
    );
    if (banRows.length) return res.status(403).json({ message: 'Pasajero con prohibición activa.', oracle_error: 'ORA-20001' });

    // Generate booking code
    const code = "RES" + Date.now().toString().slice(-8);

    // Insert reservation
    const result = await dbExecute(`
      INSERT INTO reservas (
        id_vuelo, id_pasajero, codigo_reserva, fecha_reserva,
        estado_reserva, clase_servicio, numero_asiento,
        precio_pagado, moneda, checkin_realizado
      ) VALUES (
        :1, :2, :3, SYSTIMESTAMP,
        'CONFIRMADA', :4, :5,
        :6, :7, 0
      )
    `, [id_vuelo, id_pasajero, code, clase_servicio, numero_asiento, precio_pagado, moneda || 'USD']);

    // Decrement available seats
    await dbExecute(
      'UPDATE vuelos SET plazas_vacias = plazas_vacias - 1, plazas_ocupadas = plazas_ocupadas + 1 WHERE id_vuelo = :1',
      [id_vuelo]
    );

    res.status(201).json({ codigo_reserva: code, estado_reserva: 'CONFIRMADA' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message, oracle_error: err.oracle_error });
  }
});

// GET /reservas?id_pasajero= — list passenger bookings
router.get('/', auth(), async (req, res) => {
  try {
    const { id_pasajero } = req.query;
    const rows = await dbQuery(`
      SELECT r.*, v.numero_vuelo, v.aeropuerto_origen, v.aeropuerto_destino,
             TO_CHAR(v.hora_salida_programada,'HH24:MI') AS hora_salida
      FROM   reservas r
      JOIN   programas_vuelo v ON v.id_programa = (SELECT id_programa FROM vuelos WHERE id_vuelo = r.id_vuelo)
      WHERE  r.id_pasajero = :1
      ORDER  BY r.fecha_reserva DESC
    `, [id_pasajero]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /reservas/:codigo/cancelar — cancel booking
router.put('/:codigo/cancelar', auth(), async (req, res) => {
  try {
    const rows = await dbQuery(
      'SELECT id_reserva, id_vuelo, precio_pagado, estado_reserva, fecha_reserva FROM reservas WHERE codigo_reserva = :1',
      [req.params.codigo]
    );
    if (!rows.length) return res.status(404).json({ message: 'Reserva no encontrada.' });
    const r = rows[0];
    if (r.ESTADO_RESERVA === 'CANCELADA') return res.status(409).json({ message: 'Ya cancelada.' });

    // Calculate penalty
    const diasAnticipacion = Math.max(0, (new Date(r.FECHA_RESERVA) - Date.now()) / 86400000);
    const pct = diasAnticipacion >= 7 ? 0 : diasAnticipacion >= 3 ? 0.10 : diasAnticipacion >= 1 ? 0.25 : 0.50;
    const penalizacion = (r.PRECIO_PAGADO || 0) * pct;
    const reembolso    = (r.PRECIO_PAGADO || 0) - penalizacion;

    await dbExecute(
      "UPDATE reservas SET estado_reserva = 'CANCELADA' WHERE id_reserva = :1",
      [r.ID_RESERVA]
    );
    await dbExecute(
      'UPDATE vuelos SET plazas_vacias = plazas_vacias + 1 WHERE id_vuelo = :1',
      [r.ID_VUELO]
    );

    res.json({ mensaje: 'Cancelada exitosamente.', penalizacion, reembolso });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
