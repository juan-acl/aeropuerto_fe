/**
 * Express Server — Aeropuerto La Aurora API
 * node src/server.js
 */
const { app, initOracle } = require('./db');
const authRoutes    = require('./routes/auth');
const vuelosRoutes  = require('./routes/vuelos');
const reservasRoutes= require('./routes/reservas');

const PORT = process.env.PORT || 4000;

// Mount routes
app.use('/api/v1/auth',    authRoutes);
app.use('/api/v1/vuelos',  vuelosRoutes);
app.use('/api/v1/reservas',reservasRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404
app.use((_, res) => res.status(404).json({ message: 'Endpoint no encontrado.' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    message: err.message,
    oracle_error: err.oracle_error,
  });
});

// Start
initOracle().then(() => {
  app.listen(PORT, () => console.log(`[SERVER] Running on http://localhost:${PORT}`));
});
