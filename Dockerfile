# Usar Node.js LTS
FROM node:20-slim

# Diretório de trabalho
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências (apenas produção)
RUN npm install --production

# Copiar código do servidor
COPY server.js ./

# Expor porta
EXPOSE 3000

# Variável de ambiente
ENV PORT=3000

# Comando para iniciar
CMD ["node", "server.js"]
