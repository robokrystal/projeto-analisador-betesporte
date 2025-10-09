#!/bin/bash
# Script de backup automático para SQLite
# Uso: bash backup-db.sh

# Configurações
BACKUP_DIR="/home/ubuntu/backups"
DB_PATH="/home/ubuntu/krystalodd/backend/tokens.db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/tokens_$DATE.db"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Verificar se banco existe
if [ ! -f "$DB_PATH" ]; then
    echo -e "${YELLOW}⚠️  Banco de dados não encontrado: $DB_PATH${NC}"
    exit 1
fi

# Fazer backup
echo "📦 Criando backup do banco de dados..."
cp "$DB_PATH" "$BACKUP_FILE"

# Verificar se backup foi criado
if [ -f "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup criado com sucesso!${NC}"
    echo "   Arquivo: $BACKUP_FILE"
    echo "   Tamanho: $SIZE"
else
    echo -e "${YELLOW}❌ Erro ao criar backup${NC}"
    exit 1
fi

# Limpar backups antigos (manter últimos 7 dias)
echo "🧹 Limpando backups antigos..."
DELETED=$(find "$BACKUP_DIR" -name "tokens_*.db" -mtime +7 -delete -print | wc -l)

if [ "$DELETED" -gt 0 ]; then
    echo -e "${GREEN}   Removidos $DELETED backup(s) antigo(s)${NC}"
else
    echo "   Nenhum backup antigo para remover"
fi

# Estatísticas
TOTAL_BACKUPS=$(ls -1 "$BACKUP_DIR"/tokens_*.db 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)

echo ""
echo "📊 Estatísticas de backup:"
echo "   Total de backups: $TOTAL_BACKUPS"
echo "   Espaço usado: $TOTAL_SIZE"
echo ""
echo -e "${GREEN}✨ Processo de backup concluído!${NC}"
