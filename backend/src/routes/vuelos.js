/**
 * /api/v1/vuelos — Flights routes
 */
const express = require('express');
const { dbQuery } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /vuelos — list all flights (with optional filters)
router.get('/', auth(), async (req, res) => {
  try {
    const { origen, destino, fecha, estado } = req.query;
    let sql = `
      SELECT v.id_vuelo, p.numero_vuelo,
             p.aeropuerto_origen, p.aeropuerto_destino,
             v.fecha_vuelo,
             TO_CHAR(v.hora_salida_programada, 'HH24:MI') AS hora_salida,
             TO_CHAR(v.hora_llegada_programada,'HH24:MI') AS hora_llegada,
             v.estado_vuelo, v.plazas_vacias, v.plazas_ocupadas,
             v.matricula_avion, v.id_puerta_salida
      FROM   vuelos v
      JOIN   programas_vuelo p ON p.id_programa = v.id_programa
      WHERE  1=1
    `;
    const binds = [];
    let i = 1;
    if (origen) { sql += ` AND UPPER(p.aeropuerto_origen) = UPPER(:${i})`; binds.push(origen); i++; }
    if (destino){ sql += ` AND UPPER(p.aeropuerto_destino) = UPPER(:${i})`; binds.push(destino); i++; }
    if (fecha)  { sql += ` AND v.fecha_vuelo = TO_DATE(:${i}, 'YYYY-MM-DD')`; binds.push(fecha); i++; }
    if (estado) { sql += ` AND v.estado_vuelo = UPPER(:${i})`; binds.push(estado); i++; }
    sql += ' ORDER BY v.hora_salida_programada';

    const rows = await dbQuery(sql, binds);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /vuelos/:id — flight detail
router.get('/:id', auth(), async (req, res) => {
  try {
    const rows = await dbQuery(`
      SELECT v.*, p.numero_vuelo, p.aeropuerto_origen, p.aeropuerto_destino,
             p.duracion_estimada_minutos, p.clase_servicio,
             a.nombre_aerolinea, a.codigo_iata,
             m.nombre_modelo, m.capacidad_pasajeros
      FROM   vuelos v
      JOIN   programas_vuelo p ON p.id_programa = v.id_programa
      JOIN   aerolineas a ON a.id_aerolinea = p.id_aerolinea
      LEFT JOIN modelos_aviones m ON m.id_modelo = v.id_modelo_avion
      WHERE  v.id_vuelo = :1
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Vuelo no encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /vuelos/:id/disponibilidad — seat availability
router.get('/:id/disponibilidad', auth(), async (req, res) => {
  try {
    const rows = await dbQuery(
      'SELECT plazas_vacias, plazas_ocupadas FROM vuelos WHERE id_vuelo = :1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Vuelo no encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
