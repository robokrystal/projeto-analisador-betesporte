const WebSocket = require('ws');
const express = require('express');
const { tokenManager, adminManager } = require('./backend/database');

const app = express();
app.use(express.json());

// CORS habilitado via headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Rota de health check (Fly.io precisa disso)
app.get('/', (req, res) => {
  res.send('✅ WebSocket Server rodando!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', connections: wss.clients.size });
});

// ========== ROTAS DE AUTENTICAÇÃO ==========

// Validar token de acesso (usado pelo dashboard)
app.post('/api/validate-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ valid: false, message: 'Token não fornecido' });
    }

    const result = await tokenManager.validateToken(token);
    res.json(result);
  } catch (error) {
    res.status(500).json({ valid: false, message: 'Erro ao validar token' });
  }
});

// ========== ROTAS DO PAINEL ADMIN ==========

// Login do admin
app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    const isValid = await adminManager.validatePassword(password);

    if (isValid) {
      res.json({ success: true, message: 'Login bem-sucedido' });
    } else {
      res.status(401).json({ success: false, message: 'Senha incorreta' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao fazer login' });
  }
});

// Criar novo token
app.post('/api/admin/tokens/create', async (req, res) => {
  try {
    const { password, durationDays, nickname } = req.body;

    // Validar senha admin
    const isValid = await adminManager.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Não autorizado' });
    }

    if (!durationDays || durationDays <= 0) {
      return res.status(400).json({ success: false, message: 'Duração inválida' });
    }

    const newToken = await tokenManager.createToken(parseInt(durationDays), nickname || null);
    res.json({ success: true, token: newToken });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao criar token' });
  }
});

// Listar todos os tokens
app.post('/api/admin/tokens/list', async (req, res) => {
  try {
    const { password } = req.body;

    // Validar senha admin
    const isValid = await adminManager.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Não autorizado' });
    }

    const tokens = await tokenManager.listTokens();
    const stats = await tokenManager.getStats();
    res.json({ success: true, tokens, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao listar tokens' });
  }
});

// Revogar token
app.post('/api/admin/tokens/revoke', async (req, res) => {
  try {
    const { password, tokenId } = req.body;

    // Validar senha admin
    const isValid = await adminManager.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Não autorizado' });
    }

    await tokenManager.revokeToken(tokenId);
    res.json({ success: true, message: 'Token revogado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao revogar token' });
  }
});

// Deletar token
app.post('/api/admin/tokens/delete', async (req, res) => {
  try {
    const { password, tokenId } = req.body;

    // Validar senha admin
    const isValid = await adminManager.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Não autorizado' });
    }

    await tokenManager.deleteToken(tokenId);
    res.json({ success: true, message: 'Token deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao deletar token' });
  }
});

// Estender duração do token
app.post('/api/admin/tokens/extend', async (req, res) => {
  try {
    const { password, tokenId, additionalDays } = req.body;

    // Validar senha admin
    const isValid = await adminManager.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Não autorizado' });
    }

    await tokenManager.extendToken(tokenId, parseInt(additionalDays));
    res.json({ success: true, message: 'Token estendido com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao estender token' });
  }
});

// Alterar senha do admin
app.post('/api/admin/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validar senha antiga
    const isValid = await adminManager.validatePassword(oldPassword);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Senha atual incorreta' });
    }

    await adminManager.changePassword(newPassword);
    res.json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao alterar senha' });
  }
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
