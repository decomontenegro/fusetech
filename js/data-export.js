/**
 * Funcionalidades para exportação de dados
 */

class DataExporter {
  constructor() {
    this.formats = {
      csv: this.exportToCSV,
      json: this.exportToJSON,
      pdf: this.exportToPDF,
      excel: this.exportToExcel
    };
  }
  
  /**
   * Exporta dados para o formato especificado
   * @param {Object} data - Dados a serem exportados
   * @param {String} format - Formato de exportação (csv, json, pdf, excel)
   * @param {String} filename - Nome do arquivo sem extensão
   * @returns {Boolean} - Sucesso da exportação
   */
  export(data, format, filename) {
    if (!this.formats[format]) {
      console.error(`Formato de exportação '${format}' não suportado`);
      return false;
    }
    
    return this.formats[format].call(this, data, filename);
  }
  
  /**
   * Exporta dados para CSV
   * @param {Object} data - Dados a serem exportados
   * @param {String} filename - Nome do arquivo sem extensão
   * @returns {Boolean} - Sucesso da exportação
   */
  exportToCSV(data, filename) {
    try {
      // Verificar se os dados são um array de objetos
      if (!Array.isArray(data) || !data.length || typeof data[0] !== 'object') {
        throw new Error('Os dados devem ser um array de objetos');
      }
      
      // Obter cabeçalhos (chaves do primeiro objeto)
      const headers = Object.keys(data[0]);
      
      // Criar linhas de dados
      const csvRows = [];
      
      // Adicionar cabeçalhos
      csvRows.push(headers.join(','));
      
      // Adicionar dados
      for (const row of data) {
        const values = headers.map(header => {
          const value = row[header];
          // Escapar aspas e adicionar aspas se o valor contiver vírgula
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }
      
      // Criar blob e link para download
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      
      this.downloadFile(blob, `${filename}.csv`);
      return true;
    } catch (error) {
      console.error('Erro ao exportar para CSV:', error);
      return false;
    }
  }
  
  /**
   * Exporta dados para JSON
   * @param {Object} data - Dados a serem exportados
   * @param {String} filename - Nome do arquivo sem extensão
   * @returns {Boolean} - Sucesso da exportação
   */
  exportToJSON(data, filename) {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      this.downloadFile(blob, `${filename}.json`);
      return true;
    } catch (error) {
      console.error('Erro ao exportar para JSON:', error);
      return false;
    }
  }
  
  /**
   * Exporta dados para PDF (simulação)
   * @param {Object} data - Dados a serem exportados
   * @param {String} filename - Nome do arquivo sem extensão
   * @returns {Boolean} - Sucesso da exportação
   */
  exportToPDF(data, filename) {
    // Em um ambiente real, usaríamos uma biblioteca como jsPDF
    // Para esta demonstração, apenas mostramos uma mensagem
    alert('Exportação para PDF não implementada nesta versão de demonstração');
    return false;
  }
  
  /**
   * Exporta dados para Excel (simulação)
   * @param {Object} data - Dados a serem exportados
   * @param {String} filename - Nome do arquivo sem extensão
   * @returns {Boolean} - Sucesso da exportação
   */
  exportToExcel(data, filename) {
    // Em um ambiente real, usaríamos uma biblioteca como SheetJS
    // Para esta demonstração, apenas mostramos uma mensagem
    alert('Exportação para Excel não implementada nesta versão de demonstração');
    return false;
  }
  
  /**
   * Cria um link de download e o aciona
   * @param {Blob} blob - Blob de dados
   * @param {String} filename - Nome do arquivo com extensão
   */
  downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Limpar
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
  
  /**
   * Obtém dados de atividades para exportação
   * @returns {Array} - Dados de atividades
   */
  getActivitiesData() {
    // Em um ambiente real, estes dados viriam de uma API
    return [
      {
        id: 1,
        date: '2023-05-10',
        type: 'Corrida',
        distance: 5.2,
        duration: '00:25:45',
        pace: '4:57',
        calories: 450
      },
      {
        id: 2,
        date: '2023-05-12',
        type: 'Ciclismo',
        distance: 15.7,
        duration: '00:45:30',
        pace: '2:54',
        calories: 620
      },
      {
        id: 3,
        date: '2023-05-14',
        type: 'Corrida',
        distance: 8.3,
        duration: '00:42:15',
        pace: '5:05',
        calories: 720
      },
      {
        id: 4,
        date: '2023-05-16',
        type: 'Caminhada',
        distance: 4.5,
        duration: '00:55:20',
        pace: '12:18',
        calories: 320
      },
      {
        id: 5,
        date: '2023-05-18',
        type: 'Corrida',
        distance: 10.0,
        duration: '00:50:30',
        pace: '5:03',
        calories: 850
      }
    ];
  }
  
  /**
   * Obtém dados de desafios para exportação
   * @returns {Array} - Dados de desafios
   */
  getChallengesData() {
    // Em um ambiente real, estes dados viriam de uma API
    return [
      {
        id: 1,
        name: 'Desafio 10K de Verão',
        startDate: '2023-06-01',
        endDate: '2023-06-30',
        target: 10,
        progress: 7.5,
        status: 'Em andamento'
      },
      {
        id: 2,
        name: 'Maratona Virtual',
        startDate: '2023-05-01',
        endDate: '2023-05-31',
        target: 42.2,
        progress: 42.2,
        status: 'Concluído'
      },
      {
        id: 3,
        name: 'Desafio de Ciclismo 100K',
        startDate: '2023-07-01',
        endDate: '2023-07-15',
        target: 100,
        progress: 0,
        status: 'Não iniciado'
      }
    ];
  }
  
  /**
   * Obtém dados de estatísticas para exportação
   * @returns {Object} - Dados de estatísticas
   */
  getStatsData() {
    // Em um ambiente real, estes dados viriam de uma API
    return {
      totalDistance: 1245,
      totalDuration: '124:35:00',
      totalCalories: 78450,
      totalActivities: 256,
      averagePace: '5:45',
      bestPerformances: {
        '5K': {
          time: '23:45',
          pace: '4:45',
          date: '2023-04-15'
        },
        '10K': {
          time: '49:32',
          pace: '4:57',
          date: '2023-03-02'
        },
        'HalfMarathon': {
          time: '1:52:18',
          pace: '5:20',
          date: '2023-01-10'
        }
      }
    };
  }
}

// Instância global do exportador de dados
const dataExporter = new DataExporter();
