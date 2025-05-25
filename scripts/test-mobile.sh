#!/bin/bash

# FUSEtech Mobile Testing Script
set -e

echo "📱 Iniciando testes mobile do FUSEtech..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get local IP
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
    else
        # Linux
        hostname -I | awk '{print $1}'
    fi
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}           FUSETECH MOBILE TESTING            ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Menu de opções
echo -e "\n${PURPLE}Escolha o método de teste:${NC}"
echo -e "${YELLOW}1.${NC} Teste local (rede local)"
echo -e "${YELLOW}2.${NC} Teste com tunnel (ngrok)"
echo -e "${YELLOW}3.${NC} Teste automatizado (Playwright)"
echo -e "${YELLOW}4.${NC} Análise de performance (Lighthouse)"
echo -e "${YELLOW}5.${NC} Todos os testes"
echo -e "${YELLOW}6.${NC} Setup inicial"

read -p "$(echo -e ${YELLOW}Escolha uma opção [1-6]: ${NC})" choice

case $choice in
    1)
        echo -e "\n${PURPLE}📱 TESTE LOCAL${NC}"
        
        # Get local IP
        LOCAL_IP=$(get_local_ip)
        
        if [ -z "$LOCAL_IP" ]; then
            echo -e "${RED}❌ Não foi possível obter o IP local${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}🌐 IP Local detectado: $LOCAL_IP${NC}"
        
        # Start development server
        echo -e "${YELLOW}🚀 Iniciando servidor de desenvolvimento...${NC}"
        echo -e "${BLUE}Acesse no seu mobile: http://$LOCAL_IP:3000${NC}"
        echo -e "${BLUE}Pressione Ctrl+C para parar${NC}"
        
        npm run dev -- --hostname 0.0.0.0
        ;;
        
    2)
        echo -e "\n${PURPLE}🌐 TESTE COM TUNNEL${NC}"
        
        # Check if ngrok is installed
        if ! command_exists ngrok; then
            echo -e "${YELLOW}📦 Instalando ngrok...${NC}"
            if [[ "$OSTYPE" == "darwin"* ]]; then
                brew install ngrok
            else
                echo -e "${RED}❌ Por favor, instale ngrok manualmente${NC}"
                echo -e "${BLUE}https://ngrok.com/download${NC}"
                exit 1
            fi
        fi
        
        # Start development server in background
        echo -e "${YELLOW}🚀 Iniciando servidor de desenvolvimento...${NC}"
        npm run dev &
        DEV_PID=$!
        
        # Wait for server to start
        sleep 5
        
        # Start ngrok tunnel
        echo -e "${YELLOW}🌐 Criando tunnel ngrok...${NC}"
        ngrok http 3000 &
        NGROK_PID=$!
        
        # Wait for ngrok to start
        sleep 3
        
        # Get ngrok URL
        NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok\.io')
        
        if [ -n "$NGROK_URL" ]; then
            echo -e "${GREEN}✅ Tunnel criado com sucesso!${NC}"
            echo -e "${BLUE}🔗 URL pública: $NGROK_URL${NC}"
            echo -e "${BLUE}📱 Acesse esta URL no seu mobile${NC}"
            echo -e "${BLUE}🌐 Dashboard ngrok: http://localhost:4040${NC}"
        else
            echo -e "${RED}❌ Falha ao criar tunnel${NC}"
        fi
        
        # Wait for user input to stop
        read -p "$(echo -e ${YELLOW}Pressione Enter para parar os serviços...${NC})"
        
        # Kill processes
        kill $DEV_PID $NGROK_PID 2>/dev/null || true
        ;;
        
    3)
        echo -e "\n${PURPLE}🧪 TESTE AUTOMATIZADO${NC}"
        
        # Check if Playwright is installed
        if [ ! -d "node_modules/@playwright" ]; then
            echo -e "${YELLOW}📦 Instalando Playwright...${NC}"
            npm install --save-dev @playwright/test
            npx playwright install
        fi
        
        # Create mobile test file if it doesn't exist
        if [ ! -f "tests/mobile.test.ts" ]; then
            echo -e "${YELLOW}📝 Criando arquivo de teste mobile...${NC}"
            mkdir -p tests
            cat > tests/mobile.test.ts << 'EOF'
import { test, expect, devices } from '@playwright/test'

const iPhone = devices['iPhone 12']
const android = devices['Pixel 5']

