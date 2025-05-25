export const AppleHealthDataSchema = {
  // Esquema para treinos (workouts)
  workout: {
    type: 'object',
    required: ['uuid', 'workoutActivityType', 'startDate', 'endDate', 'duration', 'totalDistance'],
    properties: {
      uuid: { type: 'string' },
      workoutActivityType: { type: 'string' },
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
      duration: { type: 'number' },
      totalDistance: { type: 'number' },
      totalEnergyBurned: { type: 'number' },
      totalFlightsClimbed: { type: 'number' },
      totalSwimmingStrokeCount: { type: 'number' },
      source: { type: 'string' },
      sourceBundle: { type: 'string' },
      device: { 
        type: 'object',
        properties: {
          name: { type: 'string' },
          manufacturer: { type: 'string' },
          model: { type: 'string' },
          hardwareVersion: { type: 'string' },
          softwareVersion: { type: 'string' }
        }
      },
      metadata: { 
        type: 'object',
        additionalProperties: true
      },
      route: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', format: 'date-time' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            altitude: { type: 'number' },
            speed: { type: 'number' },
            course: { type: 'number' },
            horizontalAccuracy: { type: 'number' },
            verticalAccuracy: { type: 'number' }
          }
        }
      }
    }
  },
  
  // Esquema para passos (steps)
  steps: {
    type: 'object',
    required: ['date', 'value'],
    properties: {
      date: { type: 'string', format: 'date' },
      value: { type: 'number' },
      source: { type: 'string' },
      sourceBundle: { type: 'string' }
    }
  },
  
  // Esquema para frequência cardíaca (heart rate)
  heartRate: {
    type: 'object',
    required: ['timestamp', 'value'],
    properties: {
      timestamp: { type: 'string', format: 'date-time' },
      value: { type: 'number' },
      source: { type: 'string' },
      sourceBundle: { type: 'string' },
      device: { 
        type: 'object',
        properties: {
          name: { type: 'string' },
          manufacturer: { type: 'string' },
          model: { type: 'string' },
          hardwareVersion: { type: 'string' },
          softwareVersion: { type: 'string' }
        }
      }
    }
  },
  
  // Esquema para energia ativa (active energy)
  activeEnergy: {
    type: 'object',
    required: ['date', 'value'],
    properties: {
      date: { type: 'string', format: 'date' },
      value: { type: 'number' },
      source: { type: 'string' },
      sourceBundle: { type: 'string' }
    }
  }
};

// Mapeamento de tipos de atividade do Apple Health para tipos internos
export const AppleHealthActivityTypeMap = {
  // Corrida
  'HKWorkoutActivityTypeRunning': 'running',
  'HKWorkoutActivityTypeTrackAndField': 'running',
  'HKWorkoutActivityTypeTreadmill': 'running',
  
  // Caminhada
  'HKWorkoutActivityTypeWalking': 'walking',
  'HKWorkoutActivityTypeHiking': 'walking',
  
  // Ciclismo
  'HKWorkoutActivityTypeCycling': 'cycling',
  'HKWorkoutActivityTypeIndoorCycling': 'cycling',
  'HKWorkoutActivityTypeCyclingIndoor': 'cycling',
  
  // Natação
  'HKWorkoutActivityTypeSwimming': 'swimming',
  'HKWorkoutActivityTypePoolSwim': 'swimming',
  'HKWorkoutActivityTypeOpenWaterSwim': 'swimming',
  
  // Treinamento funcional
  'HKWorkoutActivityTypeFunctionalStrengthTraining': 'functional_training',
  'HKWorkoutActivityTypeTraditionalStrengthTraining': 'functional_training',
  'HKWorkoutActivityTypeCrossTraining': 'functional_training',
  'HKWorkoutActivityTypeHighIntensityIntervalTraining': 'functional_training',
  'HKWorkoutActivityTypeCircuitTraining': 'functional_training',
  'HKWorkoutActivityTypeFlexibility': 'functional_training',
  
  // Esportes
  'HKWorkoutActivityTypeBasketball': 'sports',
  'HKWorkoutActivityTypeSoccer': 'sports',
  'HKWorkoutActivityTypeVolleyball': 'sports',
  'HKWorkoutActivityTypeFootball': 'sports',
  'HKWorkoutActivityTypeBaseball': 'sports',
  'HKWorkoutActivityTypeTennis': 'sports',
  'HKWorkoutActivityTypeTableTennis': 'sports',
  'HKWorkoutActivityTypeRacquetball': 'sports',
  'HKWorkoutActivityTypeSquash': 'sports',
  'HKWorkoutActivityTypeGolf': 'sports',
  
  // Yoga e pilates
  'HKWorkoutActivityTypeYoga': 'yoga',
  'HKWorkoutActivityTypePilates': 'yoga',
  'HKWorkoutActivityTypeMindAndBody': 'yoga',
  
  // Dança
  'HKWorkoutActivityTypeDance': 'dance',
  'HKWorkoutActivityTypeSocialDance': 'dance',
  
  // Outros
  'HKWorkoutActivityTypeOther': 'other'
};
