import React from 'react';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ExerciseType, FitnessGoal, FitnessLevel } from '@fuseapp/types';

interface PerfilEsportivoFormProps {
  section: 'basico' | 'metricas' | 'objetivos' | 'preferencias';
}

export default function PerfilEsportivoForm({ section }: PerfilEsportivoFormProps) {
  // Estado para o formulário (na implementação real, seria usado um gerenciador de formulário como react-hook-form)
  const [formData, setFormData] = useState({
    // Seção básica
    fitnessLevel: FitnessLevel.BEGINNER,
    primarySport: ExerciseType.RUNNING,
    secondarySports: [] as ExerciseType[],
    experienceYears: 0,
    
    // Métricas de saúde
    height: 170,
    weight: 70,
    restingHeartRate: 70,
    maxHeartRate: 180,
    limitations: [] as string[],
    
    // Objetivos
    goals: [FitnessGoal.GENERAL_FITNESS] as FitnessGoal[],
    specificGoals: [] as string[],
    customGoal: '',
    
    // Preferências
    preferredExercises: [] as ExerciseType[],
    preferredDayTime: 'morning',
    preferredDuration: 30,
    preferredFrequency: 3,
    outdoorPreference: 0.5,
  });
  
  // Renderizar seção básica
  if (section === 'basico') {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fitnessLevel">Nível de Condicionamento Físico</Label>
          <Select 
            value={formData.fitnessLevel} 
            onValueChange={(value) => setFormData({ ...formData, fitnessLevel: value as FitnessLevel })}
          >
            <SelectTrigger id="fitnessLevel">
              <SelectValue placeholder="Selecione seu nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FitnessLevel.BEGINNER}>Iniciante</SelectItem>
              <SelectItem value={FitnessLevel.INTERMEDIATE}>Intermediário</SelectItem>
              <SelectItem value={FitnessLevel.ADVANCED}>Avançado</SelectItem>
              <SelectItem value={FitnessLevel.ELITE}>Elite</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Este nível ajudará a definir a intensidade dos seus treinos e metas.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="primarySport">Atividade Física Principal</Label>
          <Select 
            value={formData.primarySport} 
            onValueChange={(value) => setFormData({ ...formData, primarySport: value as ExerciseType })}
          >
            <SelectTrigger id="primarySport">
              <SelectValue placeholder="Selecione sua atividade principal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ExerciseType.RUNNING}>Corrida</SelectItem>
              <SelectItem value={ExerciseType.CYCLING}>Ciclismo</SelectItem>
              <SelectItem value={ExerciseType.WALKING}>Caminhada</SelectItem>
              <SelectItem value={ExerciseType.SWIMMING}>Natação</SelectItem>
              <SelectItem value={ExerciseType.STRENGTH}>Musculação</SelectItem>
              <SelectItem value={ExerciseType.HIIT}>HIIT</SelectItem>
              <SelectItem value={ExerciseType.YOGA}>Yoga</SelectItem>
              <SelectItem value={ExerciseType.OTHER}>Outra</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Atividades Secundárias</Label>
          <div className="grid grid-cols-2 gap-4">
            {Object.values(ExerciseType).map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox 
                  id={`secondary-${type}`}
                  checked={formData.secondarySports.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({
                        ...formData,
                        secondarySports: [...formData.secondarySports, type]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        secondarySports: formData.secondarySports.filter(t => t !== type)
                      });
                    }
                  }}
                />
                <Label 
                  htmlFor={`secondary-${type}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {getExerciseTypeLabel(type)}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="experienceYears">Anos de Experiência</Label>
          <div className="flex items-center space-x-4">
            <Slider
              id="experienceYears"
              min={0}
              max={20}
              step={1}
              value={[formData.experienceYears]}
              onValueChange={(value) => setFormData({ ...formData, experienceYears: value[0] })}
              className="flex-1"
            />
            <span className="w-12 text-center">{formData.experienceYears}</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Renderizar seção de métricas de saúde
  else if (section === 'metricas') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="height">Altura (cm)</Label>
            <Input
              id="height"
              type="number"
              min={100}
              max={250}
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              min={30}
              max={250}
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="restingHeartRate">Frequência Cardíaca em Repouso (bpm)</Label>
            <Input
              id="restingHeartRate"
              type="number"
              min={40}
              max={120}
              value={formData.restingHeartRate}
              onChange={(e) => setFormData({ ...formData, restingHeartRate: Number(e.target.value) })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxHeartRate">Frequência Cardíaca Máxima (bpm)</Label>
            <Input
              id="maxHeartRate"
              type="number"
              min={120}
              max={220}
              value={formData.maxHeartRate}
              onChange={(e) => setFormData({ ...formData, maxHeartRate: Number(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              Padrão: 220 - sua idade
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="limitations">Limitações ou Condições Físicas</Label>
          <Textarea
            id="limitations"
            placeholder="Por exemplo: lesão no joelho, asma, etc. Deixe em branco se não tiver."
            className="h-20"
          />
        </div>
      </div>
    );
  }
  
  // Renderizar seção de objetivos
  else if (section === 'objetivos') {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Objetivos Principais</Label>
          <div className="grid grid-cols-2 gap-4">
            {Object.values(FitnessGoal).map((goal) => (
              <div key={goal} className="flex items-center space-x-2">
                <Checkbox 
                  id={`goal-${goal}`}
                  checked={formData.goals.includes(goal)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({
                        ...formData,
                        goals: [...formData.goals, goal]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        goals: formData.goals.filter(g => g !== goal)
                      });
                    }
                  }}
                />
                <Label 
                  htmlFor={`goal-${goal}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {getFitnessGoalLabel(goal)}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="specificGoals">Objetivos Específicos</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="goal-5k" />
              <Label htmlFor="goal-5k" className="text-sm font-normal cursor-pointer">
                Completar 5km
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="goal-10k" />
              <Label htmlFor="goal-10k" className="text-sm font-normal cursor-pointer">
                Completar 10km
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="goal-half" />
              <Label htmlFor="goal-half" className="text-sm font-normal cursor-pointer">
                Meia maratona
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="goal-marathon" />
              <Label htmlFor="goal-marathon" className="text-sm font-normal cursor-pointer">
                Maratona
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="goal-triathlon" />
              <Label htmlFor="goal-triathlon" className="text-sm font-normal cursor-pointer">
                Triatlo
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="goal-weightloss" />
              <Label htmlFor="goal-weightloss" className="text-sm font-normal cursor-pointer">
                Perder 5kg
              </Label>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customGoal">Objetivo Personalizado</Label>
          <Textarea
            id="customGoal"
            placeholder="Descreva um objetivo específico não listado acima"
            className="h-20"
            value={formData.customGoal}
            onChange={(e) => setFormData({ ...formData, customGoal: e.target.value })}
          />
        </div>
      </div>
    );
  }
  
  // Renderizar seção de preferências
  else if (section === 'preferencias') {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Exercícios Preferidos</Label>
          <div className="grid grid-cols-2 gap-4">
            {Object.values(ExerciseType).map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox 
                  id={`pref-${type}`}
                  checked={formData.preferredExercises.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({
                        ...formData,
                        preferredExercises: [...formData.preferredExercises, type]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        preferredExercises: formData.preferredExercises.filter(t => t !== type)
                      });
                    }
                  }}
                />
                <Label 
                  htmlFor={`pref-${type}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {getExerciseTypeLabel(type)}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Horário Preferido</Label>
          <RadioGroup
            value={formData.preferredDayTime}
            onValueChange={(value) => setFormData({ ...formData, preferredDayTime: value })}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="morning" id="time-morning" />
                <Label htmlFor="time-morning" className="text-sm font-normal cursor-pointer">
                  Manhã
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="afternoon" id="time-afternoon" />
                <Label htmlFor="time-afternoon" className="text-sm font-normal cursor-pointer">
                  Tarde
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="evening" id="time-evening" />
                <Label htmlFor="time-evening" className="text-sm font-normal cursor-pointer">
                  Noite
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="any" id="time-any" />
                <Label htmlFor="time-any" className="text-sm font-normal cursor-pointer">
                  Qualquer horário
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="preferredDuration">Duração Preferida (minutos)</Label>
          <div className="flex items-center space-x-4">
            <Slider
              id="preferredDuration"
              min={10}
              max={120}
              step={5}
              value={[formData.preferredDuration]}
              onValueChange={(value) => setFormData({ ...formData, preferredDuration: value[0] })}
              className="flex-1"
            />
            <span className="w-12 text-center">{formData.preferredDuration}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="preferredFrequency">Frequência Semanal (dias)</Label>
          <div className="flex items-center space-x-4">
            <Slider
              id="preferredFrequency"
              min={1}
              max={7}
              step={1}
              value={[formData.preferredFrequency]}
              onValueChange={(value) => setFormData({ ...formData, preferredFrequency: value[0] })}
              className="flex-1"
            />
            <span className="w-12 text-center">{formData.preferredFrequency}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="outdoorPreference">Preferência Indoor/Outdoor</Label>
          <div className="space-y-4">
            <Slider
              id="outdoorPreference"
              min={0}
              max={1}
              step={0.1}
              value={[formData.outdoorPreference]}
              onValueChange={(value) => setFormData({ ...formData, outdoorPreference: value[0] })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Apenas Indoor</span>
              <span>Equilibrado</span>
              <span>Apenas Outdoor</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}

// Funções auxiliares para labels
function getExerciseTypeLabel(type: ExerciseType): string {
  const labels: Record<ExerciseType, string> = {
    [ExerciseType.RUNNING]: 'Corrida',
    [ExerciseType.CYCLING]: 'Ciclismo',
    [ExerciseType.WALKING]: 'Caminhada',
    [ExerciseType.SWIMMING]: 'Natação',
    [ExerciseType.STRENGTH]: 'Musculação',
    [ExerciseType.HIIT]: 'HIIT',
    [ExerciseType.YOGA]: 'Yoga',
    [ExerciseType.OTHER]: 'Outra'
  };
  return labels[type];
}

function getFitnessGoalLabel(goal: FitnessGoal): string {
  const labels: Record<FitnessGoal, string> = {
    [FitnessGoal.WEIGHT_LOSS]: 'Perda de peso',
    [FitnessGoal.ENDURANCE]: 'Resistência',
    [FitnessGoal.STRENGTH]: 'Força',
    [FitnessGoal.SPEED]: 'Velocidade',
    [FitnessGoal.GENERAL_FITNESS]: 'Condicionamento geral',
    [FitnessGoal.COMPETITION]: 'Competição',
    [FitnessGoal.HEALTH]: 'Saúde'
  };
  return labels[goal];
} 