# 🔗 Plano de Integração Garmin Connect

## 📋 REQUISITOS TÉCNICOS

### 1. 🏗️ Arquitetura
```
FUSEtech App
├── src/lib/auth/
│   ├── strava-auth.ts (✅ Existente)
│   ├── garmin-auth.ts (🆕 Novo)
│   └── multi-provider.ts (🆕 Novo)
├── src/app/api/auth/
│   ├── strava/ (✅ Existente)
│   ├── garmin/ (🆕 Novo)
│   └── connect/ (🆕 Multi-provider)
└── src/components/auth/
    ├── StravaLogin.tsx (✅ Existente)
    ├── GarminLogin.tsx (🆕 Novo)
    └── MultiProviderLogin.tsx (🆕 Novo)
```

### 2. 🔐 OAuth Flow Garmin
```typescript
// Garmin OAuth 1.0a (mais complexo que OAuth 2.0)
const garminAuth = {
  requestToken: 'https://connectapi.garmin.com/oauth-service/oauth/request_token',
  authorize: 'https://connect.garmin.com/oauthConfirm',
  accessToken: 'https://connectapi.garmin.com/oauth-service/oauth/access_token',
  apiBase: 'https://apis.garmin.com/wellness-api/rest/'
};
```

### 3. 📊 Mapeamento de Dados
```typescript
interface GarminActivity {
  activityId: string;
  activityName: string;
  startTimeGMT: string;
  distance: number; // metros
  duration: number; // segundos
  calories: number;
  averageHR: number;
  maxHR: number;
  activityType: {
    typeId: number;
    typeKey: string; // "running", "cycling", etc.
  };
}

// Converter para formato FUSEtech
const mapGarminToFuse = (activity: GarminActivity): FuseActivity => ({
  id: activity.activityId,
  name: activity.activityName,
  date: activity.startTimeGMT,
  distance: activity.distance / 1000, // converter para km
  duration: activity.duration,
  type: mapActivityType(activity.activityType.typeKey),
  calories: activity.calories,
  heartRate: {
    average: activity.averageHR,
    max: activity.maxHR
  },
  source: 'garmin'
});
```

## ⏱️ CRONOGRAMA DE IMPLEMENTAÇÃO

### **Fase 1: Setup Inicial (1-2 semanas)**
- [ ] Registro no Garmin Developer Portal
- [ ] Solicitação de aprovação da aplicação
- [ ] Configuração de credenciais

### **Fase 2: Desenvolvimento (2-3 semanas)**
- [ ] Implementar OAuth 1.0a para Garmin
- [ ] Criar endpoints de autenticação
- [ ] Mapear dados de atividades
- [ ] Testes de integração

### **Fase 3: UI/UX (1 semana)**
- [ ] Componente de login multi-provider
- [ ] Seletor de fonte de dados
- [ ] Indicadores visuais de conexão

### **Fase 4: Testes e Deploy (1 semana)**
- [ ] Testes com usuários reais
- [ ] Validação de dados
- [ ] Deploy em produção

## 💰 CUSTOS E LIMITAÇÕES

### **📊 Rate Limits**
- Garmin: 1.000 requests/dia (muito baixo)
- Strava: 15.000 requests/dia
- **Solução:** Cache agressivo + sync menos frequente

### **💸 Custos**
- Garmin Developer: Gratuito (mas aprovação manual)
- Infraestrutura adicional: ~$20/mês
- Tempo de desenvolvimento: ~40-60 horas

### **🚫 Limitações**
- Dados históricos limitados (90 dias)
- Menos tipos de atividade que Strava
- API menos estável

## 🎯 RECOMENDAÇÃO

### **✅ PRÓS:**
- Acesso a usuários Garmin (diferentes do Strava)
- Dados mais precisos de dispositivos
- Integração com wearables

### **❌ CONTRAS:**
- Complexidade técnica alta
- Rate limits muito baixos
- Processo de aprovação longo
- ROI questionável para MVP

## 🚀 ALTERNATIVAS MAIS SIMPLES

### **1. 📱 Apple Health / Google Fit**
- **Dificuldade:** 4/10
- **Tempo:** 1-2 semanas
- **Benefício:** Acesso a múltiplas fontes

### **2. 🏃‍♂️ Polar / Suunto**
- **Dificuldade:** 5/10
- **Tempo:** 2-3 semanas
- **Benefício:** Nicho específico

### **3. 📊 Fitbit (Google)**
- **Dificuldade:** 6/10
- **Tempo:** 2-3 semanas
- **Benefício:** Grande base de usuários

## 💡 RECOMENDAÇÃO FINAL

**Para o MVP atual:** Focar no Strava + Apple Health/Google Fit
**Para v2.0:** Considerar Garmin se houver demanda comprovada

### **Razões:**
1. **Strava** já funciona e tem boa adoção
2. **Apple Health/Google Fit** são mais simples e abrangentes
3. **Garmin** pode ser adicionado depois com base na demanda
4. **ROI** melhor com integrações mais simples primeiro
