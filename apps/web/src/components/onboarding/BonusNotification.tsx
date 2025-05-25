'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { Gift, X } from 'lucide-react'

export function BonusNotification() {
  const { notifications, dismissNotification } = useOnboardingStore()

  useEffect(() => {
    // Auto-dismiss notifications after 4 seconds
    notifications.forEach((_, index) => {
      setTimeout(() => {
        dismissNotification(index)
      }, 4000)
    })
  }, [notifications, dismissNotification])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.timestamp}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-xl border-l-4 border-green-300 max-w-sm"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: 2
                }}
              >
                <Gift className="w-6 h-6" />
              </motion.div>
              
              <div className="flex-1">
                <div className="font-bold text-lg">Bônus Surpresa!</div>
                <div className="text-sm opacity-95">{notification.description}</div>
                <div className="text-xs opacity-90 font-semibold">
                  +{notification.amount} FUSE
                </div>
              </div>
              
              <div className="text-xl font-bold bg-white bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center">
                +{notification.amount}
              </div>
              
              <button
                onClick={() => dismissNotification(index)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
