# 🔗 Guia de Configuração Strava - FUSEtech

Este guia te ajudará a configurar a integração real com o Strava para o FUSEtech Lite.

## 📋 Pré-requisitos

- [ ] Conta no Strava (gratuita)
- [ ] Acesso ao painel de desenvolvedor do Strava
- [ ] Domínio ou URL para callback (pode ser localhost para testes)

## 🔧 Passo 1: Criar Aplicação no Strava

### 1.1 Acessar Painel de Desenvolvedor
1. Acesse: https://www.strava.com/settings/api
2. Faça login na sua conta Strava
3. Clique em "Create & Manage Your App"

### 1.2 Preencher Informações da Aplicação
```
Application Name: FUSEtech
Category: Training
Club: (deixe em branco)
Website: https://fusetech.app (ou seu domínio)
Application Description: 
"FUSEtech tokeniza suas atividades físicas, recompensando você com tokens FUSE por cada quilômetro percorrido. Conecte sua conta Strava para ganhar tokens automaticamente por corridas, ciclismo e caminhadas."

Authorization Callback Domain: 
- Para desenvolvimento: localhost
- Para produção: seu-dominio.com
```

### 1.3 Configurar Permissões
Selecione as seguintes permissões:
- [x] **Read**: Ler dados básicos do perfil
- [x] **Read All**: Ler todas as atividades (necessário)
- [ ] **Activity Write**: NÃO selecionar (não precisamos escrever)

## 🔑 Passo 2: Obter Credenciais

Após criar a aplicação, você receberá:

```
Client ID: 123456 (número público)
Client Secret: abc123def456... (MANTER SECRETO)
```

⚠️ **IMPORTANTE**: Nunca compartilhe o Client Secret publicamente!

## 🌐 Passo 3: Configurar URLs de Callback

### Para Desenvolvimento Local:
```
Authorization Callback Domain: localhost
Callback URL: http://localhost:8001/api/auth/strava/callback
```

### Para Staging:
```
Authorization Callback Domain: staging.fusetech.app
Callback URL: https://staging.fusetech.app/api/auth/strava/callback
```

### Para Produção:
```
Authorization Callback Domain: fusetech.app
Callback URL: https://fusetech.app/api/auth/strava/callback
```

## 📝 Passo 4: Configurar Variáveis de Ambiente

Crie/atualize seu arquivo `.env.local`:

```bash
# Strava OAuth (REAL)
STRAVA_CLIENT_ID=164887
STRAVA_CLIENT_SECRET=0b5b7d4c81f9aa7b92700514217c9ba647ab9c62

# URLs
NEXTAUTH_URL=http://localhost:8001
NEXT_PUBLIC_APP_URL=http://localhost:8001

# Desabilitar mock para usar Strava real
NEXT_PUBLIC_USE_MOCK_STRAVA=false
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
```

## 🧪 Passo 5: Testar Integração

### 5.1 Verificar Credenciais
Execute o teste de credenciais:
```bash
node scripts/test-strava-credentials.js
```

### 5.2 Testar OAuth Flow
1. Acesse: http://localhost:8001/api/lite-demo
2. Clique "Connect Strava Account"
3. Será redirecionado para Strava
4. Autorize a aplicação
5. Retornará para o dashboard com dados reais

## 🔒 Segurança e Boas Práticas

### ✅ Fazer:
- Manter Client Secret em variáveis de ambiente
- Usar HTTPS em produção
- Implementar rate limiting
- Validar tokens de acesso
- Implementar refresh de tokens

### ❌ Não Fazer:
- Expor Client Secret no código
- Armazenar tokens em localStorage
- Fazer muitas requisições por minuto
- Ignorar limites de rate da API

## 📊 Limites da API Strava

```
Rate Limits:
- 15 minutos: 100 requests
- Diário: 1,000 requests
- Por aplicação: 30,000 requests/dia

Recomendações:
- Cache dados quando possível
- Implemente backoff exponencial
- Monitore uso da API
```

## 🚨 Troubleshooting

### Erro: "Invalid Client"
- Verifique se Client ID está correto
- Confirme se domínio de callback está configurado

### Erro: "Redirect URI Mismatch"
- Verifique se URL de callback está exata
- Confirme protocolo (http vs https)

### Erro: "Scope Invalid"
- Verifique permissões da aplicação
- Confirme se solicitou apenas scopes necessários

### Erro: "Rate Limit Exceeded"
- Implemente cache de dados
- Reduza frequência de requests
- Use webhooks para atualizações

## 📞 Suporte

Se encontrar problemas:
1. Verifique logs do console
2. Teste com curl/Postman
3. Consulte documentação oficial: https://developers.strava.com/
4. Verifique status da API: https://status.strava.com/

## 🎯 Próximos Passos

Após configurar Strava:
1. [ ] Configurar banco PostgreSQL/Neon
2. [ ] Implementar sistema de cache
3. [ ] Configurar monitoramento
4. [ ] Deploy em staging
5. [ ] Testes com usuários reais
