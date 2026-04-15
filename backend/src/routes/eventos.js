/**
 * /api/v1/eventos — User event tracking
 * Stores events in analisis_comportamiento (Oracle) for ML pipeline
 */
const express = require('express');
const { dbExecute, dbQuery } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

const VALID_EVENTS = new Set([
  'PAGE_VIEW','FLIGHT_SEARCH','FLIGHT_CLICK','HOTEL_VIEW',
  'PROMO_CLICK','BOOKING_START','BOOKING_COMPLETE','BOOKING_ABANDON',
  'CHECKIN_START','CHECKIN_COMPLETE','CANCELLATION','REFUND_REQUEST',
  'LOYALTY_REDEEM','UPGRADE_ACCEPT','SEARCH_NO_RESULT',
]);

// POST /eventos — record a batch of events (fire-and-forget from client)
router.post('/', auth(), async (req, res) => {
  // Respond immediately — don't block client
  res.json({ ok: true });

  // Process async
  const events = Array.isArray(req.body) ? req.body : [req.body];
  for (const ev of events) {
    if (!VALID_EVENTS.has(ev.eventType)) continue;
    try {
      await dbExecute(`
        INSERT INTO analisis_comportamiento (
          id_pasajero, tipo_evento, metadata_json,
          timestamp_evento, session_id, duracion_pantalla_seg
        ) VALUES (:1, :2, :3, SYSTIMESTAMP, :4, :5)
      `, [
        ev.userId || req.user.id,
        ev.eventType,
        JSON.stringify(ev.metadata || {}),
        ev.sessionId || 'unknown',
        ev.screenDuration || 0,
      ]);
    } catch { /* non-critical */ }
  }
});

// GET /eventos/:userId/resumen — ML feature summary for a user
router.get('/:userId/resumen', auth(), async (req, res) => {
  try {
    const rows = await dbQuery(`
      SELECT tipo_evento, COUNT(*) AS cantidad,
             AVG(duracion_pantalla_seg) AS avg_duracion
      FROM   analisis_comportamiento
      WHERE  id_pasajero = :1
        AND  timestamp_evento >= SYSDATE - 30
      GROUP  BY tipo_evento
      ORDER  BY cantidad DESC
    `, [req.params.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
