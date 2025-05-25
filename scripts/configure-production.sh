#!/bin/bash

# FUSEtech Production Configuration Script
set -e

echo "🚀 Configurando FUSEtech para Produção..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration file
CONFIG_FILE=".env.production"

# Function to prompt for input
prompt_input() {
    local prompt="$1"
    local var_name="$2"
    local default_value="$3"
    local is_secret="$4"
    
    if [ "$is_secret" = "true" ]; then
        echo -n -e "${YELLOW}$prompt${NC}"
        read -s value
        echo
    else
        echo -n -e "${YELLOW}$prompt${NC}"
        read value
    fi
    
    if [ -z "$value" ] && [ -n "$default_value" ]; then
        value="$default_value"
    fi
    
    eval "$var_name='$value'"
}

# Function to generate random string
generate_random() {
    openssl rand -hex 32
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}           FUSETECH PRODUCTION SETUP           ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 1. BASIC CONFIGURATION
echo -e "\n${PURPLE}📋 1. CONFIGURAÇÃO BÁSICA${NC}"

prompt_input "Domain (ex: fusetech.app): " DOMAIN "fusetech.app"
prompt_input "Environment (production/staging): " NODE_ENV "production"

APP_URL="https://$DOMAIN"

# 2. SUPABASE CONFIGURATION
echo -e "\n${PURPLE}🗄️ 2. CONFIGURAÇÃO SUPABASE${NC}"
echo -e "${YELLOW}Acesse: https://supabase.com/dashboard${NC}"
echo -e "${YELLOW}Crie um novo projeto e obtenha as credenciais${NC}"

prompt_input "Supabase URL: " SUPABASE_URL
prompt_input "Supabase Anon Key: " SUPABASE_ANON_KEY "" true
prompt_input "Supabase Service Role Key: " SUPABASE_SERVICE_KEY "" true

# 3. STRAVA CONFIGURATION
echo -e "\n${PURPLE}🏃‍♂️ 3. CONFIGURAÇÃO STRAVA${NC}"
echo -e "${YELLOW}Acesse: https://developers.strava.com/${NC}"
echo -e "${YELLOW}Crie uma aplicação e configure callback: $APP_URL/auth/strava/callback${NC}"

prompt_input "Strava Client ID: " STRAVA_CLIENT_ID
prompt_input "Strava Client Secret: " STRAVA_CLIENT_SECRET "" true

STRAVA_WEBHOOK_TOKEN=$(generate_random)
echo -e "${GREEN}✓ Webhook token gerado automaticamente${NC}"

# 4. FIREBASE CONFIGURATION
echo -e "\n${PURPLE}🔥 4. CONFIGURAÇÃO FIREBASE${NC}"
echo -e "${YELLOW}Acesse: https://console.firebase.google.com/${NC}"
echo -e "${YELLOW}Crie um projeto e ative Cloud Messaging${NC}"

prompt_input "Firebase API Key: " FIREBASE_API_KEY "" true
prompt_input "Firebase Project ID: " FIREBASE_PROJECT_ID
prompt_input "Firebase Messaging Sender ID: " FIREBASE_SENDER_ID
prompt_input "Firebase App ID: " FIREBASE_APP_ID
prompt_input "Firebase VAPID Key: " FIREBASE_VAPID_KEY "" true

# 5. BLOCKCHAIN CONFIGURATION
echo -e "\n${PURPLE}⛓️ 5. CONFIGURAÇÃO BLOCKCHAIN${NC}"
echo -e "${YELLOW}Configure sua carteira para deploy dos contratos${NC}"

prompt_input "Private Key (para deploy): " PRIVATE_KEY "" true
prompt_input "Base RPC URL: " BASE_RPC_URL "https://mainnet.base.org"
prompt_input "Basescan API Key: " BASESCAN_API_KEY "" true

# 6. ANALYTICS CONFIGURATION
echo -e "\n${PURPLE}📊 6. CONFIGURAÇÃO ANALYTICS${NC}"

