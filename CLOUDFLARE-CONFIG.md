# ☁️ Configuração Cloudflare + Oracle Cloud

Guia otimizado para configurar Cloudflare com sua VPS Oracle.

---

## 🎯 Objetivos

- ✅ Ocultar IP real da Oracle
- ✅ SSL/HTTPS grátis
- ✅ Proteção DDoS
- ✅ CDN global
- ✅ Cache otimizado
- ✅ WebSocket funcionando

---

## 1️⃣ Configuração DNS

### Records necessários:

| Type | Name | Content (IP Oracle) | Proxy | TTL |
|------|------|---------------------|-------|-----|
| A | @ | `xxx.xxx.xxx.xxx` | ✅ Proxied | Auto |
| A | www | `xxx.xxx.xxx.xxx` | ✅ Proxied | Auto |
| A | api | `xxx.xxx.xxx.xxx` | ✅ Proxied | Auto |

**⚠️ IMPORTANTE:**
- Nuvem LARANJA = Proxied (recomendado)
- Nuvem CINZA = DNS only (sem proteção)

---

## 2️⃣ SSL/TLS

### Modo recomendado: **Full**

**Caminho:** SSL/TLS → Overview

```
Visitor ← [HTTPS] → Cloudflare ← [HTTP] → Oracle VPS
```

**Não use:**
- ❌ Flexible (inseguro entre Cloudflare e Oracle)
- ❌ Full (Strict) - precisa certificado SSL no servidor

**Configurações adicionais:**

1. **Always Use HTTPS:** ON
   - SSL/TLS → Edge Certificates → Always Use HTTPS

2. **Automatic HTTPS Rewrites:** ON
   - SSL/TLS → Edge Certificates → Automatic HTTPS Rewrites

3. **Minimum TLS Version:** 1.2
   - SSL/TLS → Edge Certificates → Minimum TLS Version

---

## 3️⃣ Page Rules (Otimização)

**Caminho:** Rules → Page Rules

### Rule 1: API (Sem Cache)
```
URL: *seudominio.com/api/*
Settings:
  - Cache Level: Bypass
  - Disable Performance
```

### Rule 2: WebSocket (Sem timeout)
```
URL: *seudominio.com/ws*
Settings:
  - Cache Level: Bypass
  - WebSockets: On
```

### Rule 3: Frontend (Cache agressivo)
```
URL: *seudominio.com/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 4 hours
```

**Ordem correta:** API → WebSocket → Frontend

---

## 4️⃣ Firewall Rules

**Caminho:** Security → WAF

### Regra de proteção básica:

```
Expression:
(cf.threat_score > 10) or
(not http.request.uri.path contains "/api/" and http.request.method eq "POST")

Action: Challenge (CAPTCHA)
```

### Bloquear países (opcional):

```
Expression:
(ip.geoip.country ne "BR") and
(ip.geoip.country ne "US")

Action: Block
```

---

## 5️⃣ Speed Optimization

### Auto Minify
**Caminho:** Speed → Optimization

- ✅ JavaScript
- ✅ CSS
- ✅ HTML

### Brotli Compression
**Caminho:** Speed → Optimization

- ✅ Brotli (melhor que gzip)

### Rocket Loader
**Caminho:** Speed → Optimization

- ⚠️ OFF (pode quebrar WebSocket)

### Early Hints
**Caminho:** Speed → Optimization

- ✅ ON (melhora carregamento)

---

## 6️⃣ Caching

### Browser Cache TTL
**Caminho:** Caching → Configuration

- Arquivos estáticos: **4 hours**
- API: **Respect Existing Headers**

### Development Mode
**Caminho:** Caching → Configuration

- Use para testar mudanças (desabilita cache por 3h)

### Purge Cache
**Caminho:** Caching → Configuration

