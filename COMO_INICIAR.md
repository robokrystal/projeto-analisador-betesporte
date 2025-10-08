# 🚀 Como Iniciar o Sistema - Ordem Correta

## 📋 Ordem dos Comandos

### **1️⃣ Primeiro: Servidor WebSocket**
```bash
node server.js
```
- Inicia o servidor na porta 3000
- Aguarda conexões WebSocket
- **Deixe rodando em um terminal**

---

### **2️⃣ Segundo: Ngrok (em outro terminal)**
```bash
ngrok http 3000
```
- Expõe o servidor local para internet
- URL fixa: `https://ectopic-rounded-izabella.ngrok-free.dev`
- **Deixe rodando em outro terminal**

---

### **3️⃣ Terceiro: Scraper (em outro terminal)**
```bash
node index.js
```
- Conecta no servidor via WebSocket
- Começa a monitorar as casas de apostas
- Envia super odds encontradas

---

## 🖥️ Resumo Visual

```
┌─────────────────────────────────────────────────────────┐
│  Terminal 1: node server.js                            │
│  ✅ Servidor rodando na porta 3000                      │
└─────────────────────────────────────────────────────────┘
                    ⬇️
┌─────────────────────────────────────────────────────────┐
│  Terminal 2: ngrok http 3000                            │
│  ✅ URL pública: https://ectopic-rounded-izabella...    │
└─────────────────────────────────────────────────────────┘
                    ⬇️
┌─────────────────────────────────────────────────────────┐
│  Terminal 3: node index.js                              │
│  ✅ Scraper conectado, monitorando odds                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🌐 Acessar o Dashboard

Depois de tudo rodando, acesse:
- **Dashboard:** https://krystalodd.pages.dev
- **Painel Admin:** https://krystalodd.pages.dev/admin.html

---

## ⚠️ Dicas Importantes

1. **Sempre nessa ordem:** Servidor → Ngrok → Scraper
2. **Não feche os terminais** enquanto estiver usando
3. **Se der erro de porta em uso:** Algum processo já está rodando
4. **Para parar tudo:** Ctrl+C em cada terminal

---

## 🔧 Comandos Úteis

### Verificar se servidor está rodando:
```bash
netstat -ano | findstr :3000
```

### Matar processo na porta 3000:
```bash
# Primeiro descubra o PID com comando acima
taskkill //F //PID <numero_do_pid>
```

### Verificar processos Node.js:
```bash
tasklist | findstr node.exe
```

---

## 🎯 Checklist de Inicialização

- [ ] Terminal 1: `node server.js` rodando
- [ ] Terminal 2: `ngrok http 3000` rodando
- [ ] Terminal 3: `node index.js` rodando
- [ ] Dashboard acessível no navegador
- [ ] Scraper conectado ao WebSocket

✅ Tudo certo? Então o sistema está funcionando!

---

**Desenvolvido com ❤️ por Claude Code**
