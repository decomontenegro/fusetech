# 🌐 **DOMAIN & SSL SETUP GUIDE**

## **📋 Configuração Completa de Domínio**

### **1. Registrar Domínio**

**Opções Recomendadas:**
- `fusetech.app` (preferido)
- `fusetech.io`
- `fusetech.com`
- `getfuse.app`

**Registradores Sugeridos:**
- Namecheap
- Google Domains
- Cloudflare Registrar
- GoDaddy

### **2. Configurar DNS no Cloudflare**

1. **Adicionar Site ao Cloudflare:**
   - Acesse cloudflare.com
   - Clique em "Add a Site"
   - Digite seu domínio
   - Escolha plano Free

2. **Configurar Nameservers:**
   ```
   Nameserver 1: xxx.ns.cloudflare.com
   Nameserver 2: yyy.ns.cloudflare.com
   ```

3. **Adicionar DNS Records:**
   ```
   Type: CNAME
   Name: @
   Target: cname.vercel-dns.com
   TTL: Auto

   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   TTL: Auto

   Type: CNAME
   Name: api
   Target: cname.vercel-dns.com
   TTL: Auto
   ```

### **3. Configurar Domínio no Vercel**

1. **Acessar Dashboard Vercel:**
   - Vá para vercel.com/dashboard
   - Selecione seu projeto FUSEtech

2. **Adicionar Domínio:**
   - Vá para "Settings" → "Domains"
   - Clique em "Add"
   - Digite: `fusetech.app`
   - Clique em "Add"

3. **Configurar Redirects:**
   ```json
   // vercel.json
   {
     "redirects": [
       {
         "source": "/(.*)",
         "has": [
           {
             "type": "host",
             "value": "www.fusetech.app"
           }
         ],
         "destination": "https://fusetech.app/$1",
         "permanent": true
       }
     ]
   }
   ```

### **4. Configurar SSL/TLS**

**No Cloudflare:**
1. Vá para "SSL/TLS" → "Overview"
2. Selecione "Full (strict)"
3. Ative "Always Use HTTPS"
4. Configure "Minimum TLS Version" para 1.2

**Configurações Adicionais:**
```
Edge Certificates:
✅ Always Use HTTPS
✅ HTTP Strict Transport Security (HSTS)
✅ Minimum TLS Version: 1.2
✅ Opportunistic Encryption
✅ TLS 1.3
```

### **5. Configurar Performance**

**Cloudflare Settings:**
```
Speed → Optimization:
✅ Auto Minify (HTML, CSS, JS)
✅ Brotli
✅ Early Hints

Caching → Configuration:
✅ Browser Cache TTL: 4 hours
✅ Always Online: On
```

### **6. Configurar Security**

**Cloudflare Security:**
```
Security → Settings:
✅ Security Level: Medium
✅ Challenge Passage: 30 minutes
✅ Browser Integrity Check: On

Firewall → Settings:
✅ Bot Fight Mode: On
✅ Privacy Pass Support: On
```

### **7. Configurar Analytics**

**Google Analytics 4:**
```javascript
// Adicionar ao _app.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <GoogleAnalytics gaId="G-XXXXXXXXXX" />
    </>
  )
}
```

**Google Search Console:**
1. Acesse search.google.com/search-console
2. Adicione propriedade: `https://fusetech.app`
3. Verifique via DNS ou HTML tag

### **8. Configurar Monitoring**

**Uptime Monitoring:**
```bash
# Pingdom
URL: https://fusetech.app
Check interval: 1 minute
Locations: Multiple

# UptimeRobot
Monitor Type: HTTP(s)
URL: https://fusetech.app/api/health
Monitoring Interval: 5 minutes
```

**Performance Monitoring:**
```javascript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  gtag('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_label: metric.id,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### **9. Configurar Email**

**Configurar MX Records:**
```
Type: MX
Name: @
Mail server: mx1.forwardemail.net
Priority: 10

Type: MX
Name: @
Mail server: mx2.forwardemail.net
Priority: 20
```

**Email Forwarding:**
```
hello@fusetech.app → your-email@gmail.com
support@fusetech.app → your-email@gmail.com
noreply@fusetech.app → your-email@gmail.com
```

### **10. Configurar Subdomínios**

**Subdomínios Úteis:**
```
api.fusetech.app → API endpoints
app.fusetech.app → Web application
admin.fusetech.app → Admin dashboard
docs.fusetech.app → Documentation
status.fusetech.app → Status page
```

**DNS Configuration:**
```
Type: CNAME
Name: api
Target: cname.vercel-dns.com

Type: CNAME
Name: app
Target: cname.vercel-dns.com

Type: CNAME
Name: docs
Target: fusetech.gitbook.io
```

### **11. Configurar Redirects**

**Common Redirects:**
```json
// vercel.json
{
  "redirects": [
    {
      "source": "/app",
      "destination": "/dashboard",
      "permanent": false
    },
    {
      "source": "/login",
      "destination": "/auth/signin",
      "permanent": false
    },
    {
      "source": "/register",
      "destination": "/auth/signup",
      "permanent": false
    }
  ]
}
```

### **12. Configurar Headers de Segurança**

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

## **🔍 Verificação Final**

### **Checklist de Domínio:**
- [ ] Domínio registrado
- [ ] DNS configurado no Cloudflare
- [ ] Domínio adicionado no Vercel
- [ ] SSL/TLS configurado
- [ ] HTTPS redirect ativo
- [ ] Performance otimizada
- [ ] Security configurada
- [ ] Analytics configurado
- [ ] Monitoring ativo
- [ ] Email configurado
- [ ] Subdomínios configurados

### **Testes de Verificação:**
```bash
# Teste DNS
nslookup fusetech.app

# Teste SSL
curl -I https://fusetech.app

# Teste Performance
lighthouse https://fusetech.app

# Teste Security
securityheaders.com/?q=https://fusetech.app
```

---

## **📊 Métricas de Sucesso**

### **Performance Targets:**
- **Page Load Time**: < 2 segundos
- **SSL Labs Grade**: A+
- **GTmetrix Score**: A
- **Lighthouse Score**: > 90

### **Uptime Targets:**
- **Availability**: 99.9%
- **Response Time**: < 500ms
- **Error Rate**: < 0.1%
