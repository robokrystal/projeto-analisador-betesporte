const https = require('https');

// TODO: Descobrir a URL da API da Sportingbet
// Instruções:
// 1. Abrir https://www.sportingbet.com no navegador
// 2. Pressionar F12 → Aba Network
// 3. Filtrar por XHR/Fetch
// 4. Procurar requisições que retornam odds
// 5. Copiar a URL e Headers
const API_URL = 'https://www.sportingbet.com/api/...'; // SUBSTITUIR pela URL real

// Função para buscar Super Odds via API
async function buscarSuperOdds() {
  // Por enquanto retorna vazio (não configurado)
  return Promise.resolve([]);
}

module.exports = {
  nome: 'Sportingbet',
  buscarSuperOdds
};
