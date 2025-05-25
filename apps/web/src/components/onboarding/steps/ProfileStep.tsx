'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { Scale, Dumbbell, Heart, Zap } from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  goal: z.enum(['weight-loss', 'muscle-gain', 'endurance', 'general']),
  frequency: z.enum(['1-2', '3-4', '5-6', 'daily']),
})

type ProfileForm = z.infer<typeof profileSchema>

interface ProfileStepProps {
  onNext: () => void
  onPrevious: () => void
}

const goals = [
  {
    id: 'weight-loss' as const,
    icon: Scale,
    title: 'Perder Peso',
    description: 'Foco em queima de calorias',
  },
  {
    id: 'muscle-gain' as const,
    icon: Dumbbell,
    title: 'Ganhar Músculo',
    description: 'Hipertrofia e força',
  },
  {
    id: 'endurance' as const,
    icon: Zap,
    title: 'Resistência',
    description: 'Cardio e performance',
  },
  {
    id: 'general' as const,
    icon: Heart,
    title: 'Saúde Geral',
    description: 'Bem-estar completo',
  },
]

export function ProfileStep({ onNext, onPrevious }: ProfileStepProps) {
  const { updateProfile } = useOnboardingStore()
  const [selectedGoal, setSelectedGoal] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  const watchedName = watch('name', '')

  const onSubmit = (data: ProfileForm) => {
    updateProfile(data)
    onNext()
  }

  return (
    <div className="p-8">
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-4xl mb-4"
        >
          👤
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Conte-nos sobre você
        </h2>
        <p className="text-gray-600">Passo 1 de 3</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto space-y-6">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Como prefere ser chamado?
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder="Seu nome"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
          {watchedName.length > 8 && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-600 text-sm mt-1"
            >
              ✨ Nome criativo detectado!
            </motion.p>
          )}
        </div>

        {/* Objetivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Qual seu principal objetivo?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {goals.map((goal) => (
              <motion.label
                key={goal.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative cursor-pointer p-3 border-2 rounded-lg text-center transition-all ${
                  selectedGoal === goal.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <input
                  {...register('goal')}
                  type="radio"
                  value={goal.id}
                  className="sr-only"
                  onChange={() => setSelectedGoal(goal.id)}
                />
                <goal.icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <div className="font-medium text-sm">{goal.title}</div>
                <div className="text-xs text-gray-500">{goal.description}</div>
              </motion.label>
            ))}
          </div>
          {errors.goal && (
            <p className="text-red-500 text-sm mt-1">{errors.goal.message}</p>
          )}
        </div>

        {/* Frequência */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantas vezes treina por semana?
          </label>
          <select
            {...register('frequency')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecione...</option>
            <option value="1-2">1-2 vezes</option>
            <option value="3-4">3-4 vezes</option>
            <option value="5-6">5-6 vezes</option>
            <option value="daily">Todos os dias</option>
          </select>
          {errors.frequency && (
            <p className="text-red-500 text-sm mt-1">{errors.frequency.message}</p>
          )}
        </div>

        {/* Botões */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onPrevious}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Voltar
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            Próximo
          </button>
        </div>
      </form>
    </div>
  )
}
