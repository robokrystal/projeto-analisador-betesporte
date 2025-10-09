# 🚀 Deploy no Oracle Cloud + Cloudflare

Guia completo para hospedar o KrystalOdd numa VPS Oracle Cloud gratuita com Cloudflare.

---

## 📋 Pré-requisitos

- ✅ Conta Oracle Cloud (Free Tier)
- ✅ Domínio próprio (pode ser gratuito do Freenom)
- ✅ Conta Cloudflare (gratuita)

---

## 1️⃣ Criar VM na Oracle Cloud

### 1.1 Acessar Console Oracle
1. Acesse: https://cloud.oracle.com
2. Faça login na sua conta
3. Vá em: **Compute** → **Instances** → **Create Instance**

### 1.2 Configurar a VM

**Nome:** `krystalodd-server`

**Placement:**
- Availability Domain: `AD-1` (São Paulo)

**Image:**
- Sistema: **Ubuntu 22.04** (sempre gratuito)

**Shape (Tipo de VM):**
- Para ARM (recomendado):
  - Shape: `VM.Standard.A1.Flex`
  - OCPUs: `2` (ou até 4)
  - RAM: `12 GB` (ou até 24 GB)

- Para x86 (alternativa):
  - Shape: `VM.Standard.E2.1.Micro`
  - OCPU: `1`
  - RAM: `1 GB`

**Networking:**
- VCN: Criar nova ou usar existente
- Subnet: Pública
- ✅ **Assign a public IPv4 address** (IMPORTANTE!)

**SSH Keys:**
- Gere um par de chaves SSH ou use existente
- **SALVE A CHAVE PRIVADA** (você vai precisar!)

**Boot Volume:**
- 50 GB (suficiente)

### 1.3 Criar a VM
- Clique em **Create**
- Aguarde ~2 minutos até status ficar **Running**
- Anote o **IP Público** da VM

---

## 2️⃣ Configurar Firewall da Oracle

### 2.1 Security List (Firewall Virtual)

1. Vá em: **Networking** → **Virtual Cloud Networks**
2. Clique na VCN que você criou
3. Clique em **Security Lists** → **Default Security List**
4. Clique em **Add Ingress Rules**

**Adicione estas regras:**

| Source CIDR | Protocol | Port Range | Descrição |
|-------------|----------|------------|-----------|
| `0.0.0.0/0` | TCP | `22` | SSH |
| `0.0.0.0/0` | TCP | `80` | HTTP |
| `0.0.0.0/0` | TCP | `443` | HTTPS |
| `0.0.0.0/0` | TCP | `3000` | WebSocket (temporário) |

### 2.2 Firewall do Ubuntu (iptables)

Depois de conectar via SSH, execute:

```bash
# Permitir HTTP, HTTPS e SSH
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT

# Salvar regras
sudo netfilter-persistent save
```

---

## 3️⃣ Conectar na VM via SSH

### Windows (PowerShell ou CMD):
```bash
ssh -i caminho\para\sua\chave.key ubuntu@SEU_IP_PUBLICO
```

### Linux/Mac:
```bash
chmod 400 ~/sua-chave.key
ssh -i ~/sua-chave.key ubuntu@SEU_IP_PUBLICO
```

---

## 4️⃣ Setup Inicial do Servidor

### 4.1 Executar script de setup

```bash
# Download do script
wget https://raw.githubusercontent.com/seu-usuario/krystalodd/main/oracle-setup.sh

# Dar permissão de execução
chmod +x oracle-setup.sh

# Executar
bash oracle-setup.sh
```

**O script vai instalar:**
- Node.js 20 LTS
- npm
- PM2 (process manager)
- Dependências do Puppeteer/Chrome

---

## 5️⃣ Deploy do Projeto

### 5.1 Clonar repositório

```bash
cd ~/krystalodd
git clone https://github.com/seu-usuario/krystalodd.git .
```

### 5.2 Configurar variáveis de ambiente

```bash
# Copiar exemplo
cp .env.example .env

# Editar
nano .env
```

