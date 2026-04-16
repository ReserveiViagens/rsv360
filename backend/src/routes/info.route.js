const express = require('express');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    name: 'RSV360 PMS/CRM',
    version: 'fase-4',
    author: 'Douglas P. Figueiredo',
    email: 'douglas@reserveiviagens.com.br',
    organization: 'Reservei Viagens LTDA',
    websites: [
      'https://www.reserveiviagens.com.br',
      'https://www.reserveiviagens.com',
      'https://www.rsv360.com.br',
      'https://www.rsv360.com',
    ],
    social: {
      instagram: 'https://www.instagram.com/reserveiviagens',
      facebook: 'https://www.facebook.com/reserveiviagens',
      linkedin: 'https://www.linkedin.com/company/reserveiviagens',
    },
    copyright: '© 2024-2026 Reservei Viagens LTDA',
  });
});

module.exports = { infoRouter: router };
