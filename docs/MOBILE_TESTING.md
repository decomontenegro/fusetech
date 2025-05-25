# 📱 **GUIA COMPLETO DE TESTE MOBILE - FUSETECH**

## **🚀 MÉTODOS DE TESTE MOBILE**

---

## **🔧 1. CHROME DEVTOOLS (MAIS RÁPIDO)**

### **Como Testar:**
1. **Abrir aplicação:** `npm run dev` → `http://localhost:3000`
2. **Abrir DevTools:** `F12` ou `Cmd+Option+I`
3. **Ativar modo mobile:** `Cmd+Shift+M` ou clique no ícone 📱
4. **Escolher dispositivo:**
   - iPhone SE (375x667)
   - iPhone 12 Pro (390x844)
   - iPhone 14 Pro Max (430x932)
   - Samsung Galaxy S20 (360x800)
   - iPad (768x1024)

### **Funcionalidades Testáveis:**
- ✅ **Layout responsivo**
- ✅ **Touch interactions**
- ✅ **Scroll behavior**
- ✅ **Orientação** (portrait/landscape)
- ✅ **Performance** mobile

### **Limitações:**
- ❌ Não testa gestos reais
- ❌ Não testa performance real
- ❌ Não testa APIs nativas

---

## **📱 2. TESTE EM DISPOSITIVO REAL**

### **A. Teste via Rede Local:**

#### **Setup:**
```bash
# 1. Descobrir IP local
ifconfig | grep "inet " | grep -v 127.0.0.1

# 2. Iniciar servidor com IP específico
npm run dev -- --host 0.0.0.0

# 3. Acessar no mobile
# http://SEU_IP:3000
# Exemplo: http://192.168.1.100:3000
```

#### **Configurar HTTPS Local (Recomendado):**
```bash
# Instalar mkcert
brew install mkcert
mkcert -install

# Gerar certificados
mkcert localhost 192.168.1.100 *.local

# Configurar Next.js com HTTPS
npm install --save-dev https-localhost
```

### **B. Teste via Tunnel (ngrok):**

#### **Setup ngrok:**
```bash
# Instalar ngrok
brew install ngrok

# Criar tunnel
ngrok http 3000

# Usar URL gerada (ex: https://abc123.ngrok.io)
```

#### **Vantagens:**
- ✅ **HTTPS** automático
- ✅ **Acesso externo**
- ✅ **Fácil compartilhamento**
- ✅ **Debugging** remoto

---

## **🧪 3. FERRAMENTAS DE TESTE AUTOMATIZADO**

### **A. Playwright Mobile Testing:**

```typescript
// tests/mobile.test.ts
import { test, devices } from '@playwright/test'

// Configurar dispositivos
const iPhone = devices['iPhone 12']
const android = devices['Pixel 5']

test.describe('Mobile Tests', () => {
  test('iPhone 12 - Complete Flow', async ({ browser }) => {
    const context = await browser.newContext({
      ...iPhone,
      geolocation: { latitude: -23.5505, longitude: -46.6333 }, // São Paulo
      permissions: ['geolocation'],
    })
    
    const page = await context.newPage()
    await page.goto('http://localhost:3000')
    
    // Testar onboarding mobile
    await page.tap('text=Começar agora')
    await page.waitForSelector('text=Bem-vindo ao FUSEtech!')
    
    // Testar gestos
    await page.touchscreen.tap(200, 300)
    
    // Testar scroll
    await page.mouse.wheel(0, 500)
    
    await context.close()
  })
  
  test('Android - Performance Test', async ({ browser }) => {
    const context = await browser.newContext({
      ...android,
      // Simular conexão 3G
      offline: false,
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
      uploadThroughput: 750 * 1024 / 8, // 750 Kbps
      latency: 40, // 40ms
    })
    
    const page = await context.newPage()
    
    // Medir performance
    const startTime = Date.now()
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    console.log(`📊 Mobile load time: ${loadTime}ms`)
    
    await context.close()
  })
})
```

### **B. Executar Testes Mobile:**
```bash
# Instalar Playwright
npm install --save-dev @playwright/test

# Executar testes mobile
npx playwright test tests/mobile.test.ts

# Com interface gráfica
npx playwright test --ui
```

---

## **📊 4. TESTE DE PERFORMANCE MOBILE**

### **A. Lighthouse Mobile:**
```bash
# Instalar Lighthouse
npm install -g lighthouse

# Testar performance mobile
lighthouse http://localhost:3000 \
  --emulated-form-factor=mobile \
  --throttling.cpuSlowdownMultiplier=4 \
  --output=html \
  --output-path=./lighthouse-mobile.html

# Abrir relatório
open lighthouse-mobile.html
```

### **B. WebPageTest Mobile:**
```javascript
// Configurar teste mobile no webpagetest.org
const config = {
  url: 'https://fusetech.app',
  location: 'Dulles:Chrome.4G',
  connectivity: '4G',
  device: 'MotoG4',
  runs: 3,
  firstViewOnly: false
}
```

---

## **🎮 5. TESTE DE FUNCIONALIDADES ESPECÍFICAS**

