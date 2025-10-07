// Scraper que roda direto no servidor (sem precisar do PC)
const puppeteer = require('puppeteer');
const WebSocket = require('ws');
const { monitorarTodasCasas } = require('./src/casas');

// Configurações
const INTERVALO_MIN = 10000; // 10 segundos (mais lento para economizar recursos)
const INTERVALO_MAX = 15000; // 15 segundos
const CASAS_ATIVAS = ['betesporte'];

// Armazena as super odds já detectadas
const oddsDetectadas = new Map();

// WebSocket Server integrado
const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/', (req, res) => {
  res.send('✅ WebSocket Server + Scraper rodando!');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connections: wss.clients.size,
    oddsDetectadas: oddsDetectadas.size,
    uptime: process.uptime()
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

const wss = new WebSocket.Server({ server });

let ultimasOdds = [];
const MAX_HISTORICO = 50;

wss.on('connection', (ws) => {
  console.log('✅ Novo cliente conectado');
  console.log(`📊 Total de clientes: ${wss.clients.size}`);

  if (ultimasOdds.length > 0) {
    ws.send(JSON.stringify({
      tipo: 'historico',
      dados: ultimasOdds
    }));
  }

  ws.on('close', () => {
    console.log('❌ Cliente desconectado');
  });
});

// Função para enviar alerta via WebSocket
function enviarAlerta(superOdd, isNova = true) {
  if (wss.clients.size > 0) {
    const mensagem = JSON.stringify({
      tipo: 'super_odd',
      dados: {
        ...superOdd,
        isNova: isNova
      },
      timestamp: new Date().toISOString()
    });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(mensagem);
      }
    });

    if (isNova) {
      console.log(`🔔 ALERTA NOVA: ${superOdd.evento} - Odd: ${superOdd.valor}`);
    }
  }
}

// Scraper automático
async function iniciarMonitoramento() {
  console.log('🔍 Iniciando monitoramento automático de Super Odds...');
  console.log(`🌐 Casas ativas: ${CASAS_ATIVAS.join(', ')}`);

  let browser;
  let verificacaoCount = 0;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    console.log('✅ Navegador iniciado com sucesso!');

    while (true) {
      try {
        verificacaoCount++;
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📋 VERIFICAÇÃO #${verificacaoCount} - ${new Date().toLocaleTimeString()}`);
        console.log('='.repeat(60));

        const todasOdds = await monitorarTodasCasas(page, CASAS_ATIVAS);

        if (todasOdds.length > 0) {
          console.log(`\n🎯 ${todasOdds.length} super odd(s) encontrada(s)`);

          todasOdds.forEach((odd) => {
            const chaveEvento = odd.evento;
            const agora = Date.now();
            const oddAnterior = oddsDetectadas.get(chaveEvento);

            if (!oddAnterior) {
              console.log(`🆕 Nova Super ODD: ${odd.evento} - ${odd.valor}`);
              oddsDetectadas.set(chaveEvento, { valor: odd.valor, timestamp: agora });
              enviarAlerta(odd, true);
            } else if (oddAnterior.valor !== odd.valor) {
              console.log(`📈 Odd alterada: ${odd.evento} | ${oddAnterior.valor} → ${odd.valor}`);
              oddsDetectadas.set(chaveEvento, { valor: odd.valor, timestamp: agora });
              enviarAlerta({
                ...odd,
                tipo: `Super Odd Alterada (${oddAnterior.valor} → ${odd.valor})`
              }, true);
            } else {
              oddsDetectadas.set(chaveEvento, { valor: odd.valor, timestamp: agora });
              enviarAlerta(odd, false);
            }
          });

          // Limpar cache antigo
          for (const [chave, dados] of oddsDetectadas.entries()) {
            if (Date.now() - dados.timestamp > 1800000) {
              console.log(`🗑️ Removendo odd antiga: ${chave}`);
              oddsDetectadas.delete(chave);
            }
          }
        } else {
          console.log('\n⏳ Nenhuma super odd encontrada neste momento');
        }

      } catch (erro) {
        console.error('❌ Erro ao verificar página:', erro.message);
      }

      const intervaloAleatorio = Math.floor(Math.random() * (INTERVALO_MAX - INTERVALO_MIN + 1)) + INTERVALO_MIN;
      console.log(`⏰ Aguardando ${intervaloAleatorio / 1000}s para próxima verificação...\n`);
      await new Promise(resolve => setTimeout(resolve, intervaloAleatorio));
    }

  } catch (erro) {
    console.error('💥 Erro fatal no scraper:', erro);
    if (browser) {
      await browser.close();
    }
    // Reiniciar após 30 segundos
    setTimeout(iniciarMonitoramento, 30000);
  }
}

// Iniciar tudo
console.log('🎯 Servidor WebSocket + Scraper iniciado!');
console.log('📍 Aguardando 5 segundos antes de iniciar o scraper...');

setTimeout(() => {
  iniciarMonitoramento().catch(console.error);
}, 5000);
