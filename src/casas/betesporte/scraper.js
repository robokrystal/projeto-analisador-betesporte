const config = require('./config');

/**
 * Extrai super odds da página da Betesporte
 * @param {Page} page - Página do Puppeteer
 * @returns {Promise<{odds: Array, debug: Object}>}
 */
async function extrairSuperOdds(page) {
  const { SELETORES, URL } = config;

  const superOdds = await page.evaluate((seletores, url) => {
    const odds = [];
    const debug = {
      totalCards: 0,
      cardsComSuperOdd: 0,
      jogosEncontrados: 0
    };

    // Procurar pelo card que contém "Super ODD" no header
    const countryCards = document.querySelectorAll(seletores.countryCards);
    debug.totalCards = countryCards.length;

    countryCards.forEach((card) => {
      // Verificar se o header contém "Super ODD"
      const header = card.querySelector(seletores.header);
      if (header) {
        const textoHeader = header.textContent?.trim() || '';

        // Se encontrou "Super ODD" no header, pegar todos os jogos desse card
        if (textoHeader.includes('Super ODD')) {
          debug.cardsComSuperOdd++;

          // Pegar todos os jogos dentro desse countryCard
          const jogos = card.querySelectorAll(seletores.jogos);
          debug.jogosEncontrados += jogos.length;

          jogos.forEach((jogo) => {
            // Extrair nome do evento
            const nomeEvento = jogo.querySelector(seletores.nomeEvento)?.textContent?.trim() || 'Evento não identificado';

            // Extrair valor da odd
            const valorOdd = jogo.querySelector(seletores.valorOdd)?.textContent?.trim() || '';

            // Extrair data e hora
            const dia = jogo.querySelector(seletores.dia)?.textContent?.trim() || '';
            const hora = jogo.querySelector(seletores.hora)?.textContent?.trim() || '';
            const dataHora = dia && hora ? `${dia} às ${hora}` : '';

            if (valorOdd && nomeEvento) {
              odds.push({
                evento: nomeEvento,
                valor: valorOdd.replace(',', '.'),
                tipo: 'Super Odd',
                dataHora: dataHora,
                link: url,
                casa: 'Betesporte'
              });
            }
          });
        }
      }
    });

    return { odds, debug };
  }, SELETORES, URL);

  return superOdds;
}

/**
 * Monitora a Betesporte e retorna super odds encontradas
 * @param {Page} page - Página do Puppeteer
 * @returns {Promise<Array>}
 */
async function monitorar(page) {
  const { URL } = config;

  // Acessar o site
  await page.goto(URL, {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  console.log('✅ [Betesporte] Página carregada, aguardando 3 segundos extras...');
  await new Promise(resolve => setTimeout(resolve, 3000)); // Aguardar conteúdo dinâmico

  // Buscar super odds
  const resultado = await extrairSuperOdds(page);

  // Exibir informações de debug
  console.log('\n🔍 [Betesporte] DEBUG INFO:');
  console.log(`   Total de countryCards encontrados: ${resultado.debug.totalCards}`);
  console.log(`   Cards com "Super ODD": ${resultado.debug.cardsComSuperOdd}`);
  console.log(`   Jogos encontrados: ${resultado.debug.jogosEncontrados}`);

  return resultado.odds;
}

module.exports = {
  monitorar,
  config
};
