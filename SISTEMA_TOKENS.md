# 🔐 Sistema de Autenticação por Tokens

## ✅ Implementado com Sucesso!

Sistema completo de autenticação com tokens para controle de acesso ao dashboard.

---

## 📋 O que foi implementado

### 1. **Backend (Banco de Dados + API)**
- ✅ Banco de dados SQLite para armazenar tokens
- ✅ Sistema de validação de tokens com data de expiração
- ✅ API REST completa para gerenciamento
- ✅ Senha padrão admin: `a1b2c3d4`

### 2. **Painel Admin**
- ✅ Acesso: `https://krystalodd.pages.dev/admin.html`
- ✅ Login protegido por senha
- ✅ Criar novos tokens com duração personalizada
- ✅ Visualizar todos os tokens (ativos, expirados, revogados)
- ✅ Revogar tokens manualmente
- ✅ Deletar tokens
- ✅ Estender duração de tokens ativos
- ✅ Estatísticas em tempo real

### 3. **Dashboard Principal**
- ✅ Tela de login com token
- ✅ Validação automática ao acessar
- ✅ Token salvo no localStorage
- ✅ Verificação de expiração automática
- ✅ Logout automático se token expirar

---

## 🚀 Como Usar

### **Passo 1: Acessar o Painel Admin**

1. Acesse: `https://krystalodd.pages.dev/admin.html`
2. Digite a senha: `a1b2c3d4`
3. Clique em "Entrar"

### **Passo 2: Criar Token para Cliente**

1. No painel admin, vá em "Criar Novo Token"
2. Digite a duração em dias (ex: 30 para 30 dias)
3. Clique em "Gerar Token"
4. Copie o token gerado (ex: `SUPER-A1B2C3D4E5F6`)
5. Envie o token para o cliente

### **Passo 3: Cliente Acessa o Dashboard**

1. Cliente acessa: `https://krystalodd.pages.dev`
2. Cole o token recebido
3. Clique em "Acessar Dashboard"
4. Pronto! Dashboard liberado

---

## 🔧 Estrutura do Sistema

### **Banco de Dados (SQLite)**
```
backend/tokens.db
├── tokens (tabela)
│   ├── id
│   ├── token (SUPER-XXXXXX)
│   ├── created_at
│   ├── expires_at
│   ├── duration_days
│   ├── is_active
│   └── last_used
└── admin_config (tabela)
    ├── id
    └── password_hash
```

### **API Endpoints**

#### Autenticação de Usuários
- `POST /api/validate-token` - Validar token de acesso

#### Painel Admin
- `POST /api/admin/login` - Login do admin
- `POST /api/admin/tokens/create` - Criar novo token
- `POST /api/admin/tokens/list` - Listar todos os tokens
- `POST /api/admin/tokens/revoke` - Revogar token
- `POST /api/admin/tokens/delete` - Deletar token
- `POST /api/admin/tokens/extend` - Estender duração do token
- `POST /api/admin/change-password` - Alterar senha do admin

---

## 🔐 Segurança

### **Senha Admin**
- Senha padrão: `a1b2c3d4`
- **IMPORTANTE:** Alterar senha após primeiro acesso!
- Hash SHA-256 armazenado no banco

### **Tokens**
- Gerados aleatoriamente com crypto
- Formato: `SUPER-XXXXXXXXXXXX` (12 caracteres hexadecimais)
- Validação de expiração automática
- Armazenados com hash seguro

### **Como Alterar Senha do Admin**
```javascript
// Via API (em breve terá interface visual)
POST /api/admin/change-password
Body: {
  "oldPassword": "a1b2c3d4",
  "newPassword": "sua_nova_senha_forte"
}
```

---

## 📊 Funcionalidades do Painel Admin

### **Estatísticas**
- Total de tokens criados
- Tokens ativos
- Tokens expirados
- Tokens revogados

### **Gestão de Tokens**
| Ação | Descrição |
|------|-----------|
| **Criar** | Gerar novo token com duração personalizada |
| **Visualizar** | Ver lista completa com status e dias restantes |
| **Revogar** | Desativar token antes do vencimento |
| **Deletar** | Remover permanentemente do banco |
| **Estender** | Adicionar dias extras a um token ativo |

