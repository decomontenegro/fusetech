// Apple HealthKit Integration (iOS only)
import { Activity } from '@/stores/gameStore'

export interface HealthKitWorkout {
  workoutType: string
  startDate: Date
  endDate: Date
  duration: number
  totalDistance?: number
  totalEnergyBurned?: number
  metadata?: Record<string, any>
}

export interface HealthKitQuantitySample {
  quantityType: string
  value: number
  unit: string
  startDate: Date
  endDate: Date
}

class HealthKitAPI {
  private isAvailable: boolean = false

  constructor() {
    // Check if HealthKit is available (iOS only)
    this.isAvailable = typeof window !== 'undefined' && 
                      'webkit' in window && 
                      'messageHandlers' in (window as any).webkit &&
                      'healthKit' in (window as any).webkit.messageHandlers
  }

  // Check if HealthKit is available
  isHealthKitAvailable(): boolean {
    return this.isAvailable
  }

  // Request authorization for HealthKit data
  async requestAuthorization(readTypes: string[], writeTypes: string[] = []): Promise<boolean> {
    if (!this.isAvailable) {
      throw new Error('HealthKit is not available on this device')
    }

    return new Promise((resolve, reject) => {
      try {
        // Send message to iOS app
        (window as any).webkit.messageHandlers.healthKit.postMessage({
          action: 'requestAuthorization',
          readTypes,
          writeTypes,
        })

        // Listen for response
        const handleResponse = (event: MessageEvent) => {
          if (event.data.type === 'healthKitAuthResponse') {
            window.removeEventListener('message', handleResponse)
            resolve(event.data.authorized)
          }
        }

        window.addEventListener('message', handleResponse)

        // Timeout after 30 seconds
        setTimeout(() => {
          window.removeEventListener('message', handleResponse)
          reject(new Error('HealthKit authorization timeout'))
        }, 30000)

      } catch (error) {
        reject(error)
      }
    })
  }

  // Get workout data
  async getWorkouts(startDate: Date, endDate: Date): Promise<HealthKitWorkout[]> {
    if (!this.isAvailable) {
      throw new Error('HealthKit is not available on this device')
    }

    return new Promise((resolve, reject) => {
      try {
        (window as any).webkit.messageHandlers.healthKit.postMessage({
          action: 'getWorkouts',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })

        const handleResponse = (event: MessageEvent) => {
          if (event.data.type === 'healthKitWorkoutsResponse') {
            window.removeEventListener('message', handleResponse)
            
            if (event.data.error) {
              reject(new Error(event.data.error))
            } else {
              resolve(event.data.workouts.map((workout: any) => ({
                ...workout,
                startDate: new Date(workout.startDate),
                endDate: new Date(workout.endDate),
              })))
            }
          }
        }

        window.addEventListener('message', handleResponse)

        setTimeout(() => {
          window.removeEventListener('message', handleResponse)
          reject(new Error('HealthKit workouts request timeout'))
        }, 30000)

      } catch (error) {
        reject(error)
      }
    })
  }

  // Get quantity samples (steps, distance, calories, etc.)
  async getQuantitySamples(
    quantityType: string,
    startDate: Date,
    endDate: Date
  ): Promise<HealthKitQuantitySample[]> {
    if (!this.isAvailable) {
      throw new Error('HealthKit is not available on this device')
    }

    return new Promise((resolve, reject) => {
      try {
        (window as any).webkit.messageHandlers.healthKit.postMessage({
          action: 'getQuantitySamples',
          quantityType,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })

        const handleResponse = (event: MessageEvent) => {
          if (event.data.type === 'healthKitQuantityResponse') {
            window.removeEventListener('message', handleResponse)
            
            if (event.data.error) {
              reject(new Error(event.data.error))
            } else {
              resolve(event.data.samples.map((sample: any) => ({
                ...sample,
                startDate: new Date(sample.startDate),
                endDate: new Date(sample.endDate),
              })))
            }
          }
        }

        window.addEventListener('message', handleResponse)

        setTimeout(() => {
          window.removeEventListener('message', handleResponse)
          reject(new Error('HealthKit quantity request timeout'))
        }, 30000)

      } catch (error) {
        reject(error)
      }
    })
  }

