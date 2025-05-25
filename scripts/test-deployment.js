#!/usr/bin/env node

/**
 * Script de teste automatizado para validar o deploy da FUSEtech
 * Executa testes básicos de funcionalidade e performance
 */

const https = require('https');
const http = require('http');

class DeploymentTester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runAllTests() {
    console.log('🚀 Iniciando testes de deployment...\n');
    
    await this.testPageLoad('/');
    await this.testPageLoad('/dashboard');
    await this.testPageLoad('/dashboard/wallet');
    await this.testPageLoad('/dashboard/activities');
    await this.testPageLoad('/dashboard/challenges');
    await this.testPageLoad('/dashboard/rewards');
    
    await this.testResponseTime('/');
    await this.testResponseTime('/dashboard/wallet');
    
    await this.test404Handling('/nonexistent-page');
    
    this.printResults();
  }

  async testPageLoad(path) {
    const testName = `Page Load: ${path}`;
    try {
      const startTime = Date.now();
      const response = await this.makeRequest(path);
      const loadTime = Date.now() - startTime;
      
      if (response.statusCode === 200) {
        this.addTest(testName, true, `✅ Loaded in ${loadTime}ms`);
      } else {
        this.addTest(testName, false, `❌ Status: ${response.statusCode}`);
      }
    } catch (error) {
      this.addTest(testName, false, `❌ Error: ${error.message}`);
    }
  }

  async testResponseTime(path) {
    const testName = `Performance: ${path}`;
    try {
      const startTime = Date.now();
      await this.makeRequest(path);
      const responseTime = Date.now() - startTime;
      
      if (responseTime < 3000) {
        this.addTest(testName, true, `⚡ ${responseTime}ms (Good)`);
      } else if (responseTime < 5000) {
        this.addTest(testName, true, `⚠️ ${responseTime}ms (Acceptable)`);
      } else {
        this.addTest(testName, false, `🐌 ${responseTime}ms (Too slow)`);
      }
    } catch (error) {
      this.addTest(testName, false, `❌ Error: ${error.message}`);
    }
  }

  async test404Handling(path) {
    const testName = `404 Handling: ${path}`;
    try {
      const response = await this.makeRequest(path);
      
      if (response.statusCode === 404) {
        this.addTest(testName, true, `✅ Proper 404 response`);
      } else {
        this.addTest(testName, false, `❌ Expected 404, got ${response.statusCode}`);
      }
    } catch (error) {
      this.addTest(testName, false, `❌ Error: ${error.message}`);
    }
  }

  makeRequest(path) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${path}`;
      const protocol = url.startsWith('https') ? https : http;
      
      const req = protocol.get(url, (res) => {
        resolve(res);
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  addTest(name, passed, message) {
    this.results.tests.push({ name, passed, message });
    if (passed) {
      this.results.passed++;
    } else {
      this.results.failed++;
    }
    console.log(`${passed ? '✅' : '❌'} ${name}: ${message}`);
  }

  printResults() {
    console.log('\n📊 RESULTADOS DOS TESTES');
    console.log('========================');
    console.log(`✅ Passou: ${this.results.passed}`);
    console.log(`❌ Falhou: ${this.results.failed}`);
    console.log(`📈 Taxa de sucesso: ${Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100)}%`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 Todos os testes passaram! Deploy está funcionando perfeitamente.');
    } else {
      console.log('\n⚠️ Alguns testes falharam. Verifique os problemas acima.');
    }
    
    console.log('\n🔗 Próximos passos:');
    console.log('1. Teste manual em diferentes browsers');
    console.log('2. Teste responsividade mobile');
    console.log('3. Colete feedback de usuários reais');
  }
}

// Execução do script
const baseUrl = process.argv[2];

if (!baseUrl) {
  console.log('❌ Erro: URL base não fornecida');
  console.log('Uso: node test-deployment.js <URL>');
  console.log('Exemplo: node test-deployment.js https://fusetech.vercel.app');
  process.exit(1);
}

const tester = new DeploymentTester(baseUrl);
tester.runAllTests().catch(console.error);
