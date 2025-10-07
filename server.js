const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// Rota de health check (Fly.io precisa disso)
app.get('/', (req, res) => {
  res.send('✅ WebSocket Server rodando!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', connections: wss.clients.size });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

const wss = new WebSocket.Server({ server });

// Armazenar últimas odds para novos clientes
let ultimasOdds = [];
const MAX_HISTORICO = 50;

wss.on('connection', (ws) => {
  console.log('✅ Novo cliente conectado');
  console.log(`📊 Total de clientes: ${wss.clients.size}`);

  // Enviar histórico de odds para o novo cliente
  if (ultimasOdds.length > 0) {
    ws.send(JSON.stringify({
      tipo: 'historico',
      dados: ultimasOdds
    }));
  }

  ws.on('message', (message) => {
    try {
      const dados = JSON.parse(message);

      // Guardar no histórico
      if (dados.tipo === 'super_odd') {
        ultimasOdds.unshift(dados);
        if (ultimasOdds.length > MAX_HISTORICO) {
          ultimasOdds.pop();
        }
      }

      // Broadcast para todos os clientes conectados
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });

      console.log(`📡 Mensagem enviada para ${wss.clients.size} cliente(s)`);
    } catch (erro) {
      console.error('❌ Erro ao processar mensagem:', erro.message);
    }
  });

  ws.on('close', () => {
    console.log('❌ Cliente desconectado');
    console.log(`📊 Total de clientes: ${wss.clients.size}`);
  });

  ws.on('error', (erro) => {
    console.error('❌ Erro no WebSocket:', erro.message);
  });
});

// Ping periódico para manter conexão ativa
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  });
}, 30000);

console.log('🎯 WebSocket Server iniciado com sucesso!');
console.log('📍 Aguardando conexões...');
