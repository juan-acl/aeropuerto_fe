/**
 * Backend — Node.js + Express + OracleDB
 * Conecta al backend Oracle de gestión aeroportuaria.
 *
 * Setup:
 *   cd backend
 *   npm install express oracledb cors dotenv jsonwebtoken bcryptjs
 *   node src/index.js
 *
 * .env:
 *   ORACLE_USER=aurora_admin
 *   ORACLE_PASSWORD=secret
 *   ORACLE_CONNECT=localhost:1521/AURORA
 *   JWT_SECRET=super-secret-key-2024
 *   PORT=4000
 */

const express    = require('express');
const cors       = require('cors');
const dotenv     = require('dotenv');
const oracledb   = require('oracledb');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ─── Oracle Connection Pool ───────────────────────────────────────────────────
let pool;

async function initOracle() {
  try {
    pool = await oracledb.createPool({
      user:             process.env.ORACLE_USER,
      password:         process.env.ORACLE_PASSWORD,
      connectString:    process.env.ORACLE_CONNECT,
      poolMin:          2,
      poolMax:          10,
      poolIncrement:    2,
      poolTimeout:      60,
      // Thin mode (no Oracle client needed — pure JS):
    });
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    console.log('[DB] Oracle pool initialized');
  } catch (err) {
    console.error('[DB] Failed to initialize Oracle pool:', err);
    process.exit(1);
  }
}

// Helper — execute a query and return rows
async function dbQuery(sql, binds = [], options = {}) {
  const conn = await pool.getConnection();
  try {
    const result = await conn.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      ...options,
    });
    return result.rows ?? [];
  } finally {
    await conn.close();
  }
}

// Helper — execute DML (INSERT/UPDATE/DELETE) with auto-commit
async function dbExecute(sql, binds = []) {
  const conn = await pool.getConnection();
  try {
    const result = await conn.execute(sql, binds, { autoCommit: true });
    return result;
  } catch (err) {
    // Parse Oracle errors into friendly messages
    const oraCode = err.message?.match(/ORA-(\d+)/)?.[0];
    const MESSAGES = {
      'ORA-00001': 'Registro duplicado.',
      'ORA-02291': 'Referencia foránea no existe.',
      'ORA-20001': 'Pasajero con prohibición activa.',
      'ORA-20002': 'Asiento ya ocupado.',
      'ORA-20003': 'Vuelo sin disponibilidad.',
    };
    const friendly = oraCode ? MESSAGES[oraCode] : null;
    const enhanced = new Error(friendly ?? err.message);
    enhanced.oracle_error = oraCode;
    enhanced.status = 400;
    throw enhanced;
  } finally {
    await conn.close();
  }
}

module.exports = { app, initOracle, dbQuery, dbExecute };
