/**
 * /api/v1/checkin — Check-in digital routes
 */
const express = require('express');
const { dbQuery, dbExecute } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /checkin — perform digital check-in
router.post('/', auth(), async (req, res) => {
  try {
    const { codigo_reserva, asiento_seleccionado, equipaje_declarado_kg } = req.body;

    // Load reservation
    const rows = await dbQuery(`
      SELECT r.id_reserva, r.id_vuelo, r.id_pasajero, r.estado_reserva,
             r.checkin_realizado, r.numero_asiento,
             v.hora_salida_programada, v.estado_vuelo
      FROM   reservas r
      JOIN   vuelos v ON v.id_vuelo = r.id_vuelo
      WHERE  r.codigo_reserva = UPPER(:1)
    `, [codigo_reserva]);

    if (!rows.length) return res.status(404).json({ message: 'Reserva no encontrada.' });
    const r = rows[0];

    // Business rules
    if (r.CHECKIN_REALIZADO === 1) {
      return res.status(409).json({ message: 'El check-in ya fue realizado.' });
    }
    if (r.ESTADO_RESERVA === 'CANCELADA') {
      return res.status(400).json({ message: 'La reserva está cancelada.' });
    }
    if (r.ESTADO_VUELO === 'CANCELADO') {
      return res.status(400).json({ message: 'El vuelo fue cancelado.' });
    }

    // Validate time window: 24h before to 45min before departure
    const salida = new Date(r.HORA_SALIDA_PROGRAMADA);
    const ahora  = new Date();
    const diffMin = (salida - ahora) / 60000;
    if (diffMin > 24 * 60) {
      return res.status(400).json({ message: `El check-in abre 24 horas antes del vuelo.` });
    }
    if (diffMin < 45) {
      return res.status(400).json({ message: 'El check-in cerró (menos de 45 minutos para el vuelo).' });
    }

    // Check passenger ban
    const ban = await dbQuery(
      "SELECT 1 FROM prohibiciones_vuelo WHERE id_pasajero = :1 AND activa = 1 AND (fecha_fin IS NULL OR fecha_fin > SYSDATE)",
      [r.ID_PASAJERO]
    );
    if (ban.length) return res.status(403).json({ message: 'Pasajero con prohibición activa.' });

    // Create checkin record
    await dbExecute(`
      INSERT INTO checkin_digital (
        id_reserva, fecha_checkin, canal, asiento_seleccionado,
        equipaje_declarado_kg, documentos_verificados, estado
      ) VALUES (:1, SYSTIMESTAMP, 'APP', :2, :3, 1, 'COMPLETADO')
    `, [r.ID_RESERVA, asiento_seleccionado || r.NUMERO_ASIENTO, equipaje_declarado_kg || 0]);

    // Update reservation
    await dbExecute(`
      UPDATE reservas
      SET checkin_realizado = 1, fecha_checkin = SYSTIMESTAMP,
          estado_reserva = 'CHECK_IN',
          numero_asiento = NVL(:1, numero_asiento)
      WHERE id_reserva = :2
    `, [asiento_seleccionado, r.ID_RESERVA]);

    // Generate boarding pass code
    const barcode = `BP${Date.now().toString().slice(-10)}${r.ID_RESERVA}`;

    res.json({
      ok: true,
      boarding_pass: {
        codigo_barras: barcode,
        numero_asiento: asiento_seleccionado || r.NUMERO_ASIENTO,
        estado: 'COMPLETADO',
      },
      message: 'Check-in completado exitosamente.',
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// GET /checkin/:codigo — verify boarding pass
router.get('/:codigo', auth(), async (req, res) => {
  try {
    const rows = await dbQuery(`
      SELECT c.*, r.codigo_reserva, r.numero_asiento,
             p.numero_vuelo, p.aeropuerto_origen, p.aeropuerto_destino,
             TO_CHAR(v.hora_salida_programada,'DD/MM/YYYY HH24:MI') AS hora_salida
      FROM   checkin_digital c
      JOIN   reservas r ON r.id_reserva = c.id_reserva
      JOIN   vuelos v   ON v.id_vuelo = r.id_vuelo
      JOIN   programas_vuelo p ON p.id_programa = v.id_programa
      WHERE  r.codigo_reserva = UPPER(:1)
    `, [req.params.codigo]);

    if (!rows.length) return res.status(404).json({ message: 'Check-in no encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
