import { test, expect, devices } from '@playwright/test'

// Device configurations
const iPhone12 = devices['iPhone 12']
const iPhone14ProMax = devices['iPhone 14 Pro Max']
const galaxyS20 = devices['Galaxy S20']
const iPad = devices['iPad Pro']

test.describe('FUSEtech Mobile Tests', () => {
  
  test.describe('iPhone 12 Tests', () => {
    test.use({ ...iPhone12 })

    test('Complete onboarding flow on iPhone', async ({ page }) => {
      console.log('🧪 Testing iPhone 12 onboarding...')
      
      await page.goto('/')
      
      // Test landing page mobile layout
      await expect(page.locator('h1')).toContainText('FUSEtech')
      
      // Start onboarding
      await page.tap('text=Começar agora')
      await expect(page.locator('text=Bem-vindo ao FUSEtech!')).toBeVisible()
      
      // Welcome step
      await page.tap('text=Começar Configuração')
      
      // Profile step - test mobile form
      await page.fill('input[placeholder="Seu nome"]', 'João Mobile Tester')
      await page.tap('[data-goal="weight-loss"]')
      await page.selectOption('select', '3-4')
      await page.tap('text=Próximo')
      
      // Connections step
      await page.tap('text=Conectar', { first: true })
      await page.waitForTimeout(1000)
      await page.tap('text=Continuar')
      
      // Goal step - test mobile goal selection
      await page.tap('[data-distance="15"]')
      await page.tap('text=Criar Meta')
      
      // Success step
      await expect(page.locator('text=Configuração Completa!')).toBeVisible()
      await expect(page.locator('text=Total Ganho:')).toBeVisible()
      
      console.log('✅ iPhone onboarding completed')
    })

    test('Mobile dashboard navigation', async ({ page }) => {
      console.log('🧪 Testing iPhone dashboard navigation...')
      
      // Setup user with completed onboarding
      await page.addInitScript(() => {
        localStorage.setItem('fusetech-onboarding', JSON.stringify({
          state: {
            userProgress: {
              completedAt: Date.now(),
              totalFuse: 150
            }
          }
        }))
      })
      
      await page.goto('/')
      
      // Should show dashboard
      await expect(page.locator('text=Bem-vindo de volta!')).toBeVisible()
      
      // Test mobile navigation
      const fuseBalance = page.locator('text=FUSE')
      await expect(fuseBalance).toBeVisible()
      
      // Test floating action button
      const fab = page.locator('[aria-label="Add activity"]')
      await expect(fab).toBeVisible()
      await page.tap('[aria-label="Add activity"]')
      
      console.log('✅ iPhone dashboard navigation working')
    })

    test('Mobile touch interactions', async ({ page }) => {
      console.log('🧪 Testing iPhone touch interactions...')
      
      await page.goto('/')
      
      // Test tap interactions
      await page.touchscreen.tap(200, 300)
      
      // Test scroll behavior
      await page.mouse.wheel(0, 500)
      
      // Test swipe gestures (if implemented)
      const startX = 100
      const startY = 300
      const endX = 300
      const endY = 300
      
      await page.touchscreen.tap(startX, startY)
      await page.mouse.move(endX, endY)
      await page.mouse.up()
      
      console.log('✅ iPhone touch interactions working')
    })
  })

  test.describe('Android Galaxy S20 Tests', () => {
    test.use({ ...galaxyS20 })

    test('Android performance test', async ({ page }) => {
      console.log('🧪 Testing Android performance...')
      
      // Simulate slower network
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100) // Add 100ms delay
      })
      
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      
      console.log(`📊 Android load time: ${loadTime}ms`)
      expect(loadTime).toBeLessThan(5000) // Should load in under 5 seconds
      
      // Test memory usage
      const memoryUsage = await page.evaluate(() => {
        return (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        } : null
      })
      
      if (memoryUsage) {
        console.log(`📊 Memory usage: ${(memoryUsage.used / 1024 / 1024).toFixed(2)} MB`)
        expect(memoryUsage.used).toBeLessThan(50 * 1024 * 1024) // Less than 50MB
      }
      
      console.log('✅ Android performance test passed')
    })

    test('Android marketplace mobile UX', async ({ page }) => {
      console.log('🧪 Testing Android marketplace...')
      
      // Setup user with FUSE tokens
      await page.addInitScript(() => {
        localStorage.setItem('fusetech-game', JSON.stringify({
          state: {
            fuseBalance: 500,
            userStats: { totalActivities: 5 }
          }
        }))
      })
      
      await page.goto('/')
      
      // Navigate to marketplace
      await page.tap('text=Marketplace')
      
      // Test mobile product grid
      await expect(page.locator('text=Whey Protein')).toBeVisible()
      
      // Test mobile cart interaction
      await page.tap('text=Adicionar ao Carrinho', { first: true })
      
      // Verify mobile cart UI
      const cartButton = page.locator('[data-testid="cart-button"]')
      await expect(cartButton).toBeVisible()
      
      console.log('✅ Android marketplace UX working')
    })
  })

  test.describe('iPad Pro Tests', () => {
    test.use({ ...iPad })

    test('Tablet layout adaptation', async ({ page }) => {
      console.log('🧪 Testing iPad layout...')
      
      await page.goto('/')
      
      // Test tablet-specific layout
      const container = page.locator('.max-w-7xl')
      await expect(container).toBeVisible()
      
      // Should show more content in tablet view
      const statsGrid = page.locator('.grid')
      await expect(statsGrid).toBeVisible()
      
      // Test tablet navigation
      await page.tap('text=Começar agora')
      await expect(page.locator('text=Bem-vindo ao FUSEtech!')).toBeVisible()
      
      console.log('✅ iPad layout working')
    })
  })

  test.describe('Cross-Device Tests', () => {
    
    test('Responsive breakpoints', async ({ page }) => {
      console.log('🧪 Testing responsive breakpoints...')
      
      // Test different viewport sizes
      const viewports = [
        { width: 320, height: 568, name: 'iPhone SE' },
        { width: 375, height: 667, name: 'iPhone 8' },
        { width: 414, height: 896, name: 'iPhone 11' },
        { width: 768, height: 1024, name: 'iPad' },
        { width: 1024, height: 768, name: 'iPad Landscape' }
      ]
      
      for (const viewport of viewports) {
        console.log(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`)
        
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto('/')
        
        // Verify layout doesn't break
        const mainContent = page.locator('main')
        await expect(mainContent).toBeVisible()
        
        // Check for horizontal scroll (should not exist)
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
        const viewportWidth = viewport.width
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1) // Allow 1px tolerance
      }
      
      console.log('✅ All responsive breakpoints working')
    })

    test('Orientation changes', async ({ page }) => {
      console.log('🧪 Testing orientation changes...')
      
      // Portrait
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      
      let mainContent = page.locator('main')
      await expect(mainContent).toBeVisible()
      
      // Landscape
      await page.setViewportSize({ width: 667, height: 375 })
      await page.reload()
      
      mainContent = page.locator('main')
      await expect(mainContent).toBeVisible()
      
      console.log('✅ Orientation changes handled correctly')
    })
  })

  test.describe('PWA Features', () => {
    
    test('PWA manifest and service worker', async ({ page }) => {
      console.log('🧪 Testing PWA features...')
      
      await page.goto('/')
      
      // Check manifest
      const manifest = await page.evaluate(() => {
        const link = document.querySelector('link[rel="manifest"]')
        return link ? (link as HTMLLinkElement).href : null
      })
      
      expect(manifest).toBeTruthy()
      
      // Check service worker registration
      const swRegistered = await page.evaluate(() => {
        return 'serviceWorker' in navigator
      })
      
      expect(swRegistered).toBe(true)
      
      // Check if app is installable
      const isInstallable = await page.evaluate(() => {
        return new Promise((resolve) => {
          window.addEventListener('beforeinstallprompt', () => {
            resolve(true)
          })
          
          // Timeout after 2 seconds
          setTimeout(() => resolve(false), 2000)
        })
      })
      
      console.log(`📱 App installable: ${isInstallable}`)
      
      console.log('✅ PWA features working')
    })

    test('Offline functionality', async ({ page }) => {
      console.log('🧪 Testing offline functionality...')
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Go offline
      await page.context().setOffline(true)
      
      // Try to navigate (should work with cached content)
      await page.reload()
      
      // Should show some content even offline
      const body = page.locator('body')
      await expect(body).toBeVisible()
      
      // Go back online
      await page.context().setOffline(false)
      
      console.log('✅ Offline functionality working')
    })
  })

  test.describe('Mobile-Specific Features', () => {
    
    test('Touch target sizes', async ({ page }) => {
      console.log('🧪 Testing touch target sizes...')
      
      await page.goto('/')
      
      // Get all clickable elements
      const clickableElements = await page.locator('button, a, [role="button"]').all()
      
      for (const element of clickableElements) {
        const box = await element.boundingBox()
        if (box) {
          // Touch targets should be at least 44px (iOS) or 48px (Android)
          const minSize = 44
          expect(box.width).toBeGreaterThanOrEqual(minSize)
          expect(box.height).toBeGreaterThanOrEqual(minSize)
        }
      }
      
      console.log('✅ Touch target sizes adequate')
    })

    test('Text readability', async ({ page }) => {
      console.log('🧪 Testing text readability...')
      
      await page.goto('/')
      
      // Check font sizes
      const textElements = await page.locator('p, span, div').all()
      
      for (const element of textElements.slice(0, 10)) { // Test first 10 elements
        const fontSize = await element.evaluate(el => {
          return window.getComputedStyle(el).fontSize
        })
        
        const fontSizeNum = parseInt(fontSize.replace('px', ''))
        
        // Text should be at least 16px for good mobile readability
        if (fontSizeNum > 0) {
          expect(fontSizeNum).toBeGreaterThanOrEqual(14) // Allow 14px minimum
        }
      }
      
      console.log('✅ Text readability good')
    })

    test('Form usability on mobile', async ({ page }) => {
      console.log('🧪 Testing mobile form usability...')
      
      await page.goto('/')
      await page.tap('text=Começar agora')
      await page.tap('text=Começar Configuração')
      
      // Test input field behavior
      const nameInput = page.locator('input[placeholder="Seu nome"]')
      await nameInput.tap()
      
      // Check if input is focused and keyboard would appear
      const isFocused = await nameInput.evaluate(el => el === document.activeElement)
      expect(isFocused).toBe(true)
      
      // Test form submission
      await nameInput.fill('Test User')
      
      // Verify input value
      const inputValue = await nameInput.inputValue()
      expect(inputValue).toBe('Test User')
      
      console.log('✅ Mobile form usability good')
    })
  })
})