test.describe('Mobile Tests', () => {
  test('iPhone - Onboarding Flow', async ({ browser }) => {
    const context = await browser.newContext({
      ...iPhone,
      geolocation: { latitude: -23.5505, longitude: -46.6333 },
      permissions: ['geolocation'],
    })
    
    const page = await context.newPage()
    await page.goto('http://localhost:3000')
    
    // Test mobile onboarding
    await page.tap('text=Começar agora')
    await expect(page.locator('text=Bem-vindo ao FUSEtech!')).toBeVisible()
    
    await context.close()
  })
  
  test('Android - Performance', async ({ browser }) => {
    const context = await browser.newContext({
      ...android,
      offline: false,
      downloadThroughput: 1.5 * 1024 * 1024 / 8,
      uploadThroughput: 750 * 1024 / 8,
      latency: 40,
    })
    
    const page = await context.newPage()
    
    const startTime = Date.now()
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    console.log(`📊 Mobile load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(5000)
    
    await context.close()
  })
})
EOF
        fi
        
        # Start development server in background
        echo -e "${YELLOW}🚀 Iniciando servidor...${NC}"
        npm run dev &
        DEV_PID=$!
        
        # Wait for server to start
        sleep 5
        
        # Run mobile tests
        echo -e "${YELLOW}🧪 Executando testes mobile...${NC}"
        npx playwright test tests/mobile.test.ts --reporter=html
        
        # Kill development server
        kill $DEV_PID 2>/dev/null || true
        
        echo -e "${GREEN}✅ Testes concluídos!${NC}"
        echo -e "${BLUE}📊 Relatório: playwright-report/index.html${NC}"
        ;;
        
    4)
        echo -e "\n${PURPLE}📊 ANÁLISE DE PERFORMANCE${NC}"
        
        # Check if Lighthouse is installed
        if ! command_exists lighthouse; then
            echo -e "${YELLOW}📦 Instalando Lighthouse...${NC}"
            npm install -g lighthouse
        fi
        
        # Start development server in background
        echo -e "${YELLOW}🚀 Iniciando servidor...${NC}"
        npm run dev &
        DEV_PID=$!
        
        # Wait for server to start
        sleep 5
        
        # Run Lighthouse mobile audit
        echo -e "${YELLOW}📊 Executando análise Lighthouse mobile...${NC}"
        lighthouse http://localhost:3000 \
            --emulated-form-factor=mobile \
            --throttling.cpuSlowdownMultiplier=4 \
            --output=html \
            --output-path=./lighthouse-mobile.html \
            --quiet
        
        # Kill development server
        kill $DEV_PID 2>/dev/null || true
        
        echo -e "${GREEN}✅ Análise concluída!${NC}"
        echo -e "${BLUE}📊 Relatório: lighthouse-mobile.html${NC}"
        
        # Open report if on macOS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open lighthouse-mobile.html
        fi
        ;;
        
    5)
        echo -e "\n${PURPLE}🎯 EXECUTANDO TODOS OS TESTES${NC}"
        
        # Run all tests sequentially
        echo -e "${YELLOW}1/3 Teste automatizado...${NC}"
        $0 3
        
        echo -e "${YELLOW}2/3 Análise de performance...${NC}"
        $0 4
        
        echo -e "${YELLOW}3/3 Configurando tunnel para teste manual...${NC}"
        $0 2
        ;;
        
    6)
        echo -e "\n${PURPLE}⚙️ SETUP INICIAL${NC}"
        
        # Install dependencies
        echo -e "${YELLOW}📦 Instalando dependências...${NC}"
        
        # Playwright
        if [ ! -d "node_modules/@playwright" ]; then
            npm install --save-dev @playwright/test
            npx playwright install
        fi
        
        # Lighthouse
        if ! command_exists lighthouse; then
            npm install -g lighthouse
        fi
        
        # ngrok (macOS only)
        if [[ "$OSTYPE" == "darwin"* ]] && ! command_exists ngrok; then
            brew install ngrok
        fi
        
        # Create mobile testing scripts in package.json
        echo -e "${YELLOW}📝 Adicionando scripts ao package.json...${NC}"
        
        # Add scripts if they don't exist
        if ! grep -q "dev:mobile" package.json; then
            npm pkg set scripts.dev:mobile="next dev --hostname 0.0.0.0"
        fi
        
        if ! grep -q "test:mobile" package.json; then
            npm pkg set scripts.test:mobile="playwright test tests/mobile.test.ts"
        fi
        
        if ! grep -q "lighthouse:mobile" package.json; then
            npm pkg set scripts.lighthouse:mobile="lighthouse http://localhost:3000 --emulated-form-factor=mobile --output=html"
        fi
        
        # Create icons directory
        mkdir -p public/icons
        
        echo -e "${GREEN}✅ Setup concluído!${NC}"
        echo -e "${BLUE}📱 Agora você pode executar:${NC}"
        echo -e "${BLUE}  npm run dev:mobile${NC}"
        echo -e "${BLUE}  npm run test:mobile${NC}"
        echo -e "${BLUE}  npm run lighthouse:mobile${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ Opção inválida${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}🎉 Teste mobile concluído!${NC}"
echo -e "${BLUE}📖 Documentação completa: docs/MOBILE_TESTING.md${NC}"