**Adicione suas credenciais:**
```env
# Telegram (para notificações)
TELEGRAM_BOT_TOKEN=seu_bot_token
TELEGRAM_CHAT_ID=seu_chat_id

# Admin (senha do painel)
ADMIN_PASSWORD=sua_senha_segura

# WebSocket (URL do servidor)
WS_URL=ws://SEU_IP_PUBLICO:3000

# Porta
PORT=3000
```

### 5.3 Instalar dependências

```bash
npm install
```

### 5.4 Criar diretório de logs

```bash
mkdir -p logs
```

---

## 6️⃣ Iniciar com PM2

### 6.1 Iniciar aplicações

```bash
# Iniciar ambos (server + scraper)
pm2 start ecosystem.config.js

# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs
```

### 6.2 Configurar auto-start (reiniciar após reboot)

```bash
# Salvar configuração atual
pm2 save

# Gerar script de startup
pm2 startup

# Copie e execute o comando que aparecer (começa com 'sudo env...')
```

### 6.3 Comandos úteis PM2

```bash
# Reiniciar
pm2 restart all

# Parar
pm2 stop all

# Ver logs
pm2 logs krystalodd-server
pm2 logs krystalodd-scraper

# Monitorar recursos
pm2 monit

# Limpar logs antigos
pm2 flush
```

---

## 7️⃣ Configurar Cloudflare

### 7.1 Adicionar domínio no Cloudflare

1. Acesse: https://dash.cloudflare.com
2. Clique em **Add a Site**
3. Digite seu domínio: `seudominio.com`
4. Escolha plano **Free**
5. **Importante:** Anote os nameservers do Cloudflare

### 7.2 Atualizar nameservers no registrador

1. Vá no site onde você registrou o domínio
2. Encontre configurações de DNS/Nameservers
3. Substitua pelos nameservers do Cloudflare

Exemplo:
```
Nameserver 1: alice.ns.cloudflare.com
Nameserver 2: bob.ns.cloudflare.com
```

Aguarde propagação (pode levar até 24h, geralmente ~1h)

### 7.3 Configurar DNS Records

No painel Cloudflare, vá em **DNS** → **Records**:

| Type | Name | Content | Proxy Status | TTL |
|------|------|---------|--------------|-----|
| A | @ | SEU_IP_ORACLE | ✅ Proxied | Auto |
| A | www | SEU_IP_ORACLE | ✅ Proxied | Auto |
| A | api | SEU_IP_ORACLE | ✅ Proxied | Auto |

**⚠️ IMPORTANTE:** Deixe a nuvem LARANJA (Proxied) ativada!

### 7.4 Configurar SSL/TLS

1. Vá em **SSL/TLS** → **Overview**
2. Selecione: **Full** (não flexible!)
3. Aguarde 5-10 minutos para ativar

---

## 8️⃣ Instalar Nginx como Reverse Proxy

### 8.1 Instalar Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

### 8.2 Criar configuração

```bash
sudo nano /etc/nginx/sites-available/krystalodd
```

Cole esta configuração:

```nginx
# Upstream para WebSocket/API
upstream krystalodd {
    server localhost:3000;
}

server {
    listen 80;
    listen [::]:80;
    server_name seudominio.com www.seudominio.com;

    # Logs
    access_log /var/log/nginx/krystalodd-access.log;
    error_log /var/log/nginx/krystalodd-error.log;

    # Frontend estático
    location / {
        root /home/ubuntu/krystalodd/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API REST
    location /api/ {
        proxy_pass http://krystalodd;
        proxy_http_version 1.1;

        # Headers para Cloudflare
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://krystalodd;
        proxy_http_version 1.1;

        # Headers WebSocket
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # Timeouts para WebSocket
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Health check
    location /health {
        proxy_pass http://krystalodd/health;
        access_log off;
    }
}
```

### 8.3 Ativar configuração

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/krystalodd /etc/nginx/sites-enabled/

# Remover configuração padrão
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Habilitar no boot
sudo systemctl enable nginx
```

---

## 9️⃣ Ajustar WebSocket no Código

### 9.1 Atualizar URL do WebSocket

Edite `frontend/index.html` e encontre a linha do WebSocket:

```javascript
// Antes (desenvolvimento)
const ws = new WebSocket('ws://localhost:3000');

