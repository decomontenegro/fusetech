/**
 * Script para executar todos os testes do FuseLabs
 * 
 * Este script executa todos os testes disponíveis e gera um relatório consolidado.
 */

const { runPerformanceTests } = require('./performance-tests');
const { runAccessibilityTests } = require('./accessibility-tests');
const { runCompatibilityTests } = require('./compatibility-tests');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Diretório para salvar os relatórios
const REPORTS_DIR = path.join(__dirname, 'reports');

/**
 * Executar todos os testes
 */
async function runAllTests() {
  console.log('Iniciando execução de todos os testes...\n');
  
  // Criar diretório de relatórios se não existir
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  
  // Resultados dos testes
  const results = {
    timestamp: new Date().toISOString(),
    performance: { status: 'pending' },
    accessibility: { status: 'pending' },
    compatibility: { status: 'pending' }
  };
  
  // Iniciar servidor local para testes
  console.log('Iniciando servidor local...');
  let serverProcess;
  
  try {
    // Verificar se o servidor já está em execução
    const isServerRunning = checkServerRunning();
    
    if (!isServerRunning) {
      // Iniciar servidor em segundo plano
      serverProcess = require('child_process').spawn('npx', ['http-server', '.', '-p', '8080'], {
        detached: true,
        stdio: 'ignore'
      });
      
      // Aguardar inicialização do servidor
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Servidor local iniciado na porta 8080');
    } else {
      console.log('Servidor local já está em execução');
    }
    
    // Executar testes de performance
    console.log('\n=== TESTES DE PERFORMANCE ===\n');
    try {
      await runPerformanceTests();
      results.performance = { status: 'success' };
    } catch (error) {
      console.error('Erro ao executar testes de performance:', error);
      results.performance = { status: 'error', error: error.message };
    }
    
    // Executar testes de acessibilidade
    console.log('\n=== TESTES DE ACESSIBILIDADE ===\n');
    try {
      await runAccessibilityTests();
      results.accessibility = { status: 'success' };
    } catch (error) {
      console.error('Erro ao executar testes de acessibilidade:', error);
      results.accessibility = { status: 'error', error: error.message };
    }
    
    // Executar testes de compatibilidade
    console.log('\n=== TESTES DE COMPATIBILIDADE ===\n');
    try {
      await runCompatibilityTests();
      results.compatibility = { status: 'success' };
    } catch (error) {
      console.error('Erro ao executar testes de compatibilidade:', error);
      results.compatibility = { status: 'error', error: error.message };
    }
    
    // Gerar relatório consolidado
    generateConsolidatedReport(results);
    
    console.log('\nTodos os testes foram concluídos!');
    console.log(`Relatórios salvos em ${REPORTS_DIR}`);
  } catch (error) {
    console.error('Erro ao executar testes:', error);
  } finally {
    // Encerrar servidor se foi iniciado por este script
    if (serverProcess) {
      serverProcess.kill();
      console.log('Servidor local encerrado');
    }
  }
}

/**
 * Verificar se o servidor já está em execução
 * @returns {Boolean} - Verdadeiro se o servidor estiver em execução
 */
function checkServerRunning() {
  try {
    // Tentar fazer uma requisição para o servidor
    const http = require('http');
    
    return new Promise(resolve => {
      const req = http.get('http://localhost:8080', res => {
        resolve(true);
        req.destroy();
      });
      
      req.on('error', () => {
        resolve(false);
      });
      
      req.setTimeout(1000, () => {
        req.destroy();
        resolve(false);
      });
    });
  } catch (error) {
    return false;
  }
}

/**
 * Gerar relatório consolidado
 * @param {Object} results - Resultados dos testes
 */
