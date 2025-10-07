const puppeteer = require('puppeteer');
const WebSocket = require('ws');
const { monitorarTodasCasas } = require('./src/casas');

// Configurações
const INTERVALO_MIN = 4000; // 4 segundos (mínimo)
const INTERVALO_MAX = 7000; // 7 segundos (máximo)
// Altere para a URL do Fly.io após deploy
const WS_URL = process.env.WS_URL || 'wss://betesporte-server.fly.dev';
const CASAS_ATIVAS = ['betesporte']; // Adicionar outras casas aqui: ['betesporte', 'bet365', ...]

// Armazena as super odds já detectadas para evitar duplicatas
// Estrutura: { "nome-evento": { valor: "6.10", timestamp: 123456 } }
const oddsDetectadas = new Map();

// Conectar ao servidor WebSocket
let ws;
let wsConectado = false;

function conectarWebSocket() {
  return new Promise((resolve, reject) => {
    ws = new WebSocket(WS_URL);

    ws.on('open', () => {
      console.log('✅ Conectado ao servidor WebSocket');
      wsConectado = true;
      resolve();
    });

    ws.on('error', (erro) => {
      console.error('❌ Erro WebSocket:', erro.message);
      wsConectado = false;
    });

    ws.on('close', () => {
      console.log('⚠️ Desconectado do WebSocket, reconectando em 5s...');
      wsConectado = false;
      setTimeout(conectarWebSocket, 5000);
    });

    // Timeout de 10 segundos
    setTimeout(() => {
      if (!wsConectado) {
        reject(new Error('Timeout ao conectar WebSocket'));
      }
    }, 10000);
  });
}

// Função para enviar alerta ao servidor
function enviarAlerta(superOdd, isNova = true) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    const mensagem = JSON.stringify({
      tipo: 'super_odd',
      dados: {
        ...superOdd,
        isNova: isNova // Flag para indicar se é nova ou existente
      },
      timestamp: new Date().toISOString()
    });

    ws.send(mensagem);
    if (isNova) {
      console.log(`🔔 ALERTA NOVA: ${superOdd.evento} - Odd: ${superOdd.valor}`);
    } else {
      console.log(`📋 Enviado (existente): ${superOdd.evento} - Odd: ${superOdd.valor}`);
    }
  }
}

async function monitorarSuperOdds() {
  console.log('🔍 Iniciando monitoramento de Super Odds...');
  console.log(`🌐 Casas ativas: ${CASAS_ATIVAS.join(', ')}`);

  // AGUARDAR CONEXÃO WEBSOCKET ANTES DE COMEÇAR
  console.log('⏳ Aguardando conexão com servidor WebSocket...');
  try {
    await conectarWebSocket();
  } catch (erro) {
    console.error('❌ Não foi possível conectar ao WebSocket. Certifique-se que o servidor está rodando!');
    console.error('💡 Execute: node server.js');
    process.exit(1);
  }

  let browser;
  let verificacaoCount = 0;

  try {
    // Iniciar navegador
    browser = await puppeteer.launch({
      headless: true, // Modo invisível - sem janela do navegador
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Configurar viewport e user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

    while (true) {
      try {
        verificacaoCount++;
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📋 VERIFICAÇÃO #${verificacaoCount} - ${new Date().toLocaleTimeString()}`);
        console.log('='.repeat(60));

        // Monitorar todas as casas ativas
        const todasOdds = await monitorarTodasCasas(page, CASAS_ATIVAS);

        // Processar super odds encontradas
        if (todasOdds.length > 0) {
          console.log(`\n🎯 ${todasOdds.length} super odd(s) encontrada(s)`);

          todasOdds.forEach((odd) => {
            const chaveEvento = odd.evento; // Chave só com o nome do evento
            const agora = Date.now();

            // Verificar se esse evento já foi detectado antes
            const oddAnterior = oddsDetectadas.get(chaveEvento);

            if (!oddAnterior) {
              // Nova Super ODD detectada
              console.log(`🆕 Nova Super ODD: ${odd.evento} - ${odd.valor}`);
              oddsDetectadas.set(chaveEvento, { valor: odd.valor, timestamp: agora });
              enviarAlerta(odd, true); // true = nova (com alerta)

            } else if (oddAnterior.valor !== odd.valor) {
              // Valor da odd mudou!
              console.log(`📈 Odd alterada: ${odd.evento} | ${oddAnterior.valor} → ${odd.valor}`);
              oddsDetectadas.set(chaveEvento, { valor: odd.valor, timestamp: agora });

              // Enviar alerta com informação de mudança
              enviarAlerta({
                ...odd,
                tipo: `Super Odd Alterada (${oddAnterior.valor} → ${odd.valor})`
              }, true); // true = alteração (com alerta)

            } else {
              // Mesma odd, apenas atualizar timestamp e enviar para o site (sem alerta)
              oddsDetectadas.set(chaveEvento, { valor: odd.valor, timestamp: agora });
              enviarAlerta(odd, false); // false = existente (sem alerta)
            }
          });

          // Limpar cache de odds que não aparecem mais (> 30 min)
          for (const [chave, dados] of oddsDetectadas.entries()) {
            if (Date.now() - dados.timestamp > 1800000) {
              console.log(`🗑️ Removendo odd antiga do cache: ${chave}`);
              oddsDetectadas.delete(chave);
            }
          }
        } else {
          console.log('\n⏳ Nenhuma super odd encontrada neste momento');
          console.log('💡 DICA: Verifique o screenshot e os logs de debug acima');
          console.log('💡 Se o site mudou, você precisa ajustar os seletores');
        }

      } catch (erro) {
        console.error('❌ Erro ao verificar página:', erro.message);
      }

      // Aguardar antes da próxima verificação (intervalo randomizado)
      const intervaloAleatorio = Math.floor(Math.random() * (INTERVALO_MAX - INTERVALO_MIN + 1)) + INTERVALO_MIN;
      console.log(`⏰ Aguardando ${intervaloAleatorio / 1000}s para próxima verificação...\n`);
      await new Promise(resolve => setTimeout(resolve, intervaloAleatorio));
    }

  } catch (erro) {
    console.error('💥 Erro fatal no scraper:', erro);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Iniciar monitoramento
monitorarSuperOdds();
