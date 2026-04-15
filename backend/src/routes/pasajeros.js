/**
 * /api/v1/pasajeros — Passenger CRUD routes
 */
const express  = require('express');
const bcrypt   = require('bcryptjs');
const { dbQuery, dbExecute } = require('../db');
const auth     = require('../middleware/auth');

const router = express.Router();

// GET /pasajeros/:id — passenger profile
router.get('/:id', auth(), async (req, res) => {
  try {
    const rows = await dbQuery(`
      SELECT p.*, pv.tipo_perfil, pv.preferencias_asiento, pv.preferencias_comida,
             pv.nivel_lealtad, pl.puntos_acumulados, pl.nivel_membresia
      FROM   pasajeros p
      LEFT JOIN perfiles_viajero pv ON pv.id_pasajero = p.id_pasajero
      LEFT JOIN programa_lealtad pl ON pl.id_pasajero  = p.id_pasajero
      WHERE  p.id_pasajero = :1
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ message: 'Pasajero no encontrado.' });
    // Remove sensitive fields for non-admin
    const p = rows[0];
    if (req.user.rol !== 'ADMIN' && String(req.user.id) !== String(req.params.id)) {
      delete p.HISTORIAL_MEDICO;
    }
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /pasajeros/:id — update passenger profile
router.put('/:id', auth(), async (req, res) => {
  try {
    const { nombres, apellidos, email, telefono, ciudad_residencia } = req.body;
    await dbExecute(`
      UPDATE pasajeros SET
        nombres           = NVL(:1, nombres),
        apellidos         = NVL(:2, apellidos),
        email             = NVL(:3, email),
        telefono          = NVL(:4, telefono),
        ciudad_residencia = NVL(:5, ciudad_residencia)
      WHERE id_pasajero = :6
    `, [nombres, apellidos, email, telefono, ciudad_residencia, req.params.id]);

    res.json({ ok: true, message: 'Perfil actualizado.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// POST /pasajeros/registro — create new passenger account
router.post('/registro', async (req, res) => {
  try {
    const { nombres, apellidos, tipo_documento, numero_documento,
            fecha_nacimiento, nacionalidad, email, telefono, password } = req.body;

    // Check duplicate email
    const existing = await dbQuery(
      'SELECT 1 FROM pasajeros WHERE LOWER(email) = LOWER(:1)', [email]
    );
    if (existing.length) return res.status(409).json({ message: 'Email ya registrado.' });

    // Hash password (if storing in pasajeros; in real system use usuarios_sistema)
    const passwordHash = await bcrypt.hash(password, 12);

    await dbExecute(`
      INSERT INTO pasajeros (
        nombres, apellidos, tipo_documento, numero_documento,
        fecha_nacimiento, nacionalidad, email, telefono, activo
      ) VALUES (:1, :2, :3, :4, TO_DATE(:5,'YYYY-MM-DD'), :6, :7, :8, 1)
    `, [nombres, apellidos, tipo_documento || 'PASAPORTE', numero_documento,
        fecha_nacimiento, nacionalidad, email, telefono]);

    // Also create usuario_sistema entry
    const pasajeroRows = await dbQuery(
      "SELECT id_pasajero FROM pasajeros WHERE LOWER(email) = LOWER(:1)", [email]
    );
    const idPasajero = pasajeroRows[0]?.ID_PASAJERO;
    if (idPasajero) {
      const usuario = email.split('@')[0].toLowerCase().replace(/[^a-z0-9.]/g, '');
      await dbExecute(`
        INSERT INTO usuarios_sistema (nombre_usuario, email_institucional, password_hash, activo, intentos_fallidos, bloqueado)
        VALUES (:1, :2, :3, 1, 0, 0)
      `, [usuario, email, passwordHash]).catch(() => {}); // ignore if username taken
    }

    res.status(201).json({ ok: true, message: 'Cuenta creada exitosamente. Puedes iniciar sesión.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// GET /pasajeros/:id/historial — booking history
router.get('/:id/historial', auth(), async (req, res) => {
  try {
    const rows = await dbQuery(`
      SELECT r.id_reserva, r.codigo_reserva, r.fecha_reserva,
             r.estado_reserva, r.clase_servicio, r.numero_asiento, r.precio_pagado, r.moneda,
             p.numero_vuelo, p.aeropuerto_origen, p.aeropuerto_destino,
             TO_CHAR(v.hora_salida_programada, 'DD/MM/YYYY HH24:MI') AS hora_salida
      FROM   reservas r
      JOIN   vuelos v ON v.id_vuelo = r.id_vuelo
      JOIN   programas_vuelo p ON p.id_programa = v.id_programa
      WHERE  r.id_pasajero = :1
      ORDER  BY r.fecha_reserva DESC
      FETCH FIRST 50 ROWS ONLY
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
