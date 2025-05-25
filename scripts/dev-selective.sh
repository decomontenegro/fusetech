#!/bin/bash

# Cores para melhor visualização
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}===================================================${NC}"
echo -e "${GREEN}Iniciando serviços selecionados FuseLabs App${NC}"
echo -e "${BLUE}===================================================${NC}"

# Lista de serviços disponíveis
declare -a services=("web" "strava-worker" "social-listener" "token-service" "fraud-detection")

# Função para mostrar ajuda
show_help() {
  echo -e "${BLUE}Uso: $0 [opções]${NC}"
  echo -e "${YELLOW}Opções:${NC}"
  echo -e "  -h, --help      Mostra esta ajuda"
  echo -e "  -s, --services  Lista de serviços para iniciar, separados por vírgula"
  echo -e "                  Serviços disponíveis: ${services[*]}"
  echo -e "  -r, --redis     Iniciar Redis (opcional, padrão: sim)"
  echo -e "\n${BLUE}Exemplo:${NC}"
  echo -e "  $0 -s web,token-service"
  echo -e "  $0 --services fraud-detection,strava-worker"
  exit 0
}

# Definir valores padrão
start_redis=true
selected_services=()

# Processar argumentos
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      ;;
    -s|--services)
      IFS=',' read -ra selected_services <<< "$2"
      shift 2
      ;;
    -r|--redis)
      if [[ "$2" == "no" || "$2" == "false" ]]; then
        start_redis=false
      fi
      shift 2
      ;;
    *)
      echo -e "${RED}Opção desconhecida: $1${NC}"
      show_help
      ;;
  esac
done

# Se nenhum serviço for especificado, perguntar ao usuário
if [[ ${#selected_services[@]} -eq 0 ]]; then
  echo -e "${YELLOW}Nenhum serviço selecionado. Quais serviços você deseja iniciar?${NC}"
  echo -e "${BLUE}Serviços disponíveis: ${services[*]}${NC}"
  echo -e "${YELLOW}Digite os serviços separados por vírgula (ou 'all' para todos):${NC}"
  read -p "> " services_input

  if [[ "$services_input" == "all" ]]; then
    selected_services=("${services[@]}")
  else
    IFS=',' read -ra selected_services <<< "$services_input"
  fi
fi

# Verificar se Redis está rodando, se necessário
if [[ "$start_redis" == true ]]; then
  redis-cli ping > /dev/null 2>&1
  if [[ $? -ne 0 ]]; then
    echo -e "${RED}[ERRO] Redis não está rodando. Iniciando Redis...${NC}"
    brew services start redis || docker run -d -p 6379:6379 redis
    sleep 2
  else
    echo -e "${GREEN}Redis já está rodando.${NC}"
  fi
fi

# Iniciar serviços em terminais separados usando Tmux
if command -v tmux &> /dev/null; then
  echo -e "${GREEN}Iniciando serviços com Tmux...${NC}"

  # Cria uma nova sessão tmux
  tmux new-session -d -s fuselabs_selective

  # Variável para controlar o primeiro serviço
  first=true

  # Iniciar cada serviço selecionado
  for service in "${selected_services[@]}"; do
    # Verificar se o serviço é válido
    valid=false
    for valid_service in "${services[@]}"; do
      if [[ "$service" == "$valid_service" ]]; then
        valid=true
        break
      fi
    done

    if [[ "$valid" == false ]]; then
      echo -e "${RED}Serviço inválido: $service. Pulando.${NC}"
      continue
    fi

    # Determinar o caminho para o serviço
    if [[ "$service" == "web" ]]; then
      path="apps/web"
    else
      path="services/$service"
    fi

    if [[ "$first" == true ]]; then
      # Para o primeiro serviço, usa a janela já criada
      tmux rename-window -t fuselabs_selective:0 "$service"
      tmux send-keys -t fuselabs_selective:0 "cd $path && echo -e '${GREEN}Iniciando $service...${NC}' && pnpm run dev" C-m
      first=false
    else
      # Para os outros serviços, cria novas janelas
      tmux new-window -t fuselabs_selective -n "$service"
      tmux send-keys -t fuselabs_selective:"$service" "cd $path && echo -e '${GREEN}Iniciando $service...${NC}' && pnpm run dev" C-m
    fi

    echo -e "${GREEN}Serviço $service iniciado na sessão Tmux.${NC}"
  done

  # Anexar à sessão
  echo -e "${BLUE}Pressione Ctrl+B seguido de N para navegar entre as janelas.${NC}"
  tmux attach-session -t fuselabs_selective
else
  echo -e "${YELLOW}[AVISO] Tmux não encontrado. Iniciando serviços em segundo plano.${NC}"

  declare -A pids

  # Iniciar cada serviço selecionado em segundo plano
  for service in "${selected_services[@]}"; do
    # Verificar se o serviço é válido
    valid=false
    for valid_service in "${services[@]}"; do
      if [[ "$service" == "$valid_service" ]]; then
        valid=true
        break
      fi
    done

    if [[ "$valid" == false ]]; then
      echo -e "${RED}Serviço inválido: $service. Pulando.${NC}"
      continue
    fi

    # Determinar o caminho para o serviço
    if [[ "$service" == "web" ]]; then
      path="apps/web"
    else
      path="services/$service"
    fi

    echo -e "${GREEN}Iniciando $service...${NC}"
    cd "$path" && pnpm run dev &
    pids["$service"]=$!
    cd - > /dev/null

    echo -e "${GREEN}Serviço $service iniciado com PID ${pids[$service]}.${NC}"
  done

  # Salvar PIDs em arquivos temporários
  for service in "${!pids[@]}"; do
    echo "${pids[$service]}" > "/tmp/fuselabs_${service}.pid"
  done

  echo -e "${GREEN}Todos os serviços selecionados iniciados. Pressione Ctrl+C para encerrar.${NC}"

  # Criar string para trap com todos os PIDs
  pids_str=""
  for pid in "${pids[@]}"; do
    pids_str="$pids_str $pid"
  done

  # Tratar sinal de interrupção para encerrar todos os processos
  trap "echo -e '${RED}Encerrando serviços...${NC}'; kill$pids_str; for service in ${!pids[@]}; do rm -f /tmp/fuselabs_\${service}.pid; done; exit" INT TERM

  # Esperar indefinidamente
  wait
fi