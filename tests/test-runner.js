/**
 * Test Runner para FuseLabs
 * 
 * Este arquivo executa todos os testes unitários e de integração
 * para garantir a qualidade do código.
 */

// Configuração do ambiente de teste
const TestRunner = {
  // Armazenar resultados dos testes
  results: {
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0,
    tests: []
  },
  
  // Armazenar suites de teste
  suites: {},
  
  // Configurar uma suite de testes
  suite: function(name, callback) {
    this.currentSuite = name;
    this.suites[name] = {
      name: name,
      tests: [],
      beforeEach: null,
      afterEach: null
    };
    
    callback();
    
    this.currentSuite = null;
  },
  
  // Configurar função a ser executada antes de cada teste
  beforeEach: function(callback) {
    if (this.currentSuite) {
      this.suites[this.currentSuite].beforeEach = callback;
    }
  },
  
  // Configurar função a ser executada após cada teste
  afterEach: function(callback) {
    if (this.currentSuite) {
      this.suites[this.currentSuite].afterEach = callback;
    }
  },
  
  // Adicionar um teste
  test: function(name, callback, skip = false) {
    if (!this.currentSuite) {
      console.error('Teste deve ser definido dentro de uma suite');
      return;
    }
    
    this.suites[this.currentSuite].tests.push({
      name: name,
      callback: callback,
      skip: skip
    });
  },
  
  // Pular um teste
  skip: function(name, callback) {
    this.test(name, callback, true);
  },
  
  // Executar todos os testes
  run: async function() {
    console.log('Iniciando testes...');
    
    const startTime = performance.now();
    
    for (const suiteName in this.suites) {
      const suite = this.suites[suiteName];
      console.log(`\nSuite: ${suite.name}`);
      
      for (const test of suite.tests) {
        this.results.total++;
        
        if (test.skip) {
          console.log(`  ⚠️ SKIPPED: ${test.name}`);
          this.results.skipped++;
          this.results.tests.push({
            suite: suiteName,
            name: test.name,
            status: 'skipped',
            error: null
          });
          continue;
        }
        
        try {
          // Executar beforeEach se existir
          if (suite.beforeEach) {
            await suite.beforeEach();
          }
          
          // Executar o teste
          await test.callback();
          
          // Executar afterEach se existir
          if (suite.afterEach) {
            await suite.afterEach();
          }
          
          console.log(`  ✅ PASSED: ${test.name}`);
          this.results.passed++;
          this.results.tests.push({
            suite: suiteName,
            name: test.name,
            status: 'passed',
            error: null
          });
        } catch (error) {
          console.error(`  ❌ FAILED: ${test.name}`);
          console.error(`    Error: ${error.message}`);
          this.results.failed++;
          this.results.tests.push({
            suite: suiteName,
            name: test.name,
            status: 'failed',
            error: error.message
          });
          
          // Executar afterEach mesmo em caso de falha
          if (suite.afterEach) {
            try {
              await suite.afterEach();
            } catch (afterError) {
              console.error(`    Error in afterEach: ${afterError.message}`);
            }
          }
        }
      }
    }
    
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n--- Resumo dos Testes ---');
    console.log(`Total: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Skipped: ${this.results.skipped}`);
    console.log(`Duração: ${duration}s`);
    
    return this.results;
  },
  
  // Funções de asserção
  assert: {
    // Verificar se valor é verdadeiro
    isTrue: function(value, message = 'Valor deve ser verdadeiro') {
      if (value !== true) {
        throw new Error(message);
      }
    },
    
    // Verificar se valor é falso
    isFalse: function(value, message = 'Valor deve ser falso') {
      if (value !== false) {
        throw new Error(message);
      }
    },
    
    // Verificar se valores são iguais
    equal: function(actual, expected, message = 'Valores devem ser iguais') {
      if (actual !== expected) {
        throw new Error(`${message}: ${actual} !== ${expected}`);
      }
    },
    
    // Verificar se valores não são iguais
    notEqual: function(actual, expected, message = 'Valores não devem ser iguais') {
      if (actual === expected) {
        throw new Error(`${message}: ${actual} === ${expected}`);
      }
    },
    
    // Verificar se valor é nulo
    isNull: function(value, message = 'Valor deve ser nulo') {
      if (value !== null) {
        throw new Error(message);
      }
    },
    
    // Verificar se valor não é nulo
    isNotNull: function(value, message = 'Valor não deve ser nulo') {
      if (value === null) {
        throw new Error(message);
      }
    },
    
    // Verificar se valor é indefinido
    isUndefined: function(value, message = 'Valor deve ser indefinido') {
      if (value !== undefined) {
        throw new Error(message);
      }
    },
    
    // Verificar se valor não é indefinido
    isDefined: function(value, message = 'Valor não deve ser indefinido') {
      if (value === undefined) {
        throw new Error(message);
      }
    },
    
    // Verificar se array contém valor
    contains: function(array, value, message = 'Array deve conter o valor') {
      if (!Array.isArray(array) || !array.includes(value)) {
        throw new Error(message);
      }
    },
    
    // Verificar se função lança exceção
    throws: function(fn, message = 'Função deve lançar exceção') {
      try {
        fn();
        throw new Error(message);
      } catch (error) {
        // Exceção esperada
        return;
      }
    }
  }
};

// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestRunner;
}

// Executar testes automaticamente se este arquivo for executado diretamente
if (typeof window !== 'undefined' && window.document) {
  window.addEventListener('load', async () => {
    // Carregar todos os arquivos de teste
    await loadTests();
    
    // Executar testes
    const results = await TestRunner.run();
    
    // Exibir resultados na página
    displayResults(results);
  });
}

// Função para carregar arquivos de teste
async function loadTests() {
  // Lista de arquivos de teste
  const testFiles = [
    'tests/auth-service.test.js',
    'tests/data-export.test.js',
    'tests/analytics.test.js',
    'tests/user-menu.test.js'
  ];
  
  // Carregar cada arquivo
  for (const file of testFiles) {
    try {
      const script = document.createElement('script');
      script.src = file;
      script.async = false;
      
      // Aguardar carregamento
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      
      console.log(`Arquivo de teste carregado: ${file}`);
    } catch (error) {
      console.error(`Erro ao carregar arquivo de teste: ${file}`, error);
    }
  }
}

// Função para exibir resultados na página
function displayResults(results) {
  const container = document.getElementById('test-results');
  if (!container) return;
  
  // Limpar container
  container.innerHTML = '';
  
  // Criar cabeçalho
  const header = document.createElement('div');
  header.className = 'test-header';
  header.innerHTML = `
    <h2>Resultados dos Testes</h2>
    <div class="test-summary">
      <span class="test-total">Total: ${results.total}</span>
      <span class="test-passed">Passed: ${results.passed}</span>
      <span class="test-failed">Failed: ${results.failed}</span>
      <span class="test-skipped">Skipped: ${results.skipped}</span>
    </div>
  `;
  container.appendChild(header);
  
  // Agrupar testes por suite
  const suites = {};
  for (const test of results.tests) {
    if (!suites[test.suite]) {
      suites[test.suite] = [];
    }
    suites[test.suite].push(test);
  }
  
  // Criar seção para cada suite
  for (const suiteName in suites) {
    const suiteTests = suites[suiteName];
    
    const suiteElement = document.createElement('div');
    suiteElement.className = 'test-suite';
    suiteElement.innerHTML = `<h3>${suiteName}</h3>`;
    
    // Adicionar cada teste
    const testList = document.createElement('ul');
    testList.className = 'test-list';
    
    for (const test of suiteTests) {
      const testItem = document.createElement('li');
      testItem.className = `test-item test-${test.status}`;
      
      let statusIcon = '';
      if (test.status === 'passed') {
        statusIcon = '✅';
      } else if (test.status === 'failed') {
        statusIcon = '❌';
      } else if (test.status === 'skipped') {
        statusIcon = '⚠️';
      }
      
      testItem.innerHTML = `
        <span class="test-status">${statusIcon}</span>
        <span class="test-name">${test.name}</span>
        ${test.error ? `<div class="test-error">${test.error}</div>` : ''}
      `;
      
      testList.appendChild(testItem);
    }
    
    suiteElement.appendChild(testList);
    container.appendChild(suiteElement);
  }
}
