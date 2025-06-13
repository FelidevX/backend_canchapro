const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"CanchaPro" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Correo enviado a ${to}`);
  } catch (error) {
    console.error('Error al enviar correo:', error);
    throw error;
  }
};

module.exports = { sendEmail };