// Depois (produção)
const ws = new WebSocket('wss://seudominio.com/ws');
```

Ou use detecção automática:

```javascript
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const host = window.location.host;
const ws = new WebSocket(`${protocol}//${host}/ws`);
```

### 9.2 Atualizar scraper.js

Encontre a conexão WebSocket:

```javascript
// Antes
const ws = new WebSocket('ws://localhost:3000');

// Depois
const ws = new WebSocket('wss://seudominio.com/ws');
```

### 9.3 Aplicar mudanças

```bash
# Commit
git add .
git commit -m "fix: Atualiza URLs para produção"
git push

# Na VM, fazer pull
cd ~/krystalodd
git pull

# Reiniciar PM2
pm2 restart all
```

---

## 🔟 Backup Automático

### 10.1 Criar script de backup

```bash
nano ~/backup-db.sh
```

Cole:

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH="/home/ubuntu/krystalodd/backend/tokens.db"

mkdir -p $BACKUP_DIR

# Backup do banco
cp $DB_PATH $BACKUP_DIR/tokens_$DATE.db

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "tokens_*.db" -mtime +7 -delete

echo "✅ Backup concluído: tokens_$DATE.db"
```

```bash
chmod +x ~/backup-db.sh
```

### 10.2 Agendar com cron

```bash
crontab -e
```

Adicione (backup diário às 2h):

```cron
0 2 * * * /home/ubuntu/backup-db.sh >> /home/ubuntu/backup.log 2>&1
```

---

## ✅ Checklist Final

- [ ] VM Oracle criada e rodando
- [ ] Firewall configurado (Oracle + Ubuntu)
- [ ] SSH funcionando
- [ ] Node.js e PM2 instalados
- [ ] Projeto clonado e configurado
- [ ] PM2 rodando (server + scraper)
- [ ] PM2 auto-start configurado
- [ ] Domínio apontado para Cloudflare
- [ ] DNS Records criados
- [ ] SSL/TLS ativado no Cloudflare
- [ ] Nginx instalado e configurado
- [ ] WebSocket URLs atualizadas
- [ ] Backup automático agendado
- [ ] Aplicação acessível em https://seudominio.com

---

## 🔧 Troubleshooting

### WebSocket não conecta

```bash
# Verificar se porta 3000 está aberta
sudo netstat -tlnp | grep 3000

# Ver logs do servidor
pm2 logs krystalodd-server

# Testar conexão direta
curl http://localhost:3000/health
```

### Nginx retorna 502 Bad Gateway

```bash
# Verificar se app está rodando
pm2 status

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Reiniciar tudo
pm2 restart all
sudo systemctl restart nginx
```

### Scraper não roda

```bash
# Ver logs específicos
pm2 logs krystalodd-scraper --lines 100

# Verificar Chrome/Chromium
which chromium-browser
chromium-browser --version

# Reiniciar apenas scraper
pm2 restart krystalodd-scraper
```

### Sem espaço em disco

```bash
# Verificar espaço
df -h

# Limpar logs PM2
pm2 flush

# Limpar logs sistema
sudo journalctl --vacuum-time=7d

# Limpar cache npm
npm cache clean --force
```

---

## 📊 Monitoramento

### Recursos da VM

```bash
# CPU e RAM
htop

# Espaço em disco
df -h

# Processos Node
ps aux | grep node
```

### Logs em tempo real

```bash
# Todos os logs
pm2 logs

# Apenas servidor
pm2 logs krystalodd-server --lines 50

# Apenas scraper
pm2 logs krystalodd-scraper --lines 50

# Nginx access log
sudo tail -f /var/log/nginx/krystalodd-access.log
```

---

## 🚀 Próximos Passos

1. **Monitoramento Avançado:**
   - Instalar Grafana + Prometheus
   - Configurar alertas por email

2. **Segurança:**
   - Configurar fail2ban (proteção SSH)
   - Atualizar sistema automaticamente
   - Restringir SSH apenas para seu IP

3. **Performance:**
   - Ativar Cloudflare Cache
   - Configurar Brotli compression
   - Habilitar HTTP/3

4. **Escalabilidade:**
   - Configurar PM2 cluster mode
   - Adicionar Redis para cache
   - Load balancer com múltiplas VMs

---

**Projeto configurado com sucesso! 🎉**

Acesse: https://seudominio.com
