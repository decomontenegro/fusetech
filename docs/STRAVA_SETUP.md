# 🏃‍♂️ **STRAVA API SETUP GUIDE**

## **📋 Configuração Completa da Integração Strava**

### **1. Criar Aplicação Strava**

1. **Acesse:** https://developers.strava.com/
2. **Clique em:** "Create & Manage Your App"
3. **Preencha os dados:**
   ```
   Application Name: FUSEtech
   Category: Health and Fitness
   Club: Deixe em branco
   Website: https://fusetech.app
   Application Description: Transforme exercícios em recompensas com tokens FUSE
   Authorization Callback Domain: fusetech.app
   ```

### **2. Configurar Callback URLs**

**Production:**
```
https://fusetech.app/auth/strava/callback
```

**Development:**
```
http://localhost:3000/auth/strava/callback
```

### **3. Obter Credenciais**

Após criar a aplicação, você receberá:
```bash
Client ID: 123456
Client Secret: abc123def456...
```

### **4. Configurar Webhook**

**Webhook URL:**
```
https://fusetech.app/api/webhooks/strava
```

**Verify Token:** (gere um token aleatório)
```bash
# Gerar token de verificação
openssl rand -hex 32
```

### **5. Adicionar ao .env.local**

```bash
# Strava API
NEXT_PUBLIC_STRAVA_CLIENT_ID=123456
STRAVA_CLIENT_SECRET=abc123def456...
STRAVA_WEBHOOK_VERIFY_TOKEN=your-generated-token
```

### **6. Testar Integração**

```bash
# 1. Iniciar servidor de desenvolvimento
npm run dev

# 2. Acessar página de conexão
http://localhost:3000/integrations/strava

# 3. Autorizar aplicação
# 4. Verificar se atividades são sincronizadas
```

### **7. Configurar Webhook em Produção**

```bash
# Criar webhook subscription
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET \
  -F callback_url=https://fusetech.app/api/webhooks/strava \
  -F verify_token=YOUR_VERIFY_TOKEN
```

### **8. Monitorar Webhook**

```bash
# Verificar webhook ativo
curl -G https://www.strava.com/api/v3/push_subscriptions \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET
```

---

## **🔧 Troubleshooting**

### **Erro: "Invalid redirect_uri"**
- Verificar se o domínio está correto no painel Strava
- Confirmar protocolo (http vs https)

### **Erro: "Invalid client"**
- Verificar Client ID e Secret
- Confirmar se aplicação está ativa

### **Webhook não recebe eventos**
- Verificar URL do webhook
- Confirmar verify_token
- Checar logs do servidor

---

## **📊 Dados Disponíveis**

### **Atividades Sincronizadas:**
- Corrida (Running)
- Ciclismo (Ride)
- Caminhada (Walk)
- Natação (Swim)
- Academia (Workout)

### **Métricas Capturadas:**
- Distância (metros → km)
- Duração (segundos)
- Calorias queimadas
- Velocidade média
- Elevação total

### **Conversão para FUSE:**
```typescript
// Fórmula de recompensa
running: (distance * 5) + (duration * 0.1)
cycling: (distance * 3) + (duration * 0.08)
walking: (distance * 2) + (duration * 0.05)
```

---

## **✅ Checklist de Configuração**

- [ ] Aplicação criada no Strava
- [ ] Callback URLs configuradas
- [ ] Credenciais adicionadas ao .env
- [ ] Webhook configurado
- [ ] Teste de autorização realizado
- [ ] Sincronização de atividades testada
- [ ] Webhook em produção ativo
- [ ] Monitoramento configurado
