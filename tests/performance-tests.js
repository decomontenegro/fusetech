/**
 * Testes de performance para FuseLabs
 * 
 * Este script executa testes de performance para verificar o desempenho
 * das principais páginas e funcionalidades da aplicação.
 */

const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const { URL } = require('url');
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

// Métricas a serem analisadas
const METRICS = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'speed-index',
  'total-blocking-time',
  'cumulative-layout-shift',
  'interactive'
];

// Configurações do Lighthouse
const LIGHTHOUSE_CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1
    }
  }
};

// Diretório para salvar os relatórios
const REPORTS_DIR = path.join(__dirname, 'reports');

/**
 * Executar testes de performance
 */
async function runPerformanceTests() {
  console.log('Iniciando testes de performance...');
  
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
      
      // Executar Lighthouse
      const { lhr } = await lighthouse(url, {
        port: (new URL(browser.wsEndpoint())).port,
        output: 'json',
        logLevel: 'error'
      }, LIGHTHOUSE_CONFIG);
      
      // Extrair pontuações
      const scores = {
        url,
        performance: lhr.categories.performance.score * 100,
        accessibility: lhr.categories.accessibility.score * 100,
        bestPractices: lhr.categories['best-practices'].score * 100,
        seo: lhr.categories.seo.score * 100
      };
      
      // Extrair métricas
      const metrics = {};
      METRICS.forEach(metric => {
        const metricData = lhr.audits[metric];
        metrics[metric] = {
          value: metricData.numericValue,
          unit: metricData.numericUnit,
          score: metricData.score
        };
      });
      
      // Adicionar aos resultados
      results.push({
        url,
        scores,
        metrics,
        timestamp: new Date().toISOString()
      });
      
      // Salvar relatório completo
      const reportPath = path.join(REPORTS_DIR, `lighthouse-${new URL(url).pathname.replace(/\//g, '-').replace(/^-/, '')}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(lhr, null, 2));
      
      console.log(`Performance: ${scores.performance.toFixed(0)}%`);
      console.log(`Accessibility: ${scores.accessibility.toFixed(0)}%`);
      console.log(`Best Practices: ${scores.bestPractices.toFixed(0)}%`);
      console.log(`SEO: ${scores.seo.toFixed(0)}%`);
      
      // Fechar página
      await page.close();
    } catch (error) {
      console.error(`Erro ao testar ${url}:`, error);
    }
  }
  
  // Salvar resultados
  const resultsPath = path.join(REPORTS_DIR, `performance-results-${new Date().toISOString().replace(/:/g, '-')}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  // Gerar relatório resumido
  generateSummaryReport(results);
  
  // Fechar navegador
  await browser.close();
  
  console.log('\nTestes de performance concluídos!');
  console.log(`Relatórios salvos em ${REPORTS_DIR}`);
}

/**
 * Gerar relatório resumido
 * @param {Array} results - Resultados dos testes
 */
function generateSummaryReport(results) {
  // Calcular médias
  const averages = {
    performance: 0,
    accessibility: 0,
    bestPractices: 0,
    seo: 0,
    metrics: {}
  };
  
  // Inicializar métricas
  METRICS.forEach(metric => {
    averages.metrics[metric] = { value: 0, count: 0 };
  });
  
  // Somar valores
  results.forEach(result => {
    averages.performance += result.scores.performance;
    averages.accessibility += result.scores.accessibility;
    averages.bestPractices += result.scores.bestPractices;
    averages.seo += result.scores.seo;
    
    // Somar métricas
    METRICS.forEach(metric => {
      if (result.metrics[metric]) {
        averages.metrics[metric].value += result.metrics[metric].value;
        averages.metrics[metric].count++;
      }
    });
  });
  
  // Calcular médias
  const count = results.length;
  averages.performance /= count;
  averages.accessibility /= count;
  averages.bestPractices /= count;
  averages.seo /= count;
  
  // Calcular médias de métricas
  METRICS.forEach(metric => {
    if (averages.metrics[metric].count > 0) {
      averages.metrics[metric].average = averages.metrics[metric].value / averages.metrics[metric].count;
      delete averages.metrics[metric].count;
      delete averages.metrics[metric].value;
    }
  });
  
  // Gerar relatório HTML
  const htmlReport = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Performance - FuseLabs</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1, h2 { color: #4f46e5; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .good { color: #22c55e; }
    .average { color: #f59e0b; }
    .poor { color: #ef4444; }
    .summary { background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>Relatório de Performance - FuseLabs</h1>
  <p>Gerado em: ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <h2>Resumo</h2>
    <p>Pontuações médias:</p>
    <ul>
      <li>Performance: <span class="${getScoreClass(averages.performance)}">${averages.performance.toFixed(1)}%</span></li>
      <li>Acessibilidade: <span class="${getScoreClass(averages.accessibility)}">${averages.accessibility.toFixed(1)}%</span></li>
      <li>Boas Práticas: <span class="${getScoreClass(averages.bestPractices)}">${averages.bestPractices.toFixed(1)}%</span></li>
      <li>SEO: <span class="${getScoreClass(averages.seo)}">${averages.seo.toFixed(1)}%</span></li>
    </ul>
  </div>
  
  <h2>Resultados por Página</h2>
  <table>
    <tr>
      <th>Página</th>
      <th>Performance</th>
      <th>Acessibilidade</th>
      <th>Boas Práticas</th>
      <th>SEO</th>
    </tr>
    ${results.map(result => `
    <tr>
      <td>${new URL(result.url).pathname}</td>
      <td class="${getScoreClass(result.scores.performance)}">${result.scores.performance.toFixed(1)}%</td>
      <td class="${getScoreClass(result.scores.accessibility)}">${result.scores.accessibility.toFixed(1)}%</td>
      <td class="${getScoreClass(result.scores.bestPractices)}">${result.scores.bestPractices.toFixed(1)}%</td>
      <td class="${getScoreClass(result.scores.seo)}">${result.scores.seo.toFixed(1)}%</td>
    </tr>
    `).join('')}
  </table>
  
  <h2>Métricas Detalhadas</h2>
  <table>
    <tr>
      <th>Página</th>
      ${METRICS.map(metric => `<th>${formatMetricName(metric)}</th>`).join('')}
    </tr>
    ${results.map(result => `
    <tr>
      <td>${new URL(result.url).pathname}</td>
      ${METRICS.map(metric => {
        if (!result.metrics[metric]) return '<td>N/A</td>';
        const value = result.metrics[metric].value;
        const unit = result.metrics[metric].unit;
        const formattedValue = formatMetricValue(metric, value);
        const scoreClass = getMetricScoreClass(metric, value);
        return `<td class="${scoreClass}">${formattedValue}${unit ? ' ' + unit : ''}</td>`;
      }).join('')}
    </tr>
    `).join('')}
  </table>
  
  <script>
    // Adicionar funcionalidades interativas se necessário
  </script>
</body>
</html>
  `;
  
  // Salvar relatório HTML
  const htmlPath = path.join(REPORTS_DIR, `performance-report-${new Date().toISOString().replace(/:/g, '-')}.html`);
  fs.writeFileSync(htmlPath, htmlReport);
  
  console.log(`Relatório resumido salvo em ${htmlPath}`);
}

/**
 * Obter classe CSS com base na pontuação
 * @param {Number} score - Pontuação
 * @returns {String} - Classe CSS
 */
function getScoreClass(score) {
  if (score >= 90) return 'good';
  if (score >= 50) return 'average';
  return 'poor';
}

/**
 * Obter classe CSS com base na métrica
 * @param {String} metric - Nome da métrica
 * @param {Number} value - Valor da métrica
 * @returns {String} - Classe CSS
 */
function getMetricScoreClass(metric, value) {
  switch (metric) {
    case 'first-contentful-paint':
    case 'largest-contentful-paint':
      return value <= 2500 ? 'good' : value <= 4000 ? 'average' : 'poor';
    
    case 'speed-index':
      return value <= 3400 ? 'good' : value <= 5800 ? 'average' : 'poor';
    
    case 'total-blocking-time':
      return value <= 200 ? 'good' : value <= 600 ? 'average' : 'poor';
    
    case 'cumulative-layout-shift':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'average' : 'poor';
    
    case 'interactive':
      return value <= 3800 ? 'good' : value <= 7300 ? 'average' : 'poor';
    
    default:
      return '';
  }
}

/**
 * Formatar nome da métrica
 * @param {String} metric - Nome da métrica
 * @returns {String} - Nome formatado
 */
function formatMetricName(metric) {
  switch (metric) {
    case 'first-contentful-paint': return 'FCP';
    case 'largest-contentful-paint': return 'LCP';
    case 'speed-index': return 'Speed Index';
    case 'total-blocking-time': return 'TBT';
    case 'cumulative-layout-shift': return 'CLS';
    case 'interactive': return 'TTI';
    default: return metric;
  }
}

/**
 * Formatar valor da métrica
 * @param {String} metric - Nome da métrica
 * @param {Number} value - Valor da métrica
 * @returns {String} - Valor formatado
 */
function formatMetricValue(metric, value) {
  switch (metric) {
    case 'first-contentful-paint':
    case 'largest-contentful-paint':
    case 'speed-index':
    case 'interactive':
    case 'total-blocking-time':
      return (value / 1000).toFixed(2);
    
    case 'cumulative-layout-shift':
      return value.toFixed(3);
    
    default:
      return value.toString();
  }
}

// Executar testes se este arquivo for executado diretamente
if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

module.exports = {
  runPerformanceTests
};
