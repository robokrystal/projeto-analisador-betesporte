// Configurações específicas da Betesporte
module.exports = {
  URL: 'https://betesporte.bet.br/sports/desktop/sport-league/999/4200000001',
  NOME: 'Betesporte',

  // Seletores CSS para extrair dados
  SELETORES: {
    countryCards: '.countryCard',
    header: '.countryCard-name',
    jogos: '.countryCard-game',
    nomeEvento: '.homeTeam .name',
    valorOdd: '.oddValue',
    dia: '.countryCard-game-date-day',
    hora: '.countryCard-game-date-time'
  }
};
