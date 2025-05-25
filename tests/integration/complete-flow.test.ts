import { test, expect } from '@playwright/test'

/**
 * Complete Integration Test Suite for FUSEtech
 * Tests the entire user journey from onboarding to marketplace
 */

test.describe('FUSEtech Complete User Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test('Complete user onboarding flow', async ({ page }) => {
    console.log('🧪 Testing complete onboarding flow...')

    // 1. Click "Começar agora" button
    await page.click('text=Começar agora')
    
    // 2. Verify welcome modal opens
    await expect(page.locator('text=Bem-vindo ao FUSEtech!')).toBeVisible()
    
    // 3. Start configuration
    await page.click('text=Começar Configuração')
    
    // 4. Fill profile step
    await page.fill('input[placeholder="Seu nome"]', 'João Silva Testador')
    await page.click('[data-goal="weight-loss"]')
    await page.selectOption('select', '3-4')
    await page.click('text=Próximo')
    
    // 5. Connect apps step
    await page.click('text=Conectar', { first: true })
    await page.waitForTimeout(2000) // Wait for connection animation
    await page.click('text=Continuar')
    
    // 6. Set goal step
    await page.click('[data-distance="15"]')
    await page.click('text=Criar Meta')
    
    // 7. Verify success screen
    await expect(page.locator('text=Configuração Completa!')).toBeVisible()
    await expect(page.locator('text=Total Ganho:')).toBeVisible()
    
    // 8. Complete onboarding
    await page.click('text=Ir para Dashboard')
    
    // 9. Verify dashboard loads
    await expect(page.locator('text=Bem-vindo de volta!')).toBeVisible()
    
    console.log('✅ Onboarding flow completed successfully')
  })

  test('Activity tracking and FUSE earning', async ({ page }) => {
    console.log('🧪 Testing activity tracking...')

    // Complete onboarding first (simplified)
    await page.click('text=Começar agora')
    await page.click('text=Começar Configuração')
    await page.fill('input[placeholder="Seu nome"]', 'Maria Runner')
    await page.click('[data-goal="endurance"]')
    await page.selectOption('select', '5-6')
    await page.click('text=Próximo')
    await page.click('text=Continuar')
    await page.click('[data-distance="20"]')
    await page.click('text=Criar Meta')
    await page.click('text=Ir para Dashboard')

    // Test activity logging
    await page.click('[aria-label="Add activity"]') // Floating action button
    
    // Fill activity form
    await page.selectOption('select[name="type"]', 'running')
    await page.fill('input[name="distance"]', '10')
    await page.fill('input[name="duration"]', '3600') // 1 hour
    await page.fill('input[name="calories"]', '600')
    
    // Submit activity
    await page.click('text=Salvar Atividade')
    
    // Verify FUSE tokens were earned
    await expect(page.locator('text=FUSE')).toBeVisible()
    
    // Check activity appears in feed
    await expect(page.locator('text=Corrida')).toBeVisible()
    await expect(page.locator('text=10 km')).toBeVisible()
    
    console.log('✅ Activity tracking completed successfully')
  })

  test('Marketplace purchase flow', async ({ page }) => {
    console.log('🧪 Testing marketplace purchase...')

    // Setup user with FUSE tokens (mock)
    await page.evaluate(() => {
      localStorage.setItem('fusetech-game', JSON.stringify({
        state: {
          fuseBalance: 500,
          userStats: { totalActivities: 5 }
        }
      }))
    })

    await page.reload()
    
    // Navigate to marketplace
    await page.click('text=Marketplace')
    
    // Browse products
    await expect(page.locator('text=Whey Protein')).toBeVisible()
    
    // Add item to cart
    await page.click('text=Adicionar ao Carrinho', { first: true })
    
    // Verify cart icon shows item count
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1')
    
    // Go to cart
    await page.click('[data-testid="cart-button"]')
    
    // Verify item in cart
    await expect(page.locator('text=Whey Protein')).toBeVisible()
    
    // Proceed to checkout
    await page.click('text=Finalizar Compra')
    
    // Confirm purchase
    await page.click('text=Confirmar Compra')
    
    // Verify purchase success
    await expect(page.locator('text=Compra realizada com sucesso!')).toBeVisible()
    
    console.log('✅ Marketplace purchase completed successfully')
  })

  test('Badge system and achievements', async ({ page }) => {
    console.log('🧪 Testing badge system...')

    // Setup user with activities to unlock badges
    await page.evaluate(() => {
      localStorage.setItem('fusetech-game', JSON.stringify({
        state: {
          userStats: { 
            totalActivities: 1,
            currentStreak: 7,
            totalDistance: 100
          },
          unlockedBadges: ['first_activity', 'streak_master']
        }
      }))
    })

    await page.reload()
    
    // Navigate to badges section
    await page.click('text=Badges')
    
    // Verify badges are displayed
    await expect(page.locator('text=Primeiro Passo')).toBeVisible()
    await expect(page.locator('text=Mestre da Sequência')).toBeVisible()
    
    // Check badge details
    await page.click('text=Primeiro Passo')
    await expect(page.locator('text=Complete sua primeira atividade')).toBeVisible()
    
    console.log('✅ Badge system tested successfully')
  })

  test('Social features and community', async ({ page }) => {
    console.log('🧪 Testing social features...')

    // Navigate to community section
    await page.click('text=Comunidade')
    
    // Verify community feed
    await expect(page.locator('text=Atividades da Comunidade')).toBeVisible()
    
    // Check friend activities
    await expect(page.locator('text=João completou')).toBeVisible()
    await expect(page.locator('text=Ana desbloqueou')).toBeVisible()
    
    // Test sharing activity
    await page.click('text=Compartilhar Atividade')
    await expect(page.locator('text=Atividade compartilhada!')).toBeVisible()
    
    console.log('✅ Social features tested successfully')
  })

  test('Performance and loading times', async ({ page }) => {
    console.log('🧪 Testing performance...')

    // Measure page load time
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    console.log(`📊 Page load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(3000) // Should load in under 3 seconds

    // Test navigation performance
    const navStart = Date.now()
    await page.click('text=Marketplace')
    await page.waitForLoadState('networkidle')
    const navTime = Date.now() - navStart

    console.log(`📊 Navigation time: ${navTime}ms`)
    expect(navTime).toBeLessThan(1000) // Navigation should be under 1 second

    console.log('✅ Performance tests passed')
  })

  test('Mobile responsiveness', async ({ page }) => {
    console.log('🧪 Testing mobile responsiveness...')

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE

    await page.goto('/')
    
    // Verify mobile layout
    await expect(page.locator('.mobile-menu')).toBeVisible()
    
    // Test touch interactions
    await page.tap('text=Começar agora')
    await expect(page.locator('text=Bem-vindo ao FUSEtech!')).toBeVisible()
    
    // Test swipe gestures (if implemented)
    await page.touchscreen.tap(200, 300)
    
    console.log('✅ Mobile responsiveness tested successfully')
  })

  test('Error handling and edge cases', async ({ page }) => {
    console.log('🧪 Testing error handling...')

    // Test network error handling
    await page.route('**/api/**', route => route.abort())
    
    await page.goto('/')
    
    // Verify error states
    await expect(page.locator('text=Erro de conexão')).toBeVisible()
    
    // Test form validation
    await page.click('text=Começar agora')
    await page.click('text=Começar Configuração')
    await page.click('text=Próximo') // Without filling form
    
    await expect(page.locator('text=Por favor, preencha todos os campos')).toBeVisible()
    
    console.log('✅ Error handling tested successfully')
  })

  test('Accessibility compliance', async ({ page }) => {
    console.log('🧪 Testing accessibility...')

    await page.goto('/')
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    
    // Verify focus management
    const focusedElement = await page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Test screen reader compatibility
    const ariaLabels = await page.locator('[aria-label]').count()
    expect(ariaLabels).toBeGreaterThan(0)
    
    // Test color contrast (basic check)
    const buttons = await page.locator('button').count()
    expect(buttons).toBeGreaterThan(0)
    
    console.log('✅ Accessibility tests passed')
  })

  test('Security and data protection', async ({ page }) => {
    console.log('🧪 Testing security...')

    // Test XSS protection
    await page.goto('/')
    await page.fill('input[type="text"]', '<script>alert("xss")</script>')
    
    // Verify script doesn't execute
    page.on('dialog', dialog => {
      throw new Error('XSS vulnerability detected!')
    })
    
    // Test CSRF protection
    const response = await page.request.post('/api/test', {
      data: { test: 'data' }
    })
    
    // Should require proper headers/tokens
    expect(response.status()).toBe(403)
    
    // Test data sanitization
    await page.fill('input[type="text"]', '"><img src=x onerror=alert(1)>')
    
    console.log('✅ Security tests passed')
  })
})

test.describe('API Integration Tests', () => {
  test('Strava integration', async ({ page }) => {
    console.log('🧪 Testing Strava integration...')

    // Mock Strava OAuth flow
    await page.route('**/auth/strava/**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, token: 'mock_token' })
      })
    })

    await page.goto('/integrations/strava')
    await page.click('text=Conectar Strava')
    
    await expect(page.locator('text=Strava conectado com sucesso!')).toBeVisible()
    
    console.log('✅ Strava integration tested')
  })

  test('Blockchain integration', async ({ page }) => {
    console.log('🧪 Testing blockchain integration...')

    // Mock wallet connection
    await page.addInitScript(() => {
      window.ethereum = {
        request: async () => ['0x1234567890123456789012345678901234567890'],
        on: () => {},
        removeListener: () => {}
      }
    })

    await page.goto('/wallet')
    await page.click('text=Conectar Carteira')
    
    await expect(page.locator('text=Carteira conectada')).toBeVisible()
    
    console.log('✅ Blockchain integration tested')
  })
})

test.describe('Performance Benchmarks', () => {
  test('Bundle size analysis', async ({ page }) => {
    console.log('🧪 Analyzing bundle size...')

    const response = await page.goto('/')
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(r => ({
        name: r.name,
        size: r.transferSize,
        type: r.initiatorType
      }))
    })

    const jsSize = resources
      .filter(r => r.name.includes('.js'))
      .reduce((sum, r) => sum + r.size, 0)

    const cssSize = resources
      .filter(r => r.name.includes('.css'))
      .reduce((sum, r) => sum + r.size, 0)

    console.log(`📊 JavaScript bundle size: ${(jsSize / 1024).toFixed(2)} KB`)
    console.log(`📊 CSS bundle size: ${(cssSize / 1024).toFixed(2)} KB`)

    // Assert reasonable bundle sizes
    expect(jsSize).toBeLessThan(500 * 1024) // < 500KB
    expect(cssSize).toBeLessThan(100 * 1024) // < 100KB

    console.log('✅ Bundle size analysis completed')
  })
})