prompt_input "Google Analytics ID (G-XXXXXXXXXX): " GA_MEASUREMENT_ID
prompt_input "Mixpanel Token (opcional): " MIXPANEL_TOKEN

# 7. MONITORING CONFIGURATION
echo -e "\n${PURPLE}🔍 7. CONFIGURAÇÃO MONITORAMENTO${NC}"

prompt_input "Sentry DSN: " SENTRY_DSN "" true
prompt_input "Sentry Auth Token: " SENTRY_AUTH_TOKEN "" true

# 8. EMAIL CONFIGURATION
echo -e "\n${PURPLE}📧 8. CONFIGURAÇÃO EMAIL${NC}"

prompt_input "Resend API Key (opcional): " RESEND_API_KEY "" true
prompt_input "SendGrid API Key (opcional): " SENDGRID_API_KEY "" true

# 9. SECURITY CONFIGURATION
echo -e "\n${PURPLE}🔒 9. CONFIGURAÇÃO SEGURANÇA${NC}"

JWT_SECRET=$(generate_random)
ENCRYPTION_KEY=$(generate_random)
echo -e "${GREEN}✓ Chaves de segurança geradas automaticamente${NC}"

# 10. GENERATE CONFIGURATION FILE
echo -e "\n${PURPLE}📝 10. GERANDO ARQUIVO DE CONFIGURAÇÃO${NC}"

cat > $CONFIG_FILE << EOF
# FUSEtech Production Configuration
# Generated on $(date)

# Basic Configuration
NODE_ENV=$NODE_ENV
NEXT_PUBLIC_APP_URL=$APP_URL

# Supabase
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY

# Strava API
NEXT_PUBLIC_STRAVA_CLIENT_ID=$STRAVA_CLIENT_ID
STRAVA_CLIENT_SECRET=$STRAVA_CLIENT_SECRET
STRAVA_WEBHOOK_VERIFY_TOKEN=$STRAVA_WEBHOOK_TOKEN

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=$FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=$FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_VAPID_KEY=$FIREBASE_VAPID_KEY

# Blockchain
PRIVATE_KEY=$PRIVATE_KEY
NEXT_PUBLIC_BASE_RPC_URL=$BASE_RPC_URL
BASESCAN_API_KEY=$BASESCAN_API_KEY

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=$GA_MEASUREMENT_ID
MIXPANEL_TOKEN=$MIXPANEL_TOKEN

# Monitoring
SENTRY_DSN=$SENTRY_DSN
SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

# Email
RESEND_API_KEY=$RESEND_API_KEY
SENDGRID_API_KEY=$SENDGRID_API_KEY

# Security
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
EOF

echo -e "${GREEN}✓ Arquivo $CONFIG_FILE criado com sucesso!${NC}"

# 11. DEPLOY SMART CONTRACTS
echo -e "\n${PURPLE}⛓️ 11. DEPLOY DOS SMART CONTRACTS${NC}"

if [ -n "$PRIVATE_KEY" ]; then
    echo -e "${YELLOW}Fazendo deploy dos contratos...${NC}"
    
    # Install hardhat dependencies if needed
    if [ ! -d "node_modules/hardhat" ]; then
        npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
    fi
    
    # Deploy contracts
    npx hardhat run scripts/deploy-contracts.js --network base
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Contratos deployados com sucesso!${NC}"
        
        # Read contract address from deployment file
        if [ -f "deployments/base.json" ]; then
            CONTRACT_ADDRESS=$(cat deployments/base.json | grep -o '"contractAddress":"[^"]*' | cut -d'"' -f4)
            echo "FUSE_TOKEN_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> $CONFIG_FILE
            echo -e "${GREEN}✓ Endereço do contrato adicionado: $CONTRACT_ADDRESS${NC}"
        fi
    else
        echo -e "${RED}✗ Falha no deploy dos contratos${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Private key não fornecida - pule o deploy manual dos contratos${NC}"
fi

# 12. SETUP VERCEL
echo -e "\n${PURPLE}🚀 12. CONFIGURAÇÃO VERCEL${NC}"

