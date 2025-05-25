export const GoogleFitDataSchema = {
  // Esquema para sessões de atividade
  session: {
    type: 'object',
    required: ['id', 'name', 'startTimeMillis', 'endTimeMillis', 'activityType'],
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' },
      startTimeMillis: { type: 'number' },
      endTimeMillis: { type: 'number' },
      activityType: { type: 'number' },
      application: {
        type: 'object',
        properties: {
          packageName: { type: 'string' },
          version: { type: 'string' }
        }
      },
      activityTypeConfidence: { type: 'number' },
      activeTimeMillis: { type: 'number' }
    }
  },
  
  // Esquema para pontos de dados
  dataPoint: {
    type: 'object',
    required: ['dataTypeName', 'startTimeNanos', 'endTimeNanos', 'value'],
    properties: {
      dataTypeName: { type: 'string' },
      startTimeNanos: { type: 'number' },
      endTimeNanos: { type: 'number' },
      value: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            intVal: { type: 'number' },
            fpVal: { type: 'number' },
            stringVal: { type: 'string' },
            mapVal: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  value: {
                    type: 'object',
                    properties: {
                      intVal: { type: 'number' },
                      fpVal: { type: 'number' },
                      stringVal: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      originDataSourceId: { type: 'string' }
    }
  }
};

// Mapeamento de tipos de atividade do Google Fit para tipos internos
export const GoogleFitActivityTypeMap = {
  // Corrida
  8: 'running',    // Running
  7: 'running',    // Running on a treadmill
  
  // Caminhada
  7: 'walking',    // Walking
  8: 'walking',    // Walking on a treadmill
  41: 'walking',   // Hiking
  
  // Ciclismo
  1: 'cycling',    // Biking
  2: 'cycling',    // Biking on a stationary bike / spinning
  
  // Natação
  82: 'swimming',  // Swimming
  83: 'swimming',  // Swimming in a pool
  84: 'swimming',  // Swimming in open water
  
  // Treinamento funcional
  9: 'functional_training',    // Aerobics
  10: 'functional_training',   // Strength training
  11: 'functional_training',   // Circuit training
  12: 'functional_training',   // Weight lifting
  79: 'functional_training',   // High intensity interval training
  62: 'functional_training',   // Crossfit
  
  // Esportes
  15: 'sports',    // Basketball
  16: 'sports',    // Soccer
  17: 'sports',    // American football
  18: 'sports',    // Tennis
  19: 'sports',    // Volleyball
  20: 'sports',    // Cricket
  21: 'sports',    // Baseball
  22: 'sports',    // Rugby
  23: 'sports',    // Golf
  
  // Yoga e pilates
  89: 'yoga',      // Yoga
  90: 'yoga',      // Pilates
  
  // Dança
  24: 'dance',     // Dancing
  
  // Outros
  108: 'other',    // Other
  4: 'other'       // Other (unclassified fitness activity)
};

// Mapeamento de tipos de dados do Google Fit
export const GoogleFitDataTypeMap = {
  'com.google.step_count.delta': 'steps',
  'com.google.calories.expended': 'calories',
  'com.google.distance.delta': 'distance',
  'com.google.heart_rate.bpm': 'heart_rate',
  'com.google.active_minutes': 'active_minutes',
  'com.google.speed': 'speed',
  'com.google.height': 'height',
  'com.google.weight': 'weight'
};
