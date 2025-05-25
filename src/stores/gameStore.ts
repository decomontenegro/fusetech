import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: number
  progress?: number
  maxProgress?: number
}

export interface Challenge {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly' | 'special'
  target: number
  current: number
  reward: {
    fuse: number
    badges?: string[]
    multiplier?: number
  }
  expiresAt: number
  completedAt?: number
}

export interface Activity {
  id: string
  type: 'running' | 'cycling' | 'walking' | 'gym' | 'swimming' | 'other'
  distance?: number
  duration: number
  calories?: number
  source: 'manual' | 'strava' | 'apple-health' | 'google-fit'
  timestamp: number
  fuseEarned: number
  multiplier: number
}

export interface UserStats {
  totalActivities: number
  totalDistance: number
  totalDuration: number
  totalCalories: number
  totalFuseEarned: number
  currentStreak: number
  longestStreak: number
  level: number
  experience: number
  nextLevelExp: number
}

interface GameState {
  // User Data
  userStats: UserStats
  fuseBalance: number
  badges: Badge[]
  unlockedBadges: string[]
  
  // Activities & Progress
  activities: Activity[]
  challenges: Challenge[]
  weeklyGoal: {
    target: number
    current: number
    type: 'distance' | 'duration' | 'activities'
  }
  
  // Multipliers & Bonuses
  activeMultipliers: {
    type: string
    value: number
    expiresAt: number
  }[]
  
  // Actions
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp' | 'fuseEarned' | 'multiplier'>) => void
  updateChallenge: (challengeId: string, progress: number) => void
  unlockBadge: (badgeId: string) => void
  addMultiplier: (type: string, value: number, duration: number) => void
  calculateFuseReward: (activity: Omit<Activity, 'id' | 'timestamp' | 'fuseEarned' | 'multiplier'>) => number
  updateWeeklyGoal: (progress: number) => void
  levelUp: () => void
  resetWeeklyProgress: () => void
}

// Predefined badges
const availableBadges: Badge[] = [
  {
    id: 'first_activity',
    name: 'Primeiro Passo',
    description: 'Complete sua primeira atividade',
    icon: '🏃‍♂️',
    rarity: 'common',
  },
  {
    id: 'week_warrior',
    name: 'Guerreiro Semanal',
    description: 'Complete sua meta semanal',
    icon: '⚔️',
    rarity: 'common',
  },
  {
    id: 'streak_master',
    name: 'Mestre da Sequência',
    description: 'Mantenha uma sequência de 7 dias',
    icon: '🔥',
    rarity: 'rare',
  },
  {
    id: 'distance_demon',
    name: 'Demônio da Distância',
    description: 'Percorra 100km em um mês',
    icon: '👹',
    rarity: 'epic',
  },
  {
    id: 'fuse_collector',
    name: 'Colecionador FUSE',
    description: 'Acumule 1000 FUSE',
    icon: '💎',
    rarity: 'legendary',
  },
]

const initialStats: UserStats = {
  totalActivities: 0,
  totalDistance: 0,
  totalDuration: 0,
  totalCalories: 0,
  totalFuseEarned: 0,
  currentStreak: 0,
  longestStreak: 0,
  level: 1,
  experience: 0,
  nextLevelExp: 100,
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      userStats: initialStats,
      fuseBalance: 0,
      badges: availableBadges,
      unlockedBadges: [],
      activities: [],
      challenges: [],
      weeklyGoal: {
        target: 10, // 10km default
        current: 0,
        type: 'distance',
      },
      activeMultipliers: [],

      addActivity: (activityData) => {
        const state = get()
        const fuseReward = state.calculateFuseReward(activityData)
        
        const activity: Activity = {
          ...activityData,
          id: `activity_${Date.now()}`,
          timestamp: Date.now(),
          fuseEarned: fuseReward,
          multiplier: 1, // Base multiplier
        }

        set((state) => ({
          activities: [activity, ...state.activities],
          fuseBalance: state.fuseBalance + fuseReward,
          userStats: {
            ...state.userStats,
            totalActivities: state.userStats.totalActivities + 1,
            totalDistance: state.userStats.totalDistance + (activity.distance || 0),
            totalDuration: state.userStats.totalDuration + activity.duration,
            totalCalories: state.userStats.totalCalories + (activity.calories || 0),
            totalFuseEarned: state.userStats.totalFuseEarned + fuseReward,
            experience: state.userStats.experience + Math.floor(fuseReward / 2),
          },
        }))

        // Check for badge unlocks
        const newState = get()
        if (newState.userStats.totalActivities === 1) {
          newState.unlockBadge('first_activity')
        }
        
        // Update weekly goal
        if (activity.distance) {
          newState.updateWeeklyGoal(activity.distance)
        }

        // Check for level up
        if (newState.userStats.experience >= newState.userStats.nextLevelExp) {
          newState.levelUp()
        }
      },

      calculateFuseReward: (activity) => {
        let baseFuse = 0
        
        // Base rewards by activity type
        switch (activity.type) {
          case 'running':
            baseFuse = (activity.distance || 0) * 5 + activity.duration * 0.1
            break
          case 'cycling':
            baseFuse = (activity.distance || 0) * 3 + activity.duration * 0.08
            break
          case 'walking':
            baseFuse = (activity.distance || 0) * 2 + activity.duration * 0.05
            break
          case 'gym':
            baseFuse = activity.duration * 0.15
            break
          case 'swimming':
            baseFuse = activity.duration * 0.2
            break
          default:
            baseFuse = activity.duration * 0.1
        }

        // Apply multipliers
        const state = get()
        let totalMultiplier = 1
        
        state.activeMultipliers.forEach(multiplier => {
          if (multiplier.expiresAt > Date.now()) {
            totalMultiplier += multiplier.value
          }
        })

        return Math.floor(baseFuse * totalMultiplier)
      },

      updateWeeklyGoal: (progress) => {
        set((state) => {
          const newCurrent = state.weeklyGoal.current + progress
          const goalCompleted = newCurrent >= state.weeklyGoal.target && 
                               state.weeklyGoal.current < state.weeklyGoal.target

          if (goalCompleted) {
            // Unlock weekly warrior badge
            setTimeout(() => get().unlockBadge('week_warrior'), 500)
          }

          return {
            weeklyGoal: {
              ...state.weeklyGoal,
              current: newCurrent,
            },
          }
        })
      },

      unlockBadge: (badgeId) => {
        set((state) => {
          if (state.unlockedBadges.includes(badgeId)) return state

          const badge = state.badges.find(b => b.id === badgeId)
          if (!badge) return state

          return {
            unlockedBadges: [...state.unlockedBadges, badgeId],
            fuseBalance: state.fuseBalance + 25, // Bonus for unlocking badge
          }
        })
      },

      addMultiplier: (type, value, duration) => {
        set((state) => ({
          activeMultipliers: [
            ...state.activeMultipliers,
            {
              type,
              value,
              expiresAt: Date.now() + duration,
            },
          ],
        }))
      },

      updateChallenge: (challengeId, progress) => {
        set((state) => ({
          challenges: state.challenges.map(challenge =>
            challenge.id === challengeId
              ? { ...challenge, current: Math.min(challenge.current + progress, challenge.target) }
              : challenge
          ),
        }))
      },

      levelUp: () => {
        set((state) => ({
          userStats: {
            ...state.userStats,
            level: state.userStats.level + 1,
            experience: state.userStats.experience - state.userStats.nextLevelExp,
            nextLevelExp: Math.floor(state.userStats.nextLevelExp * 1.5),
          },
          fuseBalance: state.fuseBalance + 50, // Level up bonus
        }))
      },

      resetWeeklyProgress: () => {
        set((state) => ({
          weeklyGoal: {
            ...state.weeklyGoal,
            current: 0,
          },
        }))
      },
    }),
    {
      name: 'fusetech-game',
    }
  )
)