### **A. Touch Gestures:**
```typescript
// Testar gestos específicos
test('Touch Gestures', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  // Tap
  await page.touchscreen.tap(100, 100)
  
  // Long press
  await page.touchscreen.tap(100, 100, { delay: 1000 })
  
  // Swipe
  await page.touchscreen.tap(100, 100)
  await page.mouse.move(300, 100)
  await page.mouse.up()
  
  // Pinch zoom (se suportado)
  await page.touchscreen.tap(150, 150)
  await page.touchscreen.tap(250, 250)
})
```

### **B. Orientação de Tela:**
```typescript
test('Screen Orientation', async ({ page }) => {
  // Portrait
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('http://localhost:3000')
  
  // Landscape
  await page.setViewportSize({ width: 667, height: 375 })
  await page.reload()
  
  // Verificar layout
  const menu = await page.locator('.mobile-menu')
  await expect(menu).toBeVisible()
})
```

### **C. PWA Features:**
```typescript
test('PWA Installation', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  // Verificar manifest
  const manifest = await page.evaluate(() => {
    const link = document.querySelector('link[rel="manifest"]')
    return link ? link.href : null
  })
  
  expect(manifest).toBeTruthy()
  
  // Verificar service worker
  const swRegistered = await page.evaluate(() => {
    return 'serviceWorker' in navigator
  })
  
  expect(swRegistered).toBe(true)
})
```

---

## **🔧 6. CONFIGURAÇÃO DE AMBIENTE MOBILE**

### **A. Adicionar Scripts ao package.json:**
```json
{
  "scripts": {
    "dev:mobile": "next dev --hostname 0.0.0.0",
    "test:mobile": "playwright test tests/mobile.test.ts",
    "lighthouse:mobile": "lighthouse http://localhost:3000 --emulated-form-factor=mobile --output=html",
    "tunnel": "ngrok http 3000"
  }
}
```

### **B. Configurar Viewport Meta Tag:**
```html
<!-- Já implementado no _document.tsx -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
```

### **C. Configurar PWA Manifest:**
```json
// public/manifest.json
{
  "name": "FUSEtech",
  "short_name": "FUSE",
  "description": "Transforme exercícios em recompensas",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## **📱 7. TESTE EM DIFERENTES DISPOSITIVOS**

### **A. iOS Testing:**
```bash
# Usando iOS Simulator (macOS)
open -a Simulator

# Ou usando BrowserStack
# https://www.browserstack.com/
```

### **B. Android Testing:**
```bash
# Usando Android Studio Emulator
emulator -avd Pixel_5_API_30

# Ou usando Chrome Remote Debugging
# chrome://inspect/#devices
```

### **C. Dispositivos Físicos:**
```bash
# iOS - Safari Web Inspector
# 1. Ativar "Web Inspector" no Safari (iOS)
# 2. Conectar via USB
# 3. Safari > Develop > [Device] > [Page]

# Android - Chrome DevTools
# 1. Ativar "USB Debugging"
# 2. Conectar via USB
# 3. chrome://inspect/#devices
```

---

## **🎯 8. CHECKLIST DE TESTE MOBILE**

### **✅ Layout & UI:**
- [ ] **Responsividade** em diferentes tamanhos
- [ ] **Touch targets** adequados (min 44px)
- [ ] **Scroll** suave e natural
- [ ] **Orientação** portrait/landscape
- [ ] **Safe areas** (iPhone notch)

### **✅ Performance:**
- [ ] **Load time** < 3s em 3G
- [ ] **Bundle size** otimizado
- [ ] **Images** otimizadas
- [ ] **Lazy loading** funcionando

### **✅ Funcionalidades:**
- [ ] **Touch gestures** funcionando
- [ ] **Forms** utilizáveis no mobile
- [ ] **Navigation** intuitiva
- [ ] **Onboarding** mobile-friendly

### **✅ PWA:**
- [ ] **Installable** no home screen
- [ ] **Offline** functionality
- [ ] **Push notifications** funcionando
- [ ] **App-like** experience

### **✅ Integrations:**
- [ ] **Camera** access (se aplicável)
- [ ] **Geolocation** funcionando
- [ ] **Device sensors** (se aplicável)
- [ ] **Share API** funcionando

---

## **🚀 COMANDOS RÁPIDOS PARA TESTE**

### **Teste Básico:**
```bash
# 1. Iniciar servidor mobile
npm run dev:mobile

# 2. Descobrir IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# 3. Acessar no mobile: http://SEU_IP:3000
```

### **Teste com Tunnel:**
```bash
# 1. Iniciar servidor
npm run dev

# 2. Criar tunnel
npx ngrok http 3000

# 3. Usar URL HTTPS gerada
```

### **Teste Automatizado:**
```bash
# Executar todos os testes mobile
npm run test:mobile

# Performance mobile
npm run lighthouse:mobile
```

---

## **📊 MÉTRICAS MOBILE IMPORTANTES**

### **Performance:**
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 3s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### **Usability:**
- **Touch target size**: ≥ 44px
- **Viewport**: Properly configured
- **Text size**: ≥ 16px
- **Contrast ratio**: ≥ 4.5:1

### **PWA:**
- **Installable**: ✅
- **Offline ready**: ✅
- **Fast loading**: ✅
- **Engaging**: ✅

**🎯 Com esses métodos você pode testar completamente a experiência mobile do FUSEtech! 📱**