### **Status dos Tokens**
- 🟢 **Ativo** - Token válido e funcionando
- 🔴 **Expirado** - Token venceu (passou da data de expiração)
- 🟡 **Revogado** - Token desativado manualmente por você

---

## 🖥️ Deploy

### **Servidor Backend (Ngrok)**
```bash
# Rodar servidor localmente
node server.js

# Em outro terminal, expor com Ngrok
ngrok http 3000
```

### **Frontend (Netlify)**
```bash
# Fazer upload da pasta public/
# Arquivos:
- index.html (dashboard com login)
- admin.html (painel admin)
```

---

## 📝 Exemplo de Uso Completo

### **Cenário: Cliente compra acesso por 30 dias**

1. **Você (Admin):**
   - Acessa `admin.html`
   - Loga com senha `a1b2c3d4`
   - Cria token de 30 dias
   - Recebe: `SUPER-A1B2C3D4E5F6`
   - Copia e envia para o cliente

2. **Cliente:**
   - Recebe o token
   - Acessa `https://krystalodd.pages.dev`
   - Cola o token: `SUPER-A1B2C3D4E5F6`
   - Clica em "Acessar Dashboard"
   - Token é salvo automaticamente no navegador
   - Pode usar por 30 dias

3. **Após 30 dias:**
   - Token expira automaticamente
   - Cliente é deslogado
   - Precisa de novo token para acessar

---

## 🔄 Fluxo de Autenticação

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Acessa Site    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│ Tem token salvo?├─SIM─▶│ Valida Token │
└────────┬────────┘      └──────┬───────┘
         │                      │
         NÃO                    ▼
         │              ┌───────────────┐
         │              │ Token válido? │
         │              └───┬───────────┘
         │                  │
         ▼                  │
┌─────────────────┐         │
│ Tela de Login   │         │
└────────┬────────┘         │
         │                  │
         ▼                  │
┌─────────────────┐         │
│ Insere Token    │         │
└────────┬────────┘         │
         │                  │
         ▼                  │
┌─────────────────┐         │
│ Valida no API   │◀────────┘
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   SIM       NÃO
    │         │
    ▼         ▼
┌─────┐   ┌──────┐
│ ✅  │   │  ❌  │
└─────┘   └──────┘
    │         │
    ▼         ▼
Dashboard   Erro
```

---

## 🐛 Troubleshooting

### **Erro: "Token não encontrado"**
- Token digitado incorretamente
- Token foi deletado do banco
- Verificar no painel admin se o token existe

### **Erro: "Token expirado"**
- Token passou da data de expiração
- Solução: Criar novo token OU estender o token existente

### **Erro: "Não autorizado" no admin**
- Senha incorreta
- Verificar se está usando `a1b2c3d4`
- Se alterou a senha, usar a nova

### **Cliente não consegue acessar**
- Verificar se token está ativo no painel admin
- Verificar data de expiração
- Verificar se servidor está online

---

## 📦 Dependências

```json
{
  "sqlite3": "^5.1.7",     // Banco de dados
  "express": "^4.18.2",    // API REST
  "ws": "^8.14.2"          // WebSocket
}
```

---

## 🎯 Próximos Passos (Opcional)

- [ ] Interface visual para alterar senha do admin
- [ ] Sistema de renovação automática de tokens
- [ ] Integração com pagamento (Mercado Pago/Stripe)
- [ ] Logs de acesso dos clientes
- [ ] Notificação quando token próximo de expirar
- [ ] Multi-níveis de acesso (básico, premium, etc)

---

## 📞 Suporte

Sistema funcionando 100%! Qualquer dúvida, estou aqui para ajudar.

**Senhas e Acessos:**
- 🔑 Senha Admin Padrão: `a1b2c3d4`
- 🌐 Painel Admin: `https://krystalodd.pages.dev/admin.html`
- 🌐 Dashboard: `https://krystalodd.pages.dev`
- 🔌 API (Ngrok): `https://ectopic-rounded-izabella.ngrok-free.dev`

---

**Desenvolvido com ❤️ por Claude Code**