if command -v vercel >/dev/null 2>&1; then
    echo -e "${YELLOW}Configurando projeto no Vercel...${NC}"
    
    # Link project
    vercel link --yes
    
    # Set environment variables
    while IFS='=' read -r key value; do
        if [[ $key != \#* ]] && [[ -n $key ]]; then
            vercel env add "$key" production <<< "$value"
        fi
    done < $CONFIG_FILE
    
    echo -e "${GREEN}✓ Variáveis de ambiente configuradas no Vercel${NC}"
    
    # Add domain
    vercel domains add "$DOMAIN"
    
    echo -e "${GREEN}✓ Domínio $DOMAIN adicionado ao Vercel${NC}"
else
    echo -e "${YELLOW}⚠ Vercel CLI não encontrado - configure manualmente${NC}"
fi

# 13. SETUP CLOUDFLARE
echo -e "\n${PURPLE}☁️ 13. CONFIGURAÇÃO CLOUDFLARE${NC}"
echo -e "${YELLOW}Configure manualmente:${NC}"
echo -e "${BLUE}1. Adicione $DOMAIN ao Cloudflare${NC}"
echo -e "${BLUE}2. Configure DNS: CNAME @ cname.vercel-dns.com${NC}"
echo -e "${BLUE}3. Configure SSL: Full (strict)${NC}"
echo -e "${BLUE}4. Ative 'Always Use HTTPS'${NC}"

# 14. FINAL VERIFICATION
echo -e "\n${PURPLE}✅ 14. VERIFICAÇÃO FINAL${NC}"

echo -e "${YELLOW}Executando verificações...${NC}"

# Check if all required variables are set
required_vars=("SUPABASE_URL" "STRAVA_CLIENT_ID" "FIREBASE_PROJECT_ID")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ Todas as variáveis obrigatórias configuradas${NC}"
else
    echo -e "${RED}✗ Variáveis faltando: ${missing_vars[*]}${NC}"
fi

# 15. NEXT STEPS
echo -e "\n${PURPLE}📋 15. PRÓXIMOS PASSOS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${GREEN}✅ Configuração concluída!${NC}"
echo -e "\n${YELLOW}Próximos passos:${NC}"
echo -e "${BLUE}1. Copie $CONFIG_FILE para .env.local${NC}"
echo -e "${BLUE}2. Execute: npm run build${NC}"
echo -e "${BLUE}3. Execute: vercel --prod${NC}"
echo -e "${BLUE}4. Configure DNS no Cloudflare${NC}"
echo -e "${BLUE}5. Teste todas as funcionalidades${NC}"
echo -e "${BLUE}6. Configure monitoramento${NC}"
echo -e "${BLUE}7. Inicie beta testing${NC}"

echo -e "\n${GREEN}🎉 FUSEtech está pronto para produção!${NC}"
echo -e "${BLUE}App URL: $APP_URL${NC}"
echo -e "${BLUE}Configuração salva em: $CONFIG_FILE${NC}"

# Create summary file
cat > PRODUCTION_SUMMARY.md << EOF
# 🚀 FUSEtech Production Setup Summary

## ✅ Configuration Completed
- **Domain:** $DOMAIN
- **Environment:** $NODE_ENV
- **App URL:** $APP_URL

## 🔧 Services Configured
- ✅ Supabase Database
- ✅ Strava Integration
- ✅ Firebase Push Notifications
- ✅ Blockchain (Base L2)
- ✅ Analytics (Google Analytics)
- ✅ Monitoring (Sentry)
- ✅ Security (JWT, Encryption)

## 📋 Next Steps
1. Copy $CONFIG_FILE to .env.local
2. Run: npm run build
3. Deploy: vercel --prod
4. Configure Cloudflare DNS
5. Test all functionalities
6. Setup monitoring alerts
7. Launch beta testing

## 🎯 Ready for Launch!
Generated on: $(date)
EOF

echo -e "\n${GREEN}📄 Resumo salvo em: PRODUCTION_SUMMARY.md${NC}"
