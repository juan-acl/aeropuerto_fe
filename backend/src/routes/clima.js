/**
 * External APIs simulation layer
 * In production: replace with real API calls to:
 *   - OpenWeatherMap: https://api.openweathermap.org/data/2.5/weather
 *   - Amadeus Hotels: https://api.amadeus.com/v3/shopping/hotel-offers
 *   - Stripe: https://api.stripe.com/v1/payment_intents
 */

const WEATHER_DB = {
  GUA: { ciudad: 'Ciudad de Guatemala', temp: 22, humedad: 65, descripcion: 'Parcialmente nublado', icono: '⛅' },
  MIA: { ciudad: 'Miami',               temp: 28, humedad: 78, descripcion: 'Soleado',              icono: '☀️' },
  BOG: { ciudad: 'Bogotá',              temp: 15, humedad: 72, descripcion: 'Lluvia ligera',         icono: '🌧️' },
  MEX: { ciudad: 'Ciudad de México',    temp: 18, humedad: 60, descripcion: 'Nublado',               icono: '☁️' },
  LAX: { ciudad: 'Los Angeles',         temp: 24, humedad: 55, descripcion: 'Despejado',             icono: '☀️' },
  MAD: { ciudad: 'Madrid',              temp: 12, humedad: 70, descripcion: 'Variable',              icono: '🌤️' },
  FRS: { ciudad: 'Flores, Petén',       temp: 30, humedad: 85, descripcion: 'Caluroso y húmedo',     icono: '🌡️' },
};

/**
 * GET /api/v1/clima/:codigoIATA
 * Returns weather for destination airport city.
 */
const express = require('express');
const router  = express.Router();

router.get('/:codigo', (req, res) => {
  const data = WEATHER_DB[req.params.codigo.toUpperCase()];
  if (!data) return res.status(404).json({ message: 'Aeropuerto no encontrado.' });

  // Add some realistic variation
  const variation = Math.round((Math.random() - 0.5) * 4);
  res.json({
    ...data,
    temp: data.temp + variation,
    viento_kmh: Math.round(8 + Math.random() * 20),
    visibilidad_km: Math.round(8 + Math.random() * 10),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
