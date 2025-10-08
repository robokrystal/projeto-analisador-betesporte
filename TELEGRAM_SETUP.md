# 📱 Como Configurar Notificações no Telegram

Sistema de notificações via Telegram para receber alertas de Super Odds em tempo real!

---

## 🤖 Passo 1: Criar um Bot no Telegram

1. **Abra o Telegram** e procure por: `@BotFather`
2. **Inicie uma conversa** e envie: `/newbot`
3. **Escolha um nome** para o bot (ex: "Super Odds Monitor")
4. **Escolha um username** (ex: "SuperOddsBot")
5. **Copie o token** que aparece (algo como: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

---

## 💬 Passo 2: Pegar seu Chat ID

### **Opção 1: Usar @userinfobot**

1. Procure por `@userinfobot` no Telegram
2. Inicie conversa com ele
3. Ele vai te enviar seu **ID** (ex: `987654321`)

### **Opção 2: Usar @RawDataBot**

1. Procure por `@RawDataBot` no Telegram
2. Envie qualquer mensagem para ele
3. Procure por `"id":` na resposta (ex: `"id": 987654321`)

### **Opção 3: Manualmente**

1. Envie uma mensagem para o SEU bot criado no Passo 1
2. Abra no navegador:
   ```
   https://api.telegram.org/bot<SEU_TOKEN>/getUpdates
   ```
3. Procure por `"chat":{"id":` no resultado

---

## ⚙️ Passo 3: Configurar o Arquivo .env

1. **Abra o arquivo `.env`** na raiz do projeto
2. **Preencha os dados:**

```env
# Token do bot (pego no @BotFather)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# Seu ID do chat (pego no @userinfobot)
TELEGRAM_CHAT_ID=987654321

# Ativar notificações (true para ativar)
TELEGRAM_ENABLED=true
```

3. **Salve o arquivo**

---

## 🚀 Passo 4: Reiniciar o Sistema

Após configurar, reinicie o scraper:

```bash
# Pare o processo atual (Ctrl+C)
# E inicie novamente:
node index.js
```

---

## ✅ Testando

Quando o bot encontrar uma Super Odd, você vai receber no Telegram:

```
🔥 SUPER ODD ENCONTRADA!

🏠 Casa: BetEsporte
⚽ Jogo: Flamengo x Palmeiras
💰 Odd: 3.50
📊 Mercado: Vitória do Flamengo
🕐 Horário: 15:30:45
```

---

## 🎯 Recursos Adicionais

### **Enviar para Grupos**

1. **Crie um grupo** no Telegram
2. **Adicione o bot** ao grupo
3. **Torne o bot admin** (opcional)
4. **Pegue o Chat ID do grupo:**
   - Envie uma mensagem no grupo
   - Acesse: `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates`
   - Procure por `"chat":{"id":-` (IDs de grupos começam com `-`)
5. **Use esse ID negativo** no `.env`

### **Desativar Temporariamente**

Coloque `false` no `.env`:

```env
TELEGRAM_ENABLED=false
```

Não precisa reiniciar, só na próxima vez que rodar.

---

## 🔐 Segurança

- ❌ **NUNCA** compartilhe seu token do bot
- ❌ **NUNCA** comite o arquivo `.env` no GitHub
- ✅ O `.env` já está no `.gitignore`
- ✅ Use `.env.example` como referência

---

## 🐛 Problemas Comuns

### **"Unauthorized" ao enviar mensagem**

- Token do bot incorreto
- Verifique se copiou corretamente do @BotFather

### **"Chat not found"**

- Chat ID incorreto
- Você precisa **iniciar** uma conversa com o bot primeiro
- Envie `/start` para o bot antes de usar

### **Mensagens não chegam**

- Verifique se `TELEGRAM_ENABLED=true`
- Confirme que o scraper está rodando
- Veja os logs no terminal para erros

---

## 📋 Exemplo Completo de .env

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=6123456789:AAEaBcDefGhIjKlMnOpQrStUvWxYz012345
TELEGRAM_CHAT_ID=123456789
TELEGRAM_ENABLED=true
```

---

## 🎊 Pronto!

Agora você receberá notificações instantâneas no Telegram sempre que uma Super Odd for encontrada!

**Vantagens:**
- 📱 Notificação push no celular
- 🔔 Não precisa ficar com o site aberto
- 💾 Histórico de todas as odds recebidas
- 👥 Pode criar grupos para compartilhar com clientes

---

**Desenvolvido com ❤️ por Claude Code**
