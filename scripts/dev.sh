#!/bin/bash

# Cores para melhor visualização
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}===================================================${NC}"
echo -e "${GREEN}Iniciando ambiente de desenvolvimento FuseLabs App${NC}"
echo -e "${BLUE}===================================================${NC}"

# Verificar se Redis está rodando
redis-cli ping > /dev/null 2>&1
if [[ $? -ne 0 ]]; then
  echo -e "${YELLOW}[AVISO] Redis não está rodando. Tentando iniciar...${NC}"

  # Tentar iniciar com brew primeiro
  if command -v brew &> /dev/null; then
    brew services start redis || \
    # Caso falhe, tentar com Docker
    (docker run -d -p 6379:6379 redis && echo -e "${GREEN}Redis iniciado via Docker.${NC}")
  else
    # Se não tiver brew, usar Docker diretamente
    docker run -d -p 6379:6379 redis && \
    echo -e "${GREEN}Redis iniciado via Docker.${NC}" || \
    echo -e "${RED}[ERRO] Não foi possível iniciar Redis. Certifique-se de que brew ou Docker estão instalados.${NC}" && exit 1
  fi
else
  echo -e "${GREEN}Redis já está rodando.${NC}"
fi

# Verificar se existe pnpm ou npm
if command -v pnpm &> /dev/null; then
  PKG_MANAGER="pnpm"
else
  echo -e "${YELLOW}[AVISO] pnpm não encontrado. Instalando pnpm globalmente...${NC}"
  npm install -g pnpm
  PKG_MANAGER="pnpm"
fi

# Iniciar todos os serviços em paralelo
echo -e "${BLUE}Iniciando serviços...${NC}"

# Criar logs dir se não existir
mkdir -p logs

# Função para iniciar um serviço
start_service() {
  local service=$1
  local path=$2

  echo -e "${GREEN}Iniciando $service...${NC}"

  # Verificar se o diretório existe
  if [ ! -d "$path" ]; then
    echo -e "${RED}Diretório $path não encontrado. Pulando $service.${NC}"
    return
  fi

  # Iniciar o serviço e redirecionar logs
  cd $path && $PKG_MANAGER run dev > ../../logs/$service.log 2>&1 &
  echo $! > /tmp/fuselabs_$service.pid

  echo -e "${GREEN}$service iniciado (PID: $(cat /tmp/fuselabs_$service.pid))${NC}"
  cd - > /dev/null
}

# Iniciar aplicação web
start_service "web" "apps/web"

# Iniciar microserviços
start_service "strava-worker" "services/strava-worker"
start_service "social-listener" "services/social-listener"
start_service "token-service" "services/token-service"
start_service "fraud-detection" "services/fraud-detection"
start_service "gamification" "services/gamification"

echo -e "${BLUE}===================================================${NC}"
echo -e "${GREEN}Todos os serviços iniciados!${NC}"
echo -e "${BLUE}Logs disponíveis em:${NC} ./logs/"
echo -e "${BLUE}Para parar todos os serviços, execute:${NC} ./scripts/stop.sh"
echo -e "${BLUE}===================================================${NC}"