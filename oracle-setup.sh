#!/bin/bash
# Script de setup para Oracle Cloud - Ubuntu 22.04
# Execute com: bash oracle-setup.sh

set -e  # Parar em caso de erro

echo "🚀 Iniciando setup do KrystalOdd na Oracle Cloud..."
echo ""

# Atualizar sistema
echo "📦 Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20 LTS
echo "📥 Instalando Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
echo "✅ Node.js $(node -v) instalado"
echo "✅ npm $(npm -v) instalado"

# Instalar PM2 globalmente
echo "📥 Instalando PM2 (Process Manager)..."
sudo npm install -g pm2

# Instalar dependências do Puppeteer
echo "📥 Instalando dependências do Chrome/Puppeteer..."
sudo apt install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils

# Criar diretório do projeto
echo "📁 Criando diretório do projeto..."
mkdir -p ~/krystalodd
cd ~/krystalodd

# Configurar Git (se não estiver configurado)
if ! git config user.name > /dev/null 2>&1; then
    echo "⚙️  Configure seu Git:"
    read -p "Nome: " git_name
    read -p "Email: " git_email
    git config --global user.name "$git_name"
    git config --global user.email "$git_email"
fi

echo ""
echo "✅ Setup base concluído!"
echo ""
echo "📝 Próximos passos:"
echo "1. Clone seu repositório: git clone <seu-repo-url> ."
echo "2. Copie o arquivo .env: cp .env.example .env"
echo "3. Edite as variáveis de ambiente: nano .env"
echo "4. Instale as dependências: npm install"
echo "5. Inicie com PM2: pm2 start ecosystem.config.js"
echo "6. Salve o PM2 para reiniciar no boot: pm2 save && pm2 startup"
echo ""
echo "🔥 Servidor pronto para receber o projeto!"
