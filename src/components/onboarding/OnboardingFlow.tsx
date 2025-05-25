'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { WelcomeStep } from './steps/WelcomeStep'
import { ProfileStep } from './steps/ProfileStep'
import { ConnectionsStep } from './steps/ConnectionsStep'
import { GoalStep } from './steps/GoalStep'
import { SuccessStep } from './steps/SuccessStep'
import { BonusNotification } from './BonusNotification'
import { ProgressBar } from './ProgressBar'

export interface OnboardingFlowProps {
  isOpen: boolean
  onClose: () => void
}

const steps = [
  { id: 'welcome', component: WelcomeStep },
  { id: 'profile', component: ProfileStep },
  { id: 'connections', component: ConnectionsStep },
  { id: 'goal', component: GoalStep },
  { id: 'success', component: SuccessStep },
]

export function OnboardingFlow({ isOpen, onClose }: OnboardingFlowProps) {
  const {
    currentStep,
    userProgress,
    nextStep,
    previousStep,
    addHiddenBonus,
    resetOnboarding,
  } = useOnboardingStore()

  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (isOpen && currentStep === 0) {
      // 🎁 Bônus por iniciar onboarding
      setTimeout(() => {
        addHiddenBonus('first_time', 10, 'Bônus Primeira Vez')
      }, 1000)
    }
  }, [isOpen, currentStep, addHiddenBonus])

  const handleClose = () => {
    resetOnboarding()
    onClose()
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      nextStep()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      previousStep()
    }
  }

  const CurrentStepComponent = steps[currentStep]?.component

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Progress Bar */}
          {currentStep > 0 && currentStep < steps.length - 1 && (
            <ProgressBar 
              currentStep={currentStep} 
              totalSteps={steps.length - 2} // Exclude welcome and success
            />
          )}

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {CurrentStepComponent && (
                <CurrentStepComponent
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onClose={handleClose}
                  startTime={startTime}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Bonus Notifications */}
        <BonusNotification />
      </motion.div>
    </AnimatePresence>
  )
}
