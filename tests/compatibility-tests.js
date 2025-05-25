/**
 * Testes de compatibilidade para FuseLabs
 * 
 * Este script executa testes de compatibilidade em diferentes navegadores
 * e dispositivos para verificar o comportamento da aplicação.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// URLs a serem testadas
const URLS = [
  'http://localhost:8080/index_modular.html',
  'http://localhost:8080/atividades.html',
  'http://localhost:8080/analytics.html',
  'http://localhost:8080/desafios.html',
  'http://localhost:8080/perfil.html'
];

// Configurações de dispositivos
const DEVICES = [
  { name: 'Desktop', width: 1920, height: 1080, userAgent: 'desktop' },
  { name: 'Tablet', width: 768, height: 1024, userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1' },
  { name: 'Mobile', width: 375, height: 667, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1' }
];

// Navegadores a serem testados
const BROWSERS = [
  { name: 'Chrome', executablePath: process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : null },
  { name: 'Firefox', executablePath: process.platform === 'darwin' ? '/Applications/Firefox.app/Contents/MacOS/firefox' : null }
];

// Diretório para salvar os relatórios
const REPORTS_DIR = path.join(__dirname, 'reports', 'compatibility');

/**
 * Executar testes de compatibilidade
 */
async function runCompatibilityTests() {
  console.log('Iniciando testes de compatibilidade...');
  
  // Criar diretório de relatórios se não existir
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  
  // Resultados dos testes
  const results = {
    timestamp: new Date().toISOString(),
    browsers: {},
    devices: {},
    urls: {},
    issues: []
  };
  
  // Testar cada navegador
  for (const browser of BROWSERS) {
    // Verificar se o navegador está disponível
    if (browser.executablePath && !fs.existsSync(browser.executablePath)) {
      console.log(`Navegador ${browser.name} não encontrado em ${browser.executablePath}. Pulando...`);
      continue;
    }
    
    console.log(`\nTestando no navegador: ${browser.name}`);
    
    // Inicializar resultados para o navegador
    results.browsers[browser.name] = {
      tested: true,
      issues: 0,
      screenshots: {}
    };
    
    // Iniciar o navegador
    const browserInstance = await puppeteer.launch({
      headless: true,
      executablePath: browser.executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Testar cada dispositivo
    for (const device of DEVICES) {
      console.log(`Testando no dispositivo: ${device.name}`);
      
      // Inicializar resultados para o dispositivo
      if (!results.devices[device.name]) {
        results.devices[device.name] = {
          tested: true,
          issues: 0,
          screenshots: {}
        };
      }
      
      // Testar cada URL
      for (const url of URLS) {
        const urlPath = new URL(url).pathname;
        console.log(`Testando URL: ${urlPath}`);
        
        // Inicializar resultados para a URL
        if (!results.urls[url]) {
          results.urls[url] = {
            tested: true,
            issues: 0,
            screenshots: {}
          };
        }
        
        try {
          // Abrir nova página
          const page = await browserInstance.newPage();
          
          // Configurar viewport e user agent
          await page.setViewport({ width: device.width, height: device.height });
          await page.setUserAgent(device.userAgent === 'desktop' ? 
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' : 
            device.userAgent);
          
          // Navegar para a URL
          const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
          
          // Verificar status da resposta
          const status = response.status();
          const isSuccess = status >= 200 && status < 400;
          
          if (!isSuccess) {
            const issue = {
              type: 'http_error',
              browser: browser.name,
              device: device.name,
              url: url,
              status: status,
              message: `Erro HTTP ${status} ao carregar a página`
            };
            
            results.issues.push(issue);
            results.browsers[browser.name].issues++;
            results.devices[device.name].issues++;
            results.urls[url].issues++;
          }
          
          // Verificar erros de console
          const consoleErrors = [];
          page.on('console', msg => {
            if (msg.type() === 'error') {
              consoleErrors.push(msg.text());
            }
          });
          
          // Aguardar carregamento completo
          await page.waitForTimeout(2000);
          
          // Verificar erros de console
          if (consoleErrors.length > 0) {
            const issue = {
              type: 'console_error',
              browser: browser.name,
              device: device.name,
              url: url,
              errors: consoleErrors,
              message: `${consoleErrors.length} erros de console encontrados`
            };
            
            results.issues.push(issue);
            results.browsers[browser.name].issues++;
            results.devices[device.name].issues++;
            results.urls[url].issues++;
          }
          
          // Verificar elementos visíveis
          const visibilityChecks = [
            { selector: 'header', name: 'Cabeçalho' },
            { selector: 'main', name: 'Conteúdo principal' },
            { selector: 'footer', name: 'Rodapé' },
            { selector: 'nav', name: 'Navegação' }
          ];
          
          for (const check of visibilityChecks) {
            const isVisible = await page.evaluate((selector) => {
              const element = document.querySelector(selector);
              if (!element) return false;
              
              const style = window.getComputedStyle(element);
              return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
            }, check.selector);
            
            if (!isVisible) {
              const issue = {
                type: 'visibility_error',
                browser: browser.name,
                device: device.name,
                url: url,
                element: check.selector,
                message: `Elemento "${check.name}" não está visível`
              };
              
              results.issues.push(issue);
              results.browsers[browser.name].issues++;
              results.devices[device.name].issues++;
              results.urls[url].issues++;
            }
          }
          
          // Capturar screenshot
          const screenshotPath = path.join(REPORTS_DIR, `screenshot-${browser.name}-${device.name}-${urlPath.replace(/\//g, '-').replace(/^-/, '')}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true });
          
          // Registrar screenshot
          const screenshotRelativePath = path.relative(REPORTS_DIR, screenshotPath);
          results.browsers[browser.name].screenshots[url] = screenshotRelativePath;
          results.devices[device.name].screenshots[url] = screenshotRelativePath;
          results.urls[url].screenshots[`${browser.name}-${device.name}`] = screenshotRelativePath;
          
          // Fechar página
          await page.close();
        } catch (error) {
          console.error(`Erro ao testar ${url} no ${browser.name} (${device.name}):`, error);
          
          const issue = {
            type: 'test_error',
            browser: browser.name,
            device: device.name,
            url: url,
            error: error.message,
            message: `Erro ao executar teste: ${error.message}`
          };
          
          results.issues.push(issue);
          results.browsers[browser.name].issues++;
          results.devices[device.name].issues++;
          results.urls[url].issues++;
        }
      }
    }
    
    // Fechar navegador
    await browserInstance.close();
  }
  
  // Salvar resultados
  const resultsPath = path.join(REPORTS_DIR, `compatibility-results-${new Date().toISOString().replace(/:/g, '-')}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  // Gerar relatório HTML
  generateHtmlReport(results);
  
  console.log('\nTestes de compatibilidade concluídos!');
  console.log(`Relatórios salvos em ${REPORTS_DIR}`);
}

/**
 * Gerar relatório HTML
 * @param {Object} results - Resultados dos testes
 */
function generateHtmlReport(results) {
  // Gerar HTML
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Compatibilidade - FuseLabs</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #4f46e5; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .summary { background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .issue { background-color: #fee2e2; }
    .success { background-color: #d1fae5; }
    .warning { background-color: #ffedd5; }
    .screenshot { max-width: 300px; border: 1px solid #ddd; margin: 10px 0; }
    .screenshot-container { display: flex; flex-wrap: wrap; gap: 10px; }
    .screenshot-item { border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
    .tabs { display: flex; border-bottom: 1px solid #ddd; margin-bottom: 20px; }
    .tab { padding: 10px 15px; cursor: pointer; border: 1px solid transparent; }
    .tab.active { border: 1px solid #ddd; border-bottom-color: white; margin-bottom: -1px; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
  </style>
</head>
<body>
  <h1>Relatório de Compatibilidade - FuseLabs</h1>
  <p>Gerado em: ${new Date(results.timestamp).toLocaleString()}</p>
  
  <div class="summary">
    <h2>Resumo</h2>
    <p>Total de problemas encontrados: ${results.issues.length}</p>
    
    <h3>Navegadores testados:</h3>
    <ul>
      ${Object.entries(results.browsers).map(([browser, data]) => `
      <li>${browser}: ${data.issues} problemas</li>
      `).join('')}
    </ul>
    
    <h3>Dispositivos testados:</h3>
    <ul>
      ${Object.entries(results.devices).map(([device, data]) => `
      <li>${device}: ${data.issues} problemas</li>
      `).join('')}
    </ul>
  </div>
  
  <div class="tabs">
    <div class="tab active" data-tab="issues">Problemas</div>
    <div class="tab" data-tab="browsers">Navegadores</div>
    <div class="tab" data-tab="devices">Dispositivos</div>
    <div class="tab" data-tab="urls">URLs</div>
    <div class="tab" data-tab="screenshots">Screenshots</div>
  </div>
  
  <div id="issues" class="tab-content active">
    <h2>Problemas Encontrados</h2>
    ${results.issues.length === 0 ? '<p>Nenhum problema encontrado!</p>' : `
    <table>
      <tr>
        <th>Tipo</th>
        <th>Navegador</th>
        <th>Dispositivo</th>
        <th>URL</th>
        <th>Mensagem</th>
      </tr>
      ${results.issues.map(issue => `
      <tr class="issue">
        <td>${issue.type}</td>
        <td>${issue.browser}</td>
        <td>${issue.device}</td>
        <td>${new URL(issue.url).pathname}</td>
        <td>${issue.message}</td>
      </tr>
      `).join('')}
    </table>
    `}
  </div>
  
  <div id="browsers" class="tab-content">
    <h2>Resultados por Navegador</h2>
    ${Object.entries(results.browsers).map(([browser, data]) => `
    <div class="browser-section">
      <h3>${browser}</h3>
      <p>Problemas encontrados: ${data.issues}</p>
      
      <h4>Screenshots:</h4>
      <div class="screenshot-container">
        ${Object.entries(data.screenshots).map(([url, screenshot]) => `
        <div class="screenshot-item">
          <p>${new URL(url).pathname}</p>
          <img src="${screenshot}" alt="Screenshot de ${url} no ${browser}" class="screenshot">
        </div>
        `).join('')}
      </div>
    </div>
    `).join('')}
  </div>
  
  <div id="devices" class="tab-content">
    <h2>Resultados por Dispositivo</h2>
    ${Object.entries(results.devices).map(([device, data]) => `
    <div class="device-section">
      <h3>${device}</h3>
      <p>Problemas encontrados: ${data.issues}</p>
      
      <h4>Screenshots:</h4>
      <div class="screenshot-container">
        ${Object.entries(data.screenshots).map(([url, screenshot]) => `
        <div class="screenshot-item">
          <p>${new URL(url).pathname}</p>
          <img src="${screenshot}" alt="Screenshot de ${url} no ${device}" class="screenshot">
        </div>
        `).join('')}
      </div>
    </div>
    `).join('')}
  </div>
  
  <div id="urls" class="tab-content">
    <h2>Resultados por URL</h2>
    ${Object.entries(results.urls).map(([url, data]) => `
    <div class="url-section">
      <h3>${new URL(url).pathname}</h3>
      <p>Problemas encontrados: ${data.issues}</p>
      
      <h4>Screenshots:</h4>
      <div class="screenshot-container">
        ${Object.entries(data.screenshots).map(([combo, screenshot]) => `
        <div class="screenshot-item">
          <p>${combo}</p>
          <img src="${screenshot}" alt="Screenshot de ${url} no ${combo}" class="screenshot">
        </div>
        `).join('')}
      </div>
    </div>
    `).join('')}
  </div>
  
  <div id="screenshots" class="tab-content">
    <h2>Todos os Screenshots</h2>
    <div class="screenshot-container">
      ${Object.entries(results.urls).flatMap(([url, data]) => 
        Object.entries(data.screenshots).map(([combo, screenshot]) => `
        <div class="screenshot-item">
          <p>${new URL(url).pathname} - ${combo}</p>
          <img src="${screenshot}" alt="Screenshot de ${url} no ${combo}" class="screenshot">
        </div>
        `)
      ).join('')}
    </div>
  </div>
  
  <script>
    // Funcionalidade de tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        // Remover classe ativa de todas as tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Adicionar classe ativa à tab clicada
        tab.classList.add('active');
        
        // Mostrar conteúdo correspondente
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
      });
    });
  </script>
</body>
</html>
  `;
  
  // Salvar relatório HTML
  const htmlPath = path.join(REPORTS_DIR, `compatibility-report-${new Date().toISOString().replace(/:/g, '-')}.html`);
  fs.writeFileSync(htmlPath, html);
  
  console.log(`Relatório HTML salvo em ${htmlPath}`);
}

// Executar testes se este arquivo for executado diretamente
if (require.main === module) {
  runCompatibilityTests().catch(console.error);
}

module.exports = {
  runCompatibilityTests
};
