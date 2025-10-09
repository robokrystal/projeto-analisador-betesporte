const https = require('https');

// URL da API REAL da BetEsporte
const API_URL = 'https://betesporte.bet.br/api/PreMatch/GetEvents?sportId=999&tournamentId=4200000001';

// Função para buscar Super Odds via API
async function buscarSuperOdds() {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    };

    https.get(API_URL, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const superOdds = [];

          // Processar resposta da API
          if (json.data && json.data.countries) {
            json.data.countries.forEach(country => {
              if (country.name === 'Super ODD') {
                country.tournaments.forEach(tournament => {
                  tournament.events.forEach(event => {
                    event.markets.forEach(market => {
                      market.options.forEach(option => {
                        // A API da BetEsporte já retorna em horário de Brasília
                        superOdds.push({
                          evento: event.homeTeamName,
                          tipo: market.name,
                          valor: option.odd.toString().replace('.', ','),
                          casa: 'BetEsporte',
                          dataHora: new Date(event.date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
                          link: `https://betesporte.bet.br/sports/desktop/pre-match-detail/999/4200000001/${event.id}`
                        });
                      });
                    });
                  });
                });
              }
            });
          }

          resolve(superOdds);
        } catch (erro) {
          reject(erro);
        }
      });
    }).on('error', reject);
  });
}

module.exports = {
  nome: 'BetEsporte',
  buscarSuperOdds
};
