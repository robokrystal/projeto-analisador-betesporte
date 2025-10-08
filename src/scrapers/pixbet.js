const https = require('https');

// TODO: Descobrir a URL da API da Pixbet
const API_URL = 'https://www.pixbet.com/api/...';

async function buscarSuperOdds() {
  // Por enquanto retorna vazio (não configurado)
  return Promise.resolve([]);
}

module.exports = {
  nome: 'Pixbet',
  buscarSuperOdds
};
