/**
 * Testes de acessibilidade para FuseLabs
 * 
 * Este script executa testes de acessibilidade para verificar a conformidade
 * com as diretrizes WCAG 2.1 (nível AA).
 */

const puppeteer = require('puppeteer');
const axeCore = require('axe-core');
const fs = require('fs');
const path = require('path');

// URLs a serem testadas
const URLS = [
  'http://localhost:8080/index_modular.html',
  'http://localhost:8080/atividades.html',
  'http://localhost:8080/analytics.html',
  'http://localhost:8080/desafios.html',
  'http://localhost:8080/perfil.html'
];

// Diretório para salvar os relatórios
const REPORTS_DIR = path.join(__dirname, 'reports', 'accessibility');

/**
 * Executar testes de acessibilidade
 */
async function runAccessibilityTests() {
  console.log('Iniciando testes de acessibilidade...');
  
  // Criar diretório de relatórios se não existir
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  
  // Iniciar o navegador
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 800 }
  });
  
  // Resultados dos testes
  const results = [];
  
  // Testar cada URL
  for (const url of URLS) {
    console.log(`\nTestando ${url}...`);
    
    try {
      // Abrir nova página
      const page = await browser.newPage();
      
      // Navegar para a URL
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Injetar axe-core
      await page.evaluateHandle(`
        ${axeCore.source}
        
        // Configurar axe
        axe.configure({
          reporter: 'v2',
          rules: [
            // Regras específicas podem ser configuradas aqui
          ]
        });
      `);
      
      // Executar análise de acessibilidade
      const axeResults = await page.evaluate(() => {
        return new Promise(resolve => {
          axe.run(document, {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa', 'best-practice']
            }
          }, (err, results) => {
            if (err) throw err;
            resolve(results);
          });
        });
      });
      
      // Adicionar URL aos resultados
      axeResults.url = url;
      axeResults.timestamp = new Date().toISOString();
      
      // Adicionar aos resultados
      results.push(axeResults);
      
      // Salvar relatório individual
      const reportPath = path.join(REPORTS_DIR, `axe-${new URL(url).pathname.replace(/\//g, '-').replace(/^-/, '')}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(axeResults, null, 2));
      
      // Exibir resumo
      console.log(`Violações: ${axeResults.violations.length}`);
      console.log(`Passes: ${axeResults.passes.length}`);
      console.log(`Incompletos: ${axeResults.incomplete.length}`);
      console.log(`Inaplicáveis: ${axeResults.inapplicable.length}`);
      
      // Fechar página
      await page.close();
    } catch (error) {
      console.error(`Erro ao testar ${url}:`, error);
    }
  }
  
  // Salvar resultados completos
  const resultsPath = path.join(REPORTS_DIR, `accessibility-results-${new Date().toISOString().replace(/:/g, '-')}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  // Gerar relatório HTML
  generateHtmlReport(results);
  
  // Fechar navegador
  await browser.close();
  
  console.log('\nTestes de acessibilidade concluídos!');
  console.log(`Relatórios salvos em ${REPORTS_DIR}`);
}

/**
 * Gerar relatório HTML
 * @param {Array} results - Resultados dos testes
 */
function generateHtmlReport(results) {
  // Calcular estatísticas
  const stats = {
    total: {
      violations: 0,
      passes: 0,
      incomplete: 0,
      inapplicable: 0
    },
    byUrl: {}
  };
  
  // Categorias de impacto
  const impactCategories = ['critical', 'serious', 'moderate', 'minor'];
  
  // Contar violações por impacto
  const violationsByImpact = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0
  };
  
  // Contar violações por regra
  const violationsByRule = {};
  
  // Processar resultados
  results.forEach(result => {
    const url = result.url;
    const urlPath = new URL(url).pathname;
    
    // Inicializar estatísticas para URL
    stats.byUrl[url] = {
      violations: result.violations.length,
      passes: result.passes.length,
      incomplete: result.incomplete.length,
      inapplicable: result.inapplicable.length
    };
    
    // Atualizar totais
    stats.total.violations += result.violations.length;
    stats.total.passes += result.passes.length;
    stats.total.incomplete += result.incomplete.length;
    stats.total.inapplicable += result.inapplicable.length;
    
    // Contar violações por impacto
    result.violations.forEach(violation => {
      if (violation.impact) {
        violationsByImpact[violation.impact]++;
      }
      
      // Contar violações por regra
      if (!violationsByRule[violation.id]) {
        violationsByRule[violation.id] = {
          id: violation.id,
          description: violation.description,
          help: violation.help,
          helpUrl: violation.helpUrl,
          count: 0,
          urls: {}
        };
      }
      
      violationsByRule[violation.id].count++;
      
      if (!violationsByRule[violation.id].urls[urlPath]) {
        violationsByRule[violation.id].urls[urlPath] = 0;
      }
      
      violationsByRule[violation.id].urls[urlPath]++;
    });
  });
  
  // Ordenar violações por contagem
  const sortedViolations = Object.values(violationsByRule).sort((a, b) => b.count - a.count);
  
  // Gerar HTML
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Acessibilidade - FuseLabs</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #4f46e5; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .summary { background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .critical { background-color: #fee2e2; }
    .serious { background-color: #ffedd5; }
    .moderate { background-color: #fef3c7; }
    .minor { background-color: #f3f4f6; }
    .impact-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .impact-critical { background-color: #ef4444; color: white; }
    .impact-serious { background-color: #f97316; color: white; }
    .impact-moderate { background-color: #f59e0b; color: white; }
    .impact-minor { background-color: #9ca3af; color: white; }
    .violation-details { margin-top: 10px; border-left: 4px solid #ddd; padding-left: 15px; }
    .toggle-button { background: none; border: none; cursor: pointer; color: #4f46e5; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <h1>Relatório de Acessibilidade - FuseLabs</h1>
  <p>Gerado em: ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <h2>Resumo</h2>
    <p>Total de páginas testadas: ${results.length}</p>
    <p>Total de violações encontradas: ${stats.total.violations}</p>
    <p>Total de testes passados: ${stats.total.passes}</p>
    
    <h3>Violações por Impacto</h3>
    <ul>
      <li><span class="impact-badge impact-critical">Crítico</span>: ${violationsByImpact.critical}</li>
      <li><span class="impact-badge impact-serious">Sério</span>: ${violationsByImpact.serious}</li>
      <li><span class="impact-badge impact-moderate">Moderado</span>: ${violationsByImpact.moderate}</li>
      <li><span class="impact-badge impact-minor">Menor</span>: ${violationsByImpact.minor}</li>
    </ul>
  </div>
  
  <h2>Resultados por Página</h2>
  <table>
    <tr>
      <th>Página</th>
      <th>Violações</th>
      <th>Passes</th>
      <th>Incompletos</th>
      <th>Inaplicáveis</th>
    </tr>
    ${Object.entries(stats.byUrl).map(([url, stat]) => `
    <tr>
      <td>${new URL(url).pathname}</td>
      <td>${stat.violations}</td>
      <td>${stat.passes}</td>
      <td>${stat.incomplete}</td>
      <td>${stat.inapplicable}</td>
    </tr>
    `).join('')}
  </table>
  
  <h2>Violações Encontradas</h2>
  ${sortedViolations.map(violation => `
  <div class="violation ${violation.impact || 'minor'}">
    <h3>
      <span class="impact-badge impact-${violation.impact || 'minor'}">${violation.impact || 'menor'}</span>
      ${violation.id} (${violation.count} ocorrências)
    </h3>
    <p>${violation.description}</p>
    <p><strong>Ajuda:</strong> ${violation.help}</p>
    <p><a href="${violation.helpUrl}" target="_blank">Mais informações</a></p>
    
    <h4>Páginas afetadas:</h4>
    <ul>
      ${Object.entries(violation.urls).map(([url, count]) => `
      <li>${url} (${count} ocorrências)</li>
      `).join('')}
    </ul>
  </div>
  `).join('')}
  
  <script>
    // Adicionar funcionalidades interativas se necessário
    document.querySelectorAll('.toggle-button').forEach(button => {
      button.addEventListener('click', () => {
        const target = document.getElementById(button.getAttribute('data-target'));
        if (target) {
          target.classList.toggle('hidden');
          button.textContent = target.classList.contains('hidden') ? 'Mostrar detalhes' : 'Ocultar detalhes';
        }
      });
    });
  </script>
</body>
</html>
  `;
  
  // Salvar relatório HTML
  const htmlPath = path.join(REPORTS_DIR, `accessibility-report-${new Date().toISOString().replace(/:/g, '-')}.html`);
  fs.writeFileSync(htmlPath, html);
  
  console.log(`Relatório HTML salvo em ${htmlPath}`);
}

// Executar testes se este arquivo for executado diretamente
if (require.main === module) {
  runAccessibilityTests().catch(console.error);
}

module.exports = {
  runAccessibilityTests
};
