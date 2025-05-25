'use client'

import { motion } from 'framer-motion'
import { Zap, Activity, Gift, Users } from 'lucide-react'

interface WelcomeStepProps {
  onNext: () => void
  onClose: () => void
}

export function WelcomeStep({ onNext, onClose }: WelcomeStepProps) {
  const benefits = [
    {
      icon: Activity,
      title: 'Registre Atividades',
      description: 'Conecte apps e dispositivos',
    },
    {
      icon: Zap,
      title: 'Ganhe Tokens',
      description: 'Cada exercício vira FUSE',
    },
    {
      icon: Gift,
      title: 'Troque Recompensas',
      description: 'Use tokens no marketplace',
    },
    {
      icon: Users,
      title: 'Conecte-se',
      description: 'Desafie amigos e comunidade',
    },
  ]

  return (
    <div className="p-8">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-6xl mb-6"
        >
          🎉
        </motion.div>
        
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          Bem-vindo ao FUSEtech!
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-600 mb-8"
        >
          Transforme exercícios em recompensas
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <benefit.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={onNext}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            Começar Configuração
          </motion.button>
          
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 py-2"
          >
            Pular por agora
          </motion.button>
        </div>
      </div>
    </div>
  )
}
