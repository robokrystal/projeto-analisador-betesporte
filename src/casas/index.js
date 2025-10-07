const betesporte = require('./betesporte/scraper');

/**
 * Lista de todas as casas de apostas disponíveis
 */
const casasDisponiveis = {
  betesporte
  // Adicionar novas casas aqui no futuro:
  // bet365: require('./bet365/scraper'),
  // etc...
};

/**
 * Monitora todas as casas de apostas ativas
 * @param {Page} page - Página do Puppeteer
 * @param {Array<string>} casasAtivas - Lista de casas para monitorar (padrão: todas)
 * @returns {Promise<Array>} - Todas as odds encontradas de todas as casas
 */
async function monitorarTodasCasas(page, casasAtivas = ['betesporte']) {
  const todasOdds = [];

  for (const nomeCasa of casasAtivas) {
    const casa = casasDisponiveis[nomeCasa];

    if (!casa) {
      console.warn(`⚠️ Casa "${nomeCasa}" não encontrada`);
      continue;
    }

    try {
      console.log(`\n🏠 Monitorando ${nomeCasa.toUpperCase()}...`);
      const odds = await casa.monitorar(page);
      todasOdds.push(...odds);
    } catch (erro) {
      console.error(`❌ Erro ao monitorar ${nomeCasa}:`, erro.message);
    }
  }

  return todasOdds;
}

/**
 * Obtém configuração de uma casa específica
 */
function obterConfig(nomeCasa) {
  const casa = casasDisponiveis[nomeCasa];
  return casa ? casa.config : null;
}

module.exports = {
  monitorarTodasCasas,
  obterConfig,
  casasDisponiveis
};
