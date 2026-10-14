/**
 * NIGHT OF TANGO — publication data.
 * Events are intentionally empty until actual dates, venues, show format
 * and their reservation URLs are confirmed by SushiClub.
 *
 * Example:
 * { id:"recoleta-2026-11-13", date:"13 NOV", time:"21:00",
 *   venue:"SushiClub Recoleta", format:"minimal",
 *   bookingUrl:"https://www.sushiclub.com.ar/shop_reservas.php" }
 *
 * Do not publish invented dates or promise dancing for "minimal".
 */
window.NOCHE_TANGO_CONFIG = Object.freeze({
  reservationUrl: "https://www.sushiclub.com.ar/shop_reservas.php",
  currency: "ARS",
  price: 79000,
  events: []
});
