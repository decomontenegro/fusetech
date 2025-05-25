#!/bin/bash

# Cores para melhor visualização
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}===================================================${NC}"
echo -e "${RED}Parando ambiente de desenvolvimento FuseLabs App${NC}"
echo -e "${BLUE}===================================================${NC}"

# Serviços conhecidos
SERVICES=("web" "strava-worker" "social-listener" "token-service" "fraud-detection" "gamification")

# Função para parar um serviço
stop_service() {
  local service=$1
  local pid_file="/tmp/fuselabs_${service}.pid"
  
  # Verificar se o arquivo PID existe
  if [ -f "$pid_file" ]; then
    local pid=$(cat "$pid_file")
    
    echo -e "${YELLOW}Parando $service (PID: $pid)...${NC}"
    
    # Verificar se o processo ainda está rodando
    if ps -p $pid > /dev/null; then
      # Tentar matar gentilmente primeiro
      kill $pid 2>/dev/null || kill -9 $pid 2>/dev/null
      
      if [ $? -eq 0 ]; then
        echo -e "${GREEN}$service parado com sucesso.${NC}"
      else
        echo -e "${RED}Não foi possível parar $service.${NC}"
      fi
    else
      echo -e "${YELLOW}Processo $pid não encontrado. O serviço pode já estar parado.${NC}"
    fi
    
    # Remover o arquivo PID
    rm -f "$pid_file"
  else
    echo -e "${YELLOW}Arquivo PID para $service não encontrado.${NC}"
  fi
}

# Parar todos os serviços conhecidos
for service in "${SERVICES[@]}"; do
  stop_service "$service"
done

# Verificar por serviços adicionais com arquivos PID
for pid_file in /tmp/fuselabs_*.pid; do
  if [ -f "$pid_file" ]; then
    service=$(basename "$pid_file" | sed 's/fuselabs_//g' | sed 's/.pid//g')
    if [[ ! " ${SERVICES[@]} " =~ " ${service} " ]]; then
      stop_service "$service"
    fi
  fi
done

echo -e "${BLUE}===================================================${NC}"
echo -e "${GREEN}Todos os serviços foram parados.${NC}"
echo -e "${BLUE}===================================================${NC}"

# Perguntar se deseja parar o Redis
echo -ne "${YELLOW}Deseja parar o Redis também? (s/n): ${NC}"
read answer

if [[ "$answer" == "s" || "$answer" == "S" || "$answer" == "sim" ]]; then
  echo -e "${YELLOW}Parando Redis...${NC}"
  
  # Tentar parar via brew primeiro
  if command -v brew &> /dev/null; then
    brew services stop redis
  fi
  
  # Verificar se há instâncias de Redis no Docker
  redis_containers=$(docker ps | grep redis | awk '{print $1}')
  if [ ! -z "$redis_containers" ]; then
    echo -e "${YELLOW}Parando containers Redis...${NC}"
    docker stop $redis_containers
  fi
  
  echo -e "${GREEN}Redis parado.${NC}"
fi 