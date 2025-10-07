# 🎯 Monitor de Super Odds - BetEsporte

Sistema automatizado para monitoramento em tempo real de **Super Odds** em casas de apostas, com notificação instantânea via WebSocket.

## 📋 Funcionalidades

- ✅ Scraping automatizado com Puppeteer
- ✅ Detecção de novas odds e alterações de valores
- ✅ Sistema de notificação em tempo real via WebSocket
- ✅ Interface web responsiva com dashboard
- ✅ Histórico de odds detectadas
- ✅ Arquitetura modular para múltiplas casas de apostas

## 🏗️ Arquitetura

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Fly.io         │◄────────│  Seu PC (local)  │────────►│  BetEsporte     │
│  WebSocket      │   WSS   │  • scraper.js    │ Scrape  │  (Site alvo)    │
│  Server 24/7    │         │  • Puppeteer     │         │                 │
└────────┬────────┘         └──────────────────┘         └─────────────────┘
         │
         │ WebSocket
         ▼
┌─────────────────┐
│  Netlify        │
│  Frontend       │
│  (Dashboard)    │
└─────────────────┘
```

## 🚀 Instalação

### **Pré-requisitos**
- Node.js 18+
- Git
- Conta no [Fly.io](https://fly.io) (grátis)
- Conta no [Netlify](https://netlify.com) (grátis)

### **1. Clonar o repositório**
```bash
git clone https://github.com/SEU-USUARIO/projeto-analisador-betesporte.git
cd projeto-analisador-betesporte
```

### **2. Instalar dependências**
```bash
npm install
```

### **3. Deploy do servidor WebSocket no Fly.io**
```bash
# Instalar CLI do Fly.io
curl -L https://fly.io/install.sh | sh  # Mac/Linux
# OU
iwr https://fly.io/install.ps1 -useb | iex  # Windows

# Fazer login
fly auth login

# Deploy
fly launch
# Escolha:
# - Nome: betesporte-server (ou outro)
# - Região: gru (São Paulo)
# - Deploy agora: Sim
```

### **4. Configurar URLs**

Após deploy no Fly.io, você receberá uma URL como `https://betesporte-server.fly.dev`

**Atualizar scraper.js (linha 9):**
```javascript
const WS_URL = 'wss://betesporte-server.fly.dev';
```

**Atualizar public/index.html (linha 212):**
```javascript
const WS_URL = 'wss://betesporte-server.fly.dev';
```

### **5. Deploy do frontend no Netlify**

**Opção A - Arrastar e soltar:**
1. Acesse [netlify.com/drop](https://app.netlify.com/drop)
2. Arraste a pasta `public/`

**Opção B - CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=./public
```

## 🎮 Uso

### **Iniciar monitoramento (local):**
```bash
node scraper.js
```

O scraper irá:
1. Conectar ao servidor WebSocket no Fly.io
2. Abrir navegador Puppeteer (headless)
3. Verificar o site da BetEsporte a cada 4-7 segundos
4. Enviar odds detectadas para o servidor
5. Notificar todos os clientes conectados no frontend

### **Acessar dashboard:**
Abra a URL do Netlify no navegador: `https://seu-site.netlify.app`

## 📁 Estrutura do Projeto

```
projeto-analisador-betesporte/
├── scraper.js              # Orquestrador principal (executa no PC)
├── server.js               # Servidor WebSocket (executa no Fly.io)
├── Dockerfile              # Configuração para deploy no Fly.io
├── package.json            # Dependências do projeto
├── src/
│   └── casas/
│       ├── index.js        # Gerenciador de casas de apostas
│       └── betesporte/
│           ├── config.js   # Configurações e seletores CSS
│           └── scraper.js  # Lógica de scraping específica
└── public/
    └── index.html          # Frontend (dashboard)
```

## 🔧 Configuração

### **Adicionar nova casa de apostas:**

1. Criar pasta `src/casas/novacasa/`
2. Criar `config.js`:
```javascript
module.exports = {
  URL: 'https://site-da-casa.com/odds',
  NOME: 'NovaCasa',
  SELETORES: {
    // Seus seletores CSS aqui
  }
};
```

3. Criar `scraper.js` seguindo o padrão da Betesporte
4. Registrar em `src/casas/index.js`:
```javascript
const novacasa = require('./novacasa/scraper');

const casasDisponiveis = {
  betesporte,
  novacasa  // ← Adicionar aqui
};
```

5. Ativar no `scraper.js` principal:
```javascript
const CASAS_ATIVAS = ['betesporte', 'novacasa'];
```

## 🛠️ Comandos Úteis

```bash
# Rodar scraper localmente
node scraper.js

# Ver logs do Fly.io em tempo real
fly logs

# Redeploy no Fly.io após mudanças
fly deploy

# Ver status do servidor
fly status

# Abrir aplicação no navegador
fly open
```

## 📊 Variáveis de Ambiente

Crie um arquivo `.env` (opcional):
```env
WS_URL=wss://betesporte-server.fly.dev
INTERVALO_MIN=4000
INTERVALO_MAX=7000
```

## 🐛 Troubleshooting

### **Scraper não conecta ao WebSocket:**
- Verifique se o servidor está rodando: `fly status`
- Veja os logs: `fly logs`
- Teste a URL: `curl https://betesporte-server.fly.dev/health`

### **Odds não aparecem:**
- Verifique os seletores CSS no `config.js`
- O site pode ter mudado a estrutura HTML
- Veja os logs de debug no console

### **Frontend não conecta:**
- Verifique a URL do WebSocket no `index.html`
- Abra o console do navegador (F12)
- Certifique-se que está usando `wss://` (não `ws://`)

## 📝 Licença

MIT

## 👤 Autor

Gabriel - [GitHub](https://github.com/SEU-USUARIO)

## 🤝 Contribuindo

Pull requests são bem-vindos! Para mudanças importantes, abra uma issue primeiro.

---

**⚠️ Aviso Legal:** Este projeto é apenas para fins educacionais. Use com responsabilidade e respeite os termos de serviço dos sites.