function generateConsolidatedReport(results) {
  // Obter relatórios mais recentes
  const performanceReport = getMostRecentReport('performance-report');
  const accessibilityReport = getMostRecentReport('accessibility-report');
  const compatibilityReport = getMostRecentReport('compatibility-report');
  
  // Gerar HTML
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Consolidado de Testes - FuseLabs</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #4f46e5; }
    .summary { background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .card { border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
    .success { border-left: 4px solid #22c55e; }
    .error { border-left: 4px solid #ef4444; }
    .pending { border-left: 4px solid #f59e0b; }
    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      color: white;
    }
    .status-success { background-color: #22c55e; }
    .status-error { background-color: #ef4444; }
    .status-pending { background-color: #f59e0b; }
    .report-link {
      display: inline-block;
      padding: 8px 16px;
      background-color: #4f46e5;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 10px;
    }
    .report-link:hover {
      background-color: #4338ca;
    }
  </style>
</head>
<body>
  <h1>Relatório Consolidado de Testes - FuseLabs</h1>
  <p>Gerado em: ${new Date(results.timestamp).toLocaleString()}</p>
  
  <div class="summary">
    <h2>Resumo</h2>
    <p>Resultado dos testes executados:</p>
    <ul>
      <li>
        Testes de Performance: 
        <span class="status-badge status-${results.performance.status}">
          ${results.performance.status === 'success' ? 'Sucesso' : 
            results.performance.status === 'error' ? 'Erro' : 'Pendente'}
        </span>
      </li>
      <li>
        Testes de Acessibilidade: 
        <span class="status-badge status-${results.accessibility.status}">
          ${results.accessibility.status === 'success' ? 'Sucesso' : 
            results.accessibility.status === 'error' ? 'Erro' : 'Pendente'}
        </span>
      </li>
      <li>
        Testes de Compatibilidade: 
        <span class="status-badge status-${results.compatibility.status}">
          ${results.compatibility.status === 'success' ? 'Sucesso' : 
            results.compatibility.status === 'error' ? 'Erro' : 'Pendente'}
        </span>
      </li>
    </ul>
  </div>
  
  <div class="card ${results.performance.status}">
    <h2>Testes de Performance</h2>
    <p>Status: 
      <span class="status-badge status-${results.performance.status}">
        ${results.performance.status === 'success' ? 'Sucesso' : 
          results.performance.status === 'error' ? 'Erro' : 'Pendente'}
      </span>
    </p>
    ${results.performance.error ? `<p>Erro: ${results.performance.error}</p>` : ''}
    ${performanceReport ? `
      <p>Relatório detalhado disponível:</p>
      <a href="${performanceReport}" class="report-link" target="_blank">Ver Relatório de Performance</a>
    ` : '<p>Relatório detalhado não disponível</p>'}
  </div>
  
  <div class="card ${results.accessibility.status}">
    <h2>Testes de Acessibilidade</h2>
    <p>Status: 
      <span class="status-badge status-${results.accessibility.status}">
        ${results.accessibility.status === 'success' ? 'Sucesso' : 
          results.accessibility.status === 'error' ? 'Erro' : 'Pendente'}
      </span>
    </p>
    ${results.accessibility.error ? `<p>Erro: ${results.accessibility.error}</p>` : ''}
    ${accessibilityReport ? `
      <p>Relatório detalhado disponível:</p>
      <a href="${accessibilityReport}" class="report-link" target="_blank">Ver Relatório de Acessibilidade</a>
    ` : '<p>Relatório detalhado não disponível</p>'}
  </div>
  
  <div class="card ${results.compatibility.status}">
    <h2>Testes de Compatibilidade</h2>
    <p>Status: 
      <span class="status-badge status-${results.compatibility.status}">
        ${results.compatibility.status === 'success' ? 'Sucesso' : 
          results.compatibility.status === 'error' ? 'Erro' : 'Pendente'}
      </span>
    </p>
    ${results.compatibility.error ? `<p>Erro: ${results.compatibility.error}</p>` : ''}
    ${compatibilityReport ? `
      <p>Relatório detalhado disponível:</p>
      <a href="${compatibilityReport}" class="report-link" target="_blank">Ver Relatório de Compatibilidade</a>
    ` : '<p>Relatório detalhado não disponível</p>'}
  </div>
  
  <div class="card">
    <h2>Próximos Passos</h2>
    <p>Com base nos resultados dos testes, recomendamos as seguintes ações:</p>
    <ul>
      <li>Revisar e corrigir problemas de acessibilidade identificados</li>
      <li>Otimizar o carregamento de recursos para melhorar a performance</li>
      <li>Ajustar o layout para melhor compatibilidade em dispositivos móveis</li>
      <li>Implementar testes automatizados como parte do pipeline de CI/CD</li>
    </ul>
  </div>
</body>
</html>
  `;
  
  // Salvar relatório HTML
  const htmlPath = path.join(REPORTS_DIR, `consolidated-report-${new Date().toISOString().replace(/:/g, '-')}.html`);
  fs.writeFileSync(htmlPath, html);
  
  console.log(`Relatório consolidado salvo em ${htmlPath}`);
  
  // Abrir relatório no navegador
  try {
    const url = `file://${path.resolve(htmlPath)}`;
    
    if (process.platform === 'darwin') {
      execSync(`open "${url}"`);
    } else if (process.platform === 'win32') {
      execSync(`start "${url}"`);
    } else {
      execSync(`xdg-open "${url}"`);
    }
  } catch (error) {
    console.log('Não foi possível abrir o relatório automaticamente');
  }
}

/**
 * Obter relatório mais recente
 * @param {String} prefix - Prefixo do nome do arquivo
 * @returns {String|null} - Caminho relativo do relatório ou null
 */
function getMostRecentReport(prefix) {
  try {
    // Obter todos os arquivos no diretório de relatórios
    const files = [];
    
    // Função recursiva para buscar arquivos
    function findFiles(dir) {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          findFiles(itemPath);
        } else if (stat.isFile() && item.startsWith(prefix) && item.endsWith('.html')) {
          files.push({
            path: itemPath,
            mtime: stat.mtime.getTime()
          });
        }
      });
    }
    
    findFiles(REPORTS_DIR);
    
    // Ordenar por data de modificação (mais recente primeiro)
    files.sort((a, b) => b.mtime - a.mtime);
    
    // Retornar o primeiro arquivo (mais recente)
    if (files.length > 0) {
      return path.relative(REPORTS_DIR, files[0].path);
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar relatório mais recente:', error);
    return null;
  }
}

// Executar testes se este arquivo for executado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests
};