  // Convert HealthKit workout to our Activity format
  convertWorkoutToActivity(workout: HealthKitWorkout): Omit<Activity, 'id' | 'timestamp' | 'fuseEarned' | 'multiplier'> {
    const workoutTypeMap: Record<string, Activity['type']> = {
      'HKWorkoutActivityTypeRunning': 'running',
      'HKWorkoutActivityTypeCycling': 'cycling',
      'HKWorkoutActivityTypeWalking': 'walking',
      'HKWorkoutActivityTypeSwimming': 'swimming',
      'HKWorkoutActivityTypeFunctionalStrengthTraining': 'gym',
      'HKWorkoutActivityTypeTraditionalStrengthTraining': 'gym',
      'HKWorkoutActivityTypeYoga': 'other',
      'HKWorkoutActivityTypePilates': 'other',
    }

    return {
      type: workoutTypeMap[workout.workoutType] || 'other',
      distance: workout.totalDistance ? workout.totalDistance / 1000 : undefined, // Convert meters to km
      duration: workout.duration, // Duration in seconds
      calories: workout.totalEnergyBurned,
      source: 'apple-health',
    }
  }

  // Get daily step count
  async getDailySteps(date: Date): Promise<number> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    try {
      const samples = await this.getQuantitySamples(
        'HKQuantityTypeIdentifierStepCount',
        startOfDay,
        endOfDay
      )

      return samples.reduce((total, sample) => total + sample.value, 0)
    } catch (error) {
      console.error('Error fetching daily steps:', error)
      return 0
    }
  }

  // Get daily distance
  async getDailyDistance(date: Date): Promise<number> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    try {
      const samples = await this.getQuantitySamples(
        'HKQuantityTypeIdentifierDistanceWalkingRunning',
        startOfDay,
        endOfDay
      )

      return samples.reduce((total, sample) => total + sample.value, 0) / 1000 // Convert to km
    } catch (error) {
      console.error('Error fetching daily distance:', error)
      return 0
    }
  }

  // Get heart rate data
  async getHeartRateData(startDate: Date, endDate: Date): Promise<HealthKitQuantitySample[]> {
    try {
      return await this.getQuantitySamples(
        'HKQuantityTypeIdentifierHeartRate',
        startDate,
        endDate
      )
    } catch (error) {
      console.error('Error fetching heart rate data:', error)
      return []
    }
  }
}

export const healthKitAPI = new HealthKitAPI()

// Common HealthKit data types
export const HealthKitDataTypes = {
  // Workout types
  WORKOUTS: 'HKWorkoutType',
  
  // Quantity types
  STEP_COUNT: 'HKQuantityTypeIdentifierStepCount',
  DISTANCE_WALKING_RUNNING: 'HKQuantityTypeIdentifierDistanceWalkingRunning',
  DISTANCE_CYCLING: 'HKQuantityTypeIdentifierDistanceCycling',
  DISTANCE_SWIMMING: 'HKQuantityTypeIdentifierDistanceSwimming',
  ACTIVE_ENERGY_BURNED: 'HKQuantityTypeIdentifierActiveEnergyBurned',
  BASAL_ENERGY_BURNED: 'HKQuantityTypeIdentifierBasalEnergyBurned',
  HEART_RATE: 'HKQuantityTypeIdentifierHeartRate',
  BODY_MASS: 'HKQuantityTypeIdentifierBodyMass',
  HEIGHT: 'HKQuantityTypeIdentifierHeight',
  BODY_FAT_PERCENTAGE: 'HKQuantityTypeIdentifierBodyFatPercentage',
  
  // Category types
  SLEEP_ANALYSIS: 'HKCategoryTypeIdentifierSleepAnalysis',
  MINDFUL_SESSION: 'HKCategoryTypeIdentifierMindfulSession',
}

// Request standard permissions
export async function requestStandardHealthKitPermissions(): Promise<boolean> {
  const readTypes = [
    HealthKitDataTypes.WORKOUTS,
    HealthKitDataTypes.STEP_COUNT,
    HealthKitDataTypes.DISTANCE_WALKING_RUNNING,
    HealthKitDataTypes.DISTANCE_CYCLING,
    HealthKitDataTypes.ACTIVE_ENERGY_BURNED,
    HealthKitDataTypes.HEART_RATE,
  ]

  return healthKitAPI.requestAuthorization(readTypes)
}
