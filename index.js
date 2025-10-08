const WebSocket = require('ws');

// Configurações
const INTERVALO_MIN = 1000; // 1 segundo
const INTERVALO_MAX = 2000; // 2 segundos
const WS_URL = process.env.WS_URL || 'wss://ectopic-rounded-izabella.ngrok-free.dev';

// Importar scrapers de todas as plataformas
// Para ativar uma casa, descomente a linha correspondente
const scrapers = [
  require('./src/scrapers/betesporte'),      // ✅ Ativa (configurada)
  // require('./src/scrapers/bet365'),       // ⏳ Aguardando configuração
  // require('./src/scrapers/betano'),       // ⏳ Aguardando configuração
  // require('./src/scrapers/novibet'),      // ⏳ Aguardando configuração
  // require('./src/scrapers/bolsadeaposta'),// ⏳ Aguardando configuração
  // require('./src/scrapers/fulltbet'),     // ⏳ Aguardando configuração
  // require('./src/scrapers/betbra'),       // ⏳ Aguardando configuração
  // require('./src/scrapers/multibet'),     // ⏳ Aguardando configuração
  // require('./src/scrapers/pixbet'),       // ⏳ Aguardando configuração
  // Adicione novos scrapers aqui conforme implementar
];

const oddsDetectadas = new Map();
let ws;
let wsConectado = false;

function conectarWebSocket(tentativa = 1, maxTentativas = 5) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Tentativa ${tentativa}/${maxTentativas} de conexão...`);
    ws = new WebSocket(WS_URL);
    let timeoutId;

    ws.on('open', () => {
      console.log('✅ Conectado ao servidor WebSocket');
      wsConectado = true;
      clearTimeout(timeoutId);
      resolve();
    });

    ws.on('error', (erro) => {
      console.error('❌ Erro WebSocket:', erro.message);
      wsConectado = false;
    });

    ws.on('close', () => {
      console.log('⚠️ Desconectado do WebSocket, reconectando em 5s...');
      wsConectado = false;
      setTimeout(() => conectarWebSocket(), 5000);
    });

    timeoutId = setTimeout(() => {
      if (!wsConectado) {
        ws.terminate();
        if (tentativa < maxTentativas) {
          console.log(`⏳ Timeout! Tentando novamente em 3s...`);
          setTimeout(() => {
            conectarWebSocket(tentativa + 1, maxTentativas)
              .then(resolve)
              .catch(reject);
          }, 3000);
        } else {
          reject(new Error(`Falha ao conectar após ${maxTentativas} tentativas`));
        }
      }
    }, 30000);
  });
}

function enviarAlerta(superOdd, isNova = true) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    const mensagem = JSON.stringify({
      tipo: 'super_odd',
      dados: { ...superOdd, isNova },
      timestamp: new Date().toISOString()
    });
    ws.send(mensagem);
    if (isNova) {
      console.log(`🔔 ALERTA NOVA: ${superOdd.casa} - ${superOdd.evento} - Odd: ${superOdd.valor}`);
    }
  }
}

async function monitorarTodasPlataformas() {
  console.log('🚀 Iniciando monitoramento MULTI-PLATAFORMA...');
  console.log(`📊 Plataformas ativas: ${scrapers.map(s => s.nome).join(', ')}`);
  console.log(`⚡ Intervalo: ${INTERVALO_MIN / 1000}s - ${INTERVALO_MAX / 1000}s`);

  await conectarWebSocket();

  let verificacaoCount = 0;

  while (true) {
    try {
      verificacaoCount++;
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📋 VERIFICAÇÃO #${verificacaoCount} - ${new Date().toLocaleTimeString()}.${new Date().getMilliseconds()}`);
      console.log('='.repeat(60));

      // Buscar odds de TODAS as plataformas em paralelo
      const promessas = scrapers.map(scraper =>
        scraper.buscarSuperOdds()
          .then(odds => ({ scraper: scraper.nome, odds }))
          .catch(erro => {
            console.error(`❌ Erro em ${scraper.nome}:`, erro.message);
            return { scraper: scraper.nome, odds: [] };
          })
      );

      const resultados = await Promise.all(promessas);

      // Consolidar todas as odds
      const todasOdds = resultados.flatMap(r => r.odds);

      if (todasOdds.length > 0) {
        console.log(`\n🎯 ${todasOdds.length} super odd(s) encontrada(s) no total`);

        // Mostrar resumo por plataforma
        resultados.forEach(r => {
          if (r.odds.length > 0) {
            console.log(`   ${r.scraper}: ${r.odds.length} odd(s)`);
          }
        });

        todasOdds.forEach((odd) => {
          const chaveEvento = `${odd.casa}:${odd.evento}`;
          const agora = Date.now();

          const oddAnterior = oddsDetectadas.get(chaveEvento);

          if (!oddAnterior) {
            // Nova Super ODD detectada
            console.log(`🆕 Nova Super ODD: [${odd.casa}] ${odd.evento} - ${odd.valor}`);
            oddsDetectadas.set(chaveEvento, { valor: odd.valor, timestamp: agora });
            enviarAlerta(odd, true);

          } else if (oddAnterior.valor !== odd.valor) {
            // Valor da odd mudou!
            console.log(`📈 Odd alterada: [${odd.casa}] ${odd.evento} | ${oddAnterior.valor} → ${odd.valor}`);
            oddsDetectadas.set(chaveEvento, { valor: odd.valor, timestamp: agora });

            enviarAlerta({
              ...odd,
              tipo: `Super Odd Alterada (${oddAnterior.valor} → ${odd.valor})`
            }, true);

          } else {
            // Mesma odd, apenas atualizar timestamp
            oddsDetectadas.set(chaveEvento, { valor: odd.valor, timestamp: agora });
            enviarAlerta(odd, false);
          }
        });

        // Limpar cache de odds antigas (> 30 min)
        for (const [chave, dados] of oddsDetectadas.entries()) {
          if (Date.now() - dados.timestamp > 1800000) {
            console.log(`🗑️ Removendo odd antiga do cache: ${chave}`);
            oddsDetectadas.delete(chave);
          }
        }
      } else {
        console.log('\n⏳ Nenhuma super odd encontrada neste momento');
      }

    } catch (erro) {
      console.error('❌ Erro geral:', erro.message);
    }

    const intervaloAleatorio = Math.floor(Math.random() * (INTERVALO_MAX - INTERVALO_MIN + 1)) + INTERVALO_MIN;
    console.log(`⏰ Aguardando ${intervaloAleatorio / 1000}s para próxima verificação...\n`);
    await new Promise(resolve => setTimeout(resolve, intervaloAleatorio));
  }
}

monitorarTodasPlataformas();
