#!/bin/bash

# Cores para melhor visualização
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}===================================================${NC}"
echo -e "${GREEN}Iniciando preview Docker do FuseLabs App${NC}"
echo -e "${BLUE}===================================================${NC}"

# Verificar se .env.example existe
if [ ! -f .env.example ]; then
  echo -e "${RED}Arquivo .env.example não encontrado. Verifique se você está no diretório raiz do projeto.${NC}"
  exit 1
fi

# Verificar se .env já existe
if [ ! -f .env ]; then
  echo -e "${YELLOW}Arquivo .env não encontrado. Criando a partir de .env.example...${NC}"
  cp .env.example .env
  echo -e "${GREEN}Arquivo .env criado com sucesso.${NC}"
else
  echo -e "${GREEN}Arquivo .env já existe.${NC}"
fi

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
  echo -e "${RED}Docker não encontrado. Por favor, instale o Docker primeiro.${NC}"
  exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
  echo -e "${RED}Docker Compose não encontrado. Por favor, instale o Docker Compose primeiro.${NC}"
  exit 1
fi

# Parar qualquer container em execução
echo -e "${YELLOW}Parando containers em execução...${NC}"
docker-compose down --volumes

# Construir as imagens
echo -e "${YELLOW}Construindo imagens Docker...${NC}"
docker-compose build

# Iniciar os containers
echo -e "${YELLOW}Iniciando containers...${NC}"
docker-compose up -d

echo -e "${BLUE}===================================================${NC}"
echo -e "${GREEN}Preview iniciado com sucesso!${NC}"
echo -e "${BLUE}Serviços disponíveis em:${NC}"
echo -e "  Web App: ${GREEN}http://localhost:3000${NC}"
echo -e "  Strava Worker: ${GREEN}http://localhost:3001${NC}"
echo -e "  Social Listener: ${GREEN}http://localhost:3002${NC}"
echo -e "  Token Service: ${GREEN}http://localhost:3003${NC}"
echo -e "  Fraud Detection: ${GREEN}http://localhost:3004${NC}"
echo -e "${BLUE}===================================================${NC}"
echo -e "${YELLOW}Para ver os logs:${NC} docker-compose logs -f"
echo -e "${YELLOW}Para parar:${NC} docker-compose down" 