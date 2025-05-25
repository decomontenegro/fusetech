# 🔥 **FIREBASE SETUP GUIDE**

## **📱 Configuração Completa de Push Notifications**

### **1. Criar Projeto Firebase**

1. **Acesse:** https://console.firebase.google.com/
2. **Clique em:** "Adicionar projeto"
3. **Nome do projeto:** `fusetech-app`
4. **Ativar Google Analytics:** Sim
5. **Configurar Analytics:** Criar nova conta

### **2. Configurar Cloud Messaging**

1. **No console Firebase:**
   - Vá para "Cloud Messaging"
   - Clique em "Começar"

2. **Gerar chave VAPID:**
   - Vá para "Configurações do projeto"
   - Aba "Cloud Messaging"
   - Seção "Configuração da Web"
   - Clique em "Gerar par de chaves"

### **3. Configurar Web App**

1. **Adicionar app da Web:**
   ```
   Nome do app: FUSEtech Web
   Hostname: fusetech.app
   ```

2. **Obter configuração:**
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "fusetech-app.firebaseapp.com",
     projectId: "fusetech-app",
     storageBucket: "fusetech-app.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

### **4. Configurar Service Worker**

Criar arquivo `public/firebase-messaging-sw.js`:

```javascript
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "fusetech-app.firebaseapp.com",
  projectId: "fusetech-app",
  storageBucket: "fusetech-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

### **5. Adicionar ao .env.local**

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fusetech-app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BNx...

# Firebase Admin (para backend)
FIREBASE_ADMIN_SDK_KEY={"type":"service_account",...}
```

### **6. Configurar Ícones de Notificação**

Criar ícones em `public/icons/`:
```
icon-192x192.png    (192x192px)
icon-512x512.png    (512x512px)
badge-72x72.png     (72x72px)
```

### **7. Testar Push Notifications**

```bash
# 1. Iniciar servidor
npm run dev

# 2. Acessar aplicação
http://localhost:3000

# 3. Permitir notificações quando solicitado

# 4. Testar via Firebase Console:
# - Vá para Cloud Messaging
# - Clique em "Enviar primeira mensagem"
# - Selecione "Teste em dispositivo"
# - Cole o token FCM
```

### **8. Configurar Notificações Automáticas**

Criar API endpoint `pages/api/notifications/send.ts`:

```typescript
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY!)
    ),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, title, body, data } = req.body;

  try {
    const message = {
      notification: { title, body },
      data: data || {},
      token,
    };

    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, messageId: response });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
}
```

### **9. Configurar Templates de Notificação**

```typescript
// Notificações automáticas por evento
const notifications = {
  ACTIVITY_COMPLETED: {
    title: '🎉 Atividade Concluída!',
    body: 'Você ganhou {fuse} FUSE tokens!',
  },
  BADGE_UNLOCKED: {
    title: '🏆 Novo Badge!',
    body: 'Você desbloqueou: {badgeName}',
  },
  WEEKLY_GOAL: {
    title: '🎯 Meta Atingida!',
    body: 'Parabéns! Meta semanal completa!',
  },
};
```

### **10. Configurar Segmentação**

```typescript
// Enviar para grupos específicos
const sendToTopic = async (topic: string, message: any) => {
  await admin.messaging().sendToTopic(topic, message);
};

// Tópicos disponíveis:
// - 'all_users'
// - 'premium_users'
// - 'active_users'
// - 'new_users'
```

---

## **📊 Analytics de Notificações**

### **Métricas Importantes:**
- Taxa de entrega
- Taxa de abertura
- Taxa de clique
- Taxa de conversão

### **Configurar Tracking:**
```typescript
// Rastrear abertura de notificação
self.addEventListener('notificationclick', (event) => {
  // Enviar evento para analytics
  fetch('/api/analytics/notification-click', {
    method: 'POST',
    body: JSON.stringify({
      notificationId: event.notification.data.id,
      action: event.action,
      timestamp: Date.now(),
    }),
  });
});
```

---

## **✅ Checklist de Configuração**

- [ ] Projeto Firebase criado
- [ ] Cloud Messaging ativado
- [ ] Chave VAPID gerada
- [ ] Web app configurada
- [ ] Service Worker criado
- [ ] Variáveis de ambiente configuradas
- [ ] Ícones de notificação adicionados
- [ ] Teste de notificação realizado
- [ ] API de envio configurada
- [ ] Templates criados
- [ ] Analytics configurado
