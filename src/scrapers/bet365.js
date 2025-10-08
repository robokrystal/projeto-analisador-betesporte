const https = require('https');

// TODO: Descobrir a URL da API da Bet365
const API_URL = 'https://www.bet365.com/api/...';

async function buscarSuperOdds() {
  // Por enquanto retorna vazio (não configurado)
  return Promise.resolve([]);
}

module.exports = {
  nome: 'Bet365',
  buscarSuperOdds
};
