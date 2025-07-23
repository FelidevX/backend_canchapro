const { Preference } = require('mercadopago');

// Inicializa la instancia Preference con tu token
const preference = new Preference({ accessToken: process.env.MP_TOKEN });

async function crearPreferenciaReserva(reserva) {
  const preferenceData = {
    items: [
      {
        title: 'Reserva de cancha',
        quantity: 1,
        currency_id: 'ARS',
        unit_price: Number(reserva.precio)
      }
    ],
    back_urls: {
      success: 'https://canchapro.onrender.com/pago-exitoso',
      failure: 'https://canchapro.onrender.com/pago-fallido',
      pending: 'https://canchapro.onrender.com/pago-pendiente'
    },
    auto_return: 'approved'
  };

  const response = await preference.create({ body: preferenceData });
  return response.init_point;
}

module.exports = { crearPreferenciaReserva };