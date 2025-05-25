import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface HiddenBonus {
  type: string
  amount: number
  description: string
  timestamp: number
}

export interface UserProfile {
  name: string
  goal: 'weight-loss' | 'muscle-gain' | 'endurance' | 'general'
  frequency: '1-2' | '3-4' | '5-6' | 'daily'
}

export interface UserGoal {
  distance: number
  reward: {
    fuse: number
    bonus: string
    description: string
  }
}

export interface UserProgress {
  totalFuse: number
  badges: string[]
  hiddenBonuses: HiddenBonus[]
  profile: UserProfile | null
  connections: string[]
  goal: UserGoal | null
  completedAt: number | null
}

interface OnboardingState {
  currentStep: number
  userProgress: UserProgress
  notifications: HiddenBonus[]
  
  // Actions
  nextStep: () => void
  previousStep: () => void
  setStep: (step: number) => void
  addHiddenBonus: (type: string, amount: number, description: string) => void
  updateProfile: (profile: UserProfile) => void
  addConnection: (connection: string) => void
  setGoal: (goal: UserGoal) => void
  completeOnboarding: () => void
  resetOnboarding: () => void
  dismissNotification: (index: number) => void
}

// Recompensas por distância
export const distanceRewards = {
  5: { fuse: 25, bonus: "Iniciante", description: "Perfeito para começar!" },
  10: { fuse: 50, bonus: "Consistência", description: "Meta equilibrada!" },
  15: { fuse: 80, bonus: "Dedicação", description: "Impressionante!" },
  20: { fuse: 120, bonus: "Elite", description: "Você é incrível!" }
} as const

const initialUserProgress: UserProgress = {
  totalFuse: 0,
  badges: [],
  hiddenBonuses: [],
  profile: null,
  connections: [],
  goal: null,
  completedAt: null,
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      userProgress: initialUserProgress,
      notifications: [],

      nextStep: () => set((state) => ({ 
        currentStep: Math.min(state.currentStep + 1, 4) 
      })),

      previousStep: () => set((state) => ({ 
        currentStep: Math.max(state.currentStep - 1, 0) 
      })),

      setStep: (step: number) => set({ currentStep: step }),

      addHiddenBonus: (type: string, amount: number, description: string) => {
        const bonus: HiddenBonus = {
          type,
          amount,
          description,
          timestamp: Date.now(),
        }

        set((state) => ({
          userProgress: {
            ...state.userProgress,
            totalFuse: state.userProgress.totalFuse + amount,
            hiddenBonuses: [...state.userProgress.hiddenBonuses, bonus],
          },
          notifications: [...state.notifications, bonus],
        }))
      },

      updateProfile: (profile: UserProfile) => {
        set((state) => ({
          userProgress: {
            ...state.userProgress,
            profile,
          },
        }))

        // 🎁 Bônus por completar perfil
        setTimeout(() => {
          get().addHiddenBonus('profile_complete', 5, 'Bônus Detalhista')
        }, 500)

        // 🎁 Bônus por nome criativo
        if (profile.name.length > 8) {
          setTimeout(() => {
            get().addHiddenBonus('long_name', 3, 'Bônus Nome Criativo')
          }, 1200)
        }
      },

      addConnection: (connection: string) => {
        const state = get()
        const newConnections = [...state.userProgress.connections, connection]

        set((state) => ({
          userProgress: {
            ...state.userProgress,
            connections: newConnections,
          },
        }))

        // 🎁 Bônus por primeira conexão
        if (newConnections.length === 1) {
          setTimeout(() => {
            get().addHiddenBonus('first_connection', 8, 'Bônus Primeira Conexão')
          }, 800)
        }

        // 🎁 Bônus por conectividade total
        if (newConnections.length === 2) {
          setTimeout(() => {
            get().addHiddenBonus('full_connectivity', 15, 'Bônus Conectividade Total')
          }, 1200)
        }
      },

      setGoal: (goal: UserGoal) => {
        set((state) => ({
          userProgress: {
            ...state.userProgress,
            goal,
          },
        }))

        // 🎁 Bônus por meta ambiciosa
        if (goal.distance >= 15) {
          setTimeout(() => {
            get().addHiddenBonus('ambitious_goal', 20, 'Bônus Ambicioso')
          }, 800)
        }
      },

      completeOnboarding: () => {
        set((state) => ({
          userProgress: {
            ...state.userProgress,
            completedAt: Date.now(),
          },
        }))
      },

      resetOnboarding: () => set({
        currentStep: 0,
        userProgress: initialUserProgress,
        notifications: [],
      }),

      dismissNotification: (index: number) => set((state) => ({
        notifications: state.notifications.filter((_, i) => i !== index),
      })),
    }),
    {
      name: 'fusetech-onboarding',
      partialize: (state) => ({ 
        userProgress: state.userProgress,
        currentStep: state.currentStep,
      }),
    }
  )
)
