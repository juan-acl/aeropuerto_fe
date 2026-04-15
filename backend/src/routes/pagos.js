/**
 * /api/v1/pagos — Payments with Stripe simulation
 */
const express = require('express');
const { dbQuery, dbExecute } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Stripe simulation — generates a payment intent and confirms it.
 * In production: replace with real stripe.paymentIntents.create()
 */
async function simulateStripeCharge({ amount, currency, method, card }) {
  await new Promise(r => setTimeout(r, 600)); // simulate network latency
  // Decline card numbers ending in 0000 (test scenario)
  if (card?.number?.endsWith('0000')) {
    throw { code: 'card_declined', message: 'Tarjeta declinada.' };
  }
  return {
    id:         `pi_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    status:     'succeeded',
    amount,
    currency,
    created:    Math.floor(Date.now() / 1000),
  };
}

// POST /pagos/procesar — process payment for a reservation
router.post('/procesar', auth(), async (req, res) => {
  try {
    const { id_reserva, monto, moneda = 'USD', metodo_pago, datos_tarjeta } = req.body;
    if (!id_reserva || !monto || !metodo_pago) {
      return res.status(400).json({ message: 'id_reserva, monto y metodo_pago son requeridos.' });
    }

    // Verify reservation exists and belongs to user (or admin)
    const rows = await dbQuery(
      'SELECT id_reserva, estado_reserva, precio_pagado FROM reservas WHERE id_reserva = :1',
      [id_reserva]
    );
    if (!rows.length) return res.status(404).json({ message: 'Reserva no encontrada.' });

    // Simulate payment gateway
    let intentResult;
    try {
      intentResult = await simulateStripeCharge({
        amount:   Math.round(monto * 100), // cents
        currency: moneda.toLowerCase(),
        method:   metodo_pago,
        card:     datos_tarjeta,
      });
    } catch (stripeErr) {
      return res.status(402).json({
        message: stripeErr.message || 'Pago rechazado.',
        code: stripeErr.code,
      });
    }

    // Record payment
    await dbExecute(`
      INSERT INTO reservas_pagos (id_reserva, monto, moneda, fecha_pago, codigo_transaccion, estado_pago)
      VALUES (:1, :2, :3, SYSTIMESTAMP, :4, 'COMPLETADO')
    `, [id_reserva, monto, moneda, intentResult.id]);

    // Update reservation to CONFIRMADA if PENDIENTE
    await dbExecute(
      "UPDATE reservas SET estado_reserva = 'CONFIRMADA' WHERE id_reserva = :1 AND estado_reserva = 'PENDIENTE'",
      [id_reserva]
    );

    res.json({
      ok: true,
      transaction_id: intentResult.id,
      status:         intentResult.status,
      message:        'Pago procesado exitosamente.',
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// POST /pagos/reembolso — request refund
router.post('/reembolso', auth(), async (req, res) => {
  try {
    const { id_reserva, motivo } = req.body;

    // Get reservation + payment info
    const rows = await dbQuery(`
      SELECT r.estado_reserva, r.precio_pagado, r.fecha_reserva,
             p.codigo_transaccion, p.monto AS monto_pagado
      FROM   reservas r
      LEFT JOIN reservas_pagos p ON p.id_reserva = r.id_reserva AND p.estado_pago = 'COMPLETADO'
      WHERE  r.id_reserva = :1
    `, [id_reserva]);
    if (!rows.length) return res.status(404).json({ message: 'Reserva no encontrada.' });

    const r = rows[0];
    if (r.ESTADO_RESERVA !== 'CANCELADA') {
      return res.status(400).json({ message: 'Solo se pueden reembolsar reservas canceladas.' });
    }

    // Calculate penalty (days between reservation date and today)
    const diasAnticipacion = Math.max(0, (new Date(r.FECHA_RESERVA) - Date.now()) / 86400000);
    const penalizacionPct  = diasAnticipacion >= 7 ? 0 : diasAnticipacion >= 3 ? 0.10
      : diasAnticipacion >= 1 ? 0.25 : 0.50;
    const monto = r.MONTO_PAGADO || r.PRECIO_PAGADO || 0;
    const penalizacion = monto * penalizacionPct;
    const reembolso    = monto - penalizacion;

    // Simulate Stripe refund
    const refundId = `re_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;

    // Update payment record
    await dbExecute(`
      UPDATE reservas_pagos SET estado_pago = 'REEMBOLSADO' WHERE id_reserva = :1
    `, [id_reserva]);

    res.json({
      ok:          true,
      refund_id:   refundId,
      monto_reembolsado: reembolso,
      penalizacion,
      penalizacion_pct:  penalizacionPct * 100,
      message:     'Reembolso procesado. Acreditación en 3-5 días hábiles.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
