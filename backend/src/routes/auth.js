/**
 * /api/v1/auth — Authentication routes
 */
const express    = require('express');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const { dbQuery, dbExecute } = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'aurora-secret';

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;
    if (!usuario || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña requeridos.' });
    }

    const rows = await dbQuery(
      `SELECT u.id_usuario_sistema, u.nombre_usuario, u.password_hash,
              u.activo, u.bloqueado, u.intentos_fallidos,
              e.nombres || ' ' || e.apellidos AS nombre_completo,
              e.email_institucional AS email
       FROM   usuarios_sistema u
       LEFT JOIN empleados e ON e.id = u.id_empleado
       WHERE  LOWER(u.nombre_usuario) = LOWER(:1)`,
      [usuario]
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const u = rows[0];
    if (u.BLOQUEADO === 1) {
      return res.status(403).json({ message: 'Cuenta bloqueada. Contacta al administrador.' });
    }
    if (u.ACTIVO === 0) {
      return res.status(403).json({ message: 'Cuenta inactiva.' });
    }

    const valid = await bcrypt.compare(password, u.PASSWORD_HASH || '');
    if (!valid) {
      // Increment failed attempts
      await dbExecute(
        'UPDATE usuarios_sistema SET intentos_fallidos = intentos_fallidos + 1 WHERE id_usuario_sistema = :1',
        [u.ID_USUARIO_SISTEMA]
      );
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    // Reset failed attempts + update last access
    await dbExecute(
      `UPDATE usuarios_sistema
       SET intentos_fallidos = 0, ultimo_acceso = SYSTIMESTAMP
       WHERE id_usuario_sistema = :1`,
      [u.ID_USUARIO_SISTEMA]
    );

    const payload = {
      id:       u.ID_USUARIO_SISTEMA,
      nombre:   u.NOMBRE_COMPLETO || u.NOMBRE_USUARIO,
      email:    u.EMAIL,
      usuario:  u.NOMBRE_USUARIO,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

    res.json({ token, usuario: payload });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