Após atualizar frontend:
```bash
# Limpar cache do Cloudflare
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

Ou usar dashboard: **Caching** → **Purge Everything**

---

## 7️⃣ WebSocket Configuration

### No Cloudflare:

**Caminho:** Network

- ✅ **WebSockets:** ON (já vem ativo no Free)

### Timeouts (Plano Free):
- Timeout idle: **100 segundos**
- Solução: Keep-alive no código

### No código (server.js):

```javascript
// Ping periódico para manter conexão ativa
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  });
}, 30000); // A cada 30 segundos
```

---

## 8️⃣ Headers de Segurança

### Transform Rules
**Caminho:** Rules → Transform Rules → Modify Response Header

**Adicionar headers:**

1. **X-Content-Type-Options**
   - Set static: `nosniff`

2. **X-Frame-Options**
   - Set static: `DENY`

3. **X-XSS-Protection**
   - Set static: `1; mode=block`

4. **Referrer-Policy**
   - Set static: `strict-origin-when-cross-origin`

5. **Permissions-Policy**
   - Set static: `geolocation=(), microphone=(), camera=()`

---

## 9️⃣ Analytics & Monitoring

### Web Analytics (Grátis)
**Caminho:** Analytics → Web Analytics

- Estatísticas de tráfego
- Navegadores mais usados
- Países dos visitantes

### Security Events
**Caminho:** Security → Events

- Ver ataques bloqueados
- IPs suspeitos
- Patterns de ataque

---

## 🔟 Verificação de IP Real

### Testar se IP está oculto:

```bash
# Descobrir IP do domínio (deve ser Cloudflare)
nslookup seudominio.com

# Verificar headers
curl -I https://seudominio.com
```

**IPs Cloudflare começam com:**
- 104.x.x.x
- 172.x.x.x
- 173.x.x.x

Se mostrar seu IP Oracle = ❌ Proxy desativado!

---

## 🚨 Troubleshooting

### WebSocket não conecta

**Problema:** Erro de conexão WebSocket

**Solução:**
1. Verificar se WebSockets está ON
2. Verificar Page Rule (sem cache em /ws)
3. Testar com nuvem CINZA (DNS only)
4. Verificar timeout no código (ping periódico)

### Loop de redirecionamento

**Problema:** "ERR_TOO_MANY_REDIRECTS"

**Solução:**
1. Mudar SSL/TLS para **Full** (não Flexible)
2. Limpar cookies do navegador
3. Purge cache do Cloudflare

### 502 Bad Gateway

**Problema:** Cloudflare não alcança Oracle

**Solução:**
1. Verificar se app está rodando: `pm2 status`
2. Verificar firewall Oracle
3. Verificar nginx: `sudo systemctl status nginx`
4. Testar direto no IP: `http://SEU_IP:3000`

### Cache não funciona

**Problema:** Arquivos sempre sendo baixados

**Solução:**
1. Verificar Page Rules (ordem correta)
2. Adicionar headers no nginx:
```nginx
location / {
    expires 1h;
    add_header Cache-Control "public, immutable";
}
```

### CORS errors

**Problema:** "Access-Control-Allow-Origin" error

**Solução no server.js:**
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
```

---

## 📊 Métricas Importantes

### Performance esperada:

- **Time to First Byte (TTFB):** < 200ms
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s

### Testar performance:

- PageSpeed Insights: https://pagespeed.web.dev/
- GTmetrix: https://gtmetrix.com/
- WebPageTest: https://www.webpagetest.org/

---

## 🔐 Segurança Adicional

### Bot Fight Mode
**Caminho:** Security → Bots

- ✅ Ativar (protege contra bots maliciosos)

### Rate Limiting (Plano Free limitado)

Implementar no código (server.js):

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // 100 requests por IP
});

app.use('/api/', limiter);
```

---

## ✅ Checklist de Configuração

- [ ] DNS Records criados (A @ e A www)
- [ ] Proxy ativado (nuvem laranja)
- [ ] SSL/TLS modo Full
- [ ] Always Use HTTPS ON
- [ ] Page Rules configuradas (3 rules)
- [ ] WebSockets ativado
- [ ] Auto Minify ativado
- [ ] Brotli compression ON
- [ ] Security headers configurados
- [ ] Bot Fight Mode ON
- [ ] IP real oculto (verificado)
- [ ] WebSocket funcionando
- [ ] Cache funcionando
- [ ] HTTPS forçado

---

## 🎁 Bonus: Cloudflare API

### Limpar cache via API:

```bash
# Obter Zone ID
curl -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  | jq -r '.result[0].id'

# Limpar cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

### Criar API Token:

1. My Profile → API Tokens → Create Token
2. Template: Edit zone DNS
3. Zone Resources: Include → Specific zone → seudominio.com
4. Continue to summary → Create Token

---

## 📚 Recursos Úteis

- **Cloudflare Docs:** https://developers.cloudflare.com/
- **Status Page:** https://www.cloudflarestatus.com/
- **Community:** https://community.cloudflare.com/
- **Speed Test:** https://speed.cloudflare.com/

---

**Cloudflare configurado! Seu site está protegido e otimizado! 🚀**
