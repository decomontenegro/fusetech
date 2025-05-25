/**
 * Testes para o serviço de exportação de dados
 */

// Definir suite de testes para DataExporter
TestRunner.suite('DataExporter', function() {
  // Mock para Blob e URL
  let originalBlob;
  let originalURL;
  let createdBlobs = [];
  let createdURLs = [];
  
  // Configurar mocks antes de cada teste
  TestRunner.beforeEach(function() {
    // Salvar referências originais
    originalBlob = window.Blob;
    originalURL = window.URL;
    
    // Limpar arrays de controle
    createdBlobs = [];
    createdURLs = [];
    
    // Mock para Blob
    window.Blob = function(parts, options) {
      const blob = {
        parts: parts,
        options: options,
        size: parts.join('').length,
        type: options.type
      };
      createdBlobs.push(blob);
      return blob;
    };
    
    // Mock para URL.createObjectURL
    window.URL = {
      createObjectURL: function(blob) {
        const url = `blob:${createdURLs.length}`;
        createdURLs.push({ url, blob });
        return url;
      },
      revokeObjectURL: function(url) {
        const index = createdURLs.findIndex(item => item.url === url);
        if (index !== -1) {
          createdURLs.splice(index, 1);
        }
      }
    };
    
    // Mock para document.createElement
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
      const element = originalCreateElement.call(document, tagName);
      
      // Mock para o método click em links
      if (tagName === 'a') {
        element.click = function() {
          // Simular download
          console.log(`Download simulado: ${element.download}, URL: ${element.href}`);
        };
      }
      
      return element;
    };
    
    // Mock para document.body.appendChild e removeChild
    const originalAppendChild = document.body.appendChild;
    const originalRemoveChild = document.body.removeChild;
    
    document.body.appendChild = function(element) {
      // Não fazer nada para evitar modificar o DOM real
      return element;
    };
    
    document.body.removeChild = function(element) {
      // Não fazer nada para evitar modificar o DOM real
    };
  });
  
  // Restaurar originais após cada teste
  TestRunner.afterEach(function() {
    window.Blob = originalBlob;
    window.URL = originalURL;
  });
  
  // Teste: Exportar para CSV
  TestRunner.test('deve exportar dados para CSV corretamente', function() {
    const data = [
      { id: 1, name: 'Item 1', value: 100 },
      { id: 2, name: 'Item 2', value: 200 },
      { id: 3, name: 'Item 3', value: 300 }
    ];
    
    const result = dataExporter.exportToCSV(data, 'test-export');
    
    // Verificar resultado
    TestRunner.assert.isTrue(result, 'Exportação deve ser bem-sucedida');
    
    // Verificar se Blob foi criado corretamente
    TestRunner.assert.equal(createdBlobs.length, 1, 'Deve criar um Blob');
    TestRunner.assert.equal(createdBlobs[0].options.type, 'text/csv;charset=utf-8;', 'Tipo do Blob deve ser CSV');
    
    // Verificar conteúdo do CSV
    const csvContent = createdBlobs[0].parts[0];
    const lines = csvContent.split('\n');
    
    TestRunner.assert.equal(lines.length, 4, 'CSV deve ter 4 linhas (cabeçalho + 3 registros)');
    TestRunner.assert.equal(lines[0], 'id,name,value', 'Primeira linha deve ser o cabeçalho');
    TestRunner.assert.contains(lines[1], '"1"', 'Segunda linha deve conter o ID do primeiro item');
    TestRunner.assert.contains(lines[1], '"Item 1"', 'Segunda linha deve conter o nome do primeiro item');
    TestRunner.assert.contains(lines[1], '"100"', 'Segunda linha deve conter o valor do primeiro item');
  });
  
  // Teste: Exportar para JSON
  TestRunner.test('deve exportar dados para JSON corretamente', function() {
    const data = { 
      items: [
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 }
      ],
      total: 300
    };
    
    const result = dataExporter.exportToJSON(data, 'test-export');
    
    // Verificar resultado
    TestRunner.assert.isTrue(result, 'Exportação deve ser bem-sucedida');
    
    // Verificar se Blob foi criado corretamente
    TestRunner.assert.equal(createdBlobs.length, 1, 'Deve criar um Blob');
    TestRunner.assert.equal(createdBlobs[0].options.type, 'application/json', 'Tipo do Blob deve ser JSON');
    
    // Verificar conteúdo do JSON
    const jsonContent = createdBlobs[0].parts[0];
    const parsedJson = JSON.parse(jsonContent);
    
    TestRunner.assert.equal(parsedJson.total, data.total, 'JSON deve conter o total correto');
    TestRunner.assert.equal(parsedJson.items.length, data.items.length, 'JSON deve conter o número correto de itens');
    TestRunner.assert.equal(parsedJson.items[0].id, data.items[0].id, 'JSON deve conter o ID correto do primeiro item');
    TestRunner.assert.equal(parsedJson.items[0].name, data.items[0].name, 'JSON deve conter o nome correto do primeiro item');
  });
  
  // Teste: Obter dados de atividades
  TestRunner.test('deve retornar dados de atividades', function() {
    const activities = dataExporter.getActivitiesData();
    
    TestRunner.assert.isTrue(Array.isArray(activities), 'Deve retornar um array');
    TestRunner.assert.isTrue(activities.length > 0, 'Array não deve estar vazio');
    
    // Verificar estrutura do primeiro item
    const firstActivity = activities[0];
    TestRunner.assert.isDefined(firstActivity.id, 'Atividade deve ter ID');
    TestRunner.assert.isDefined(firstActivity.date, 'Atividade deve ter data');
    TestRunner.assert.isDefined(firstActivity.type, 'Atividade deve ter tipo');
    TestRunner.assert.isDefined(firstActivity.distance, 'Atividade deve ter distância');
  });
  
  // Teste: Obter dados de desafios
  TestRunner.test('deve retornar dados de desafios', function() {
    const challenges = dataExporter.getChallengesData();
    
    TestRunner.assert.isTrue(Array.isArray(challenges), 'Deve retornar um array');
    TestRunner.assert.isTrue(challenges.length > 0, 'Array não deve estar vazio');
    
    // Verificar estrutura do primeiro item
    const firstChallenge = challenges[0];
    TestRunner.assert.isDefined(firstChallenge.id, 'Desafio deve ter ID');
    TestRunner.assert.isDefined(firstChallenge.name, 'Desafio deve ter nome');
    TestRunner.assert.isDefined(firstChallenge.startDate, 'Desafio deve ter data de início');
    TestRunner.assert.isDefined(firstChallenge.endDate, 'Desafio deve ter data de término');
    TestRunner.assert.isDefined(firstChallenge.target, 'Desafio deve ter meta');
    TestRunner.assert.isDefined(firstChallenge.progress, 'Desafio deve ter progresso');
  });
  
  // Teste: Obter dados de estatísticas
  TestRunner.test('deve retornar dados de estatísticas', function() {
    const stats = dataExporter.getStatsData();
    
    TestRunner.assert.isDefined(stats, 'Deve retornar um objeto');
    TestRunner.assert.isDefined(stats.totalDistance, 'Estatísticas devem incluir distância total');
    TestRunner.assert.isDefined(stats.totalDuration, 'Estatísticas devem incluir duração total');
    TestRunner.assert.isDefined(stats.totalCalories, 'Estatísticas devem incluir calorias totais');
    TestRunner.assert.isDefined(stats.totalActivities, 'Estatísticas devem incluir total de atividades');
    TestRunner.assert.isDefined(stats.bestPerformances, 'Estatísticas devem incluir melhores desempenhos');
  });
  
  // Teste: Exportar formato não suportado
  TestRunner.test('deve retornar falso para formato não suportado', function() {
    const data = [{ id: 1, name: 'Test' }];
    
    const result = dataExporter.export(data, 'invalid-format', 'test-export');
    
    TestRunner.assert.isFalse(result, 'Exportação deve falhar para formato não suportado');
  });
});
