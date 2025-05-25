'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter,
  Button,
  Progress,
  Checkbox,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@fuseapp/ui';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  User, 
  Activity, 
  Dumbbell, 
  Heart, 
  Trophy, 
  Zap,
  Rocket
} from 'lucide-react';

// Tipos de atividades
const activityTypes = [
  { id: 'running', label: 'Corrida', icon: <Zap className="h-5 w-5" /> },
  { id: 'walking', label: 'Caminhada', icon: <Activity className="h-5 w-5" /> },
  { id: 'cycling', label: 'Ciclismo', icon: <Activity className="h-5 w-5" /> },
  { id: 'gym', label: 'Academia', icon: <Dumbbell className="h-5 w-5" /> },
  { id: 'swimming', label: 'Natação', icon: <Activity className="h-5 w-5" /> },
  { id: 'yoga', label: 'Yoga', icon: <Heart className="h-5 w-5" /> },
  { id: 'other', label: 'Outros', icon: <Activity className="h-5 w-5" /> }
];

// Níveis de experiência
const experienceLevels = [
  { id: 'beginner', label: 'Iniciante', description: 'Estou começando agora' },
  { id: 'intermediate', label: 'Intermediário', description: 'Pratico regularmente' },
  { id: 'advanced', label: 'Avançado', description: 'Pratico há anos' }
];

// Objetivos
const goals = [
  { id: 'health', label: 'Melhorar saúde', icon: <Heart className="h-5 w-5" /> },
  { id: 'weight', label: 'Perder peso', icon: <Activity className="h-5 w-5" /> },
  { id: 'performance', label: 'Melhorar performance', icon: <Zap className="h-5 w-5" /> },
  { id: 'competition', label: 'Competir', icon: <Trophy className="h-5 w-5" /> },
  { id: 'habit', label: 'Criar hábito', icon: <CheckCircle className="h-5 w-5" /> }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    gender: '',
    birthYear: '',
    preferredActivities: [] as string[],
    experienceLevel: '',
    goals: [] as string[],
    weeklyFrequency: '',
    stravaConnected: false,
    socialConnected: false
  });

  // Total de passos
  const totalSteps = 5;

  // Progresso atual
  const progress = (step / totalSteps) * 100;

  // Atualizar dados do formulário
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Alternar seleção de array (para checkboxes)
  const toggleArraySelection = (field: string, value: string) => {
    setFormData(prev => {
      const array = prev[field as keyof typeof prev] as string[];
      if (array.includes(value)) {
        return { ...prev, [field]: array.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...array, value] };
      }
    });
  };

  // Avançar para o próximo passo
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      // Enviar dados e finalizar
      finishOnboarding();
    }
  };

  // Voltar para o passo anterior
  const prevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Finalizar onboarding
  const finishOnboarding = async () => {
    try {
      // Em produção, enviar dados para API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirecionar para dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao finalizar onboarding:', error);
    }
  };

  // Verificar se o botão de próximo deve estar desabilitado
  const isNextDisabled = () => {
    switch (step) {
      case 1:
        return !formData.name || !formData.gender || !formData.birthYear;
      case 2:
        return formData.preferredActivities.length === 0;
      case 3:
        return !formData.experienceLevel || formData.goals.length === 0;
      case 4:
        return !formData.weeklyFrequency;
      default:
        return false;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Bem-vindo ao FuseLabs</h1>
            <p className="text-muted-foreground">
              Vamos configurar sua conta para uma experiência personalizada
            </p>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Passo {step} de {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && 'Informações Básicas'}
                {step === 2 && 'Atividades Preferidas'}
                {step === 3 && 'Experiência e Objetivos'}
                {step === 4 && 'Frequência de Atividades'}
                {step === 5 && 'Conectar Contas'}
              </CardTitle>
              <CardDescription>
                {step === 1 && 'Conte-nos um pouco sobre você'}
                {step === 2 && 'Quais atividades você pratica ou gostaria de praticar?'}
                {step === 3 && 'Qual seu nível de experiência e objetivos?'}
                {step === 4 && 'Com que frequência você pratica atividades físicas?'}
                {step === 5 && 'Conecte suas contas para sincronizar atividades'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* Passo 1: Informações Básicas */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <input
                      id="name"
                      type="text"
                      className="w-full p-2 border rounded-md mt-1"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div>
                    <Label>Gênero</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => updateFormData('gender', value)}
                      className="flex flex-col space-y-2 mt-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Feminino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Outro</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="prefer_not_to_say" id="prefer_not_to_say" />
                        <Label htmlFor="prefer_not_to_say">Prefiro não informar</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label htmlFor="birthYear">Ano de Nascimento</Label>
                    <Select
                      value={formData.birthYear}
                      onValueChange={(value) => updateFormData('birthYear', value)}
                    >
                      <SelectTrigger id="birthYear" className="w-full">
                        <SelectValue placeholder="Selecione o ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 16 - i).map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              {/* Passo 2: Atividades Preferidas */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Selecione todas as atividades que você pratica ou tem interesse:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {activityTypes.map(activity => (
                      <div
                        key={activity.id}
                        className={`
                          border rounded-md p-3 cursor-pointer transition-colors
                          ${formData.preferredActivities.includes(activity.id)
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-muted'}
                        `}
                        onClick={() => toggleArraySelection('preferredActivities', activity.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`
                            ${formData.preferredActivities.includes(activity.id)
                              ? 'text-primary'
                              : 'text-muted-foreground'}
                          `}>
                            {activity.icon}
                          </div>
                          <span>{activity.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Passo 3: Experiência e Objetivos */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label className="mb-2 block">Nível de Experiência</Label>
                    <RadioGroup
                      value={formData.experienceLevel}
                      onValueChange={(value) => updateFormData('experienceLevel', value)}
                      className="flex flex-col space-y-2"
                    >
                      {experienceLevels.map(level => (
                        <div
                          key={level.id}
                          className={`
                            border rounded-md p-3 cursor-pointer transition-colors
                            ${formData.experienceLevel === level.id
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-muted'}
                          `}
                          onClick={() => updateFormData('experienceLevel', level.id)}
                        >
                          <div className="flex items-center">
                            <RadioGroupItem
                              value={level.id}
                              id={level.id}
                              className="sr-only"
                            />
                            <div className="ml-2">
                              <Label htmlFor={level.id} className="font-medium">
                                {level.label}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {level.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Seus Objetivos</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Selecione todos os objetivos que se aplicam:
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {goals.map(goal => (
                        <div
                          key={goal.id}
                          className={`
                            border rounded-md p-3 cursor-pointer transition-colors
                            ${formData.goals.includes(goal.id)
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-muted'}
                          `}
                          onClick={() => toggleArraySelection('goals', goal.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`
                              ${formData.goals.includes(goal.id)
                                ? 'text-primary'
                                : 'text-muted-foreground'}
                            `}>
                              {goal.icon}
                            </div>
                            <span>{goal.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Passo 4: Frequência de Atividades */}
              {step === 4 && (
                <div className="space-y-4">
                  <Label className="mb-2 block">Com que frequência você pratica atividades físicas?</Label>
                  
                  <RadioGroup
                    value={formData.weeklyFrequency}
                    onValueChange={(value) => updateFormData('weeklyFrequency', value)}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rarely" id="rarely" />
                      <Label htmlFor="rarely">Raramente</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1-2" id="1-2" />
                      <Label htmlFor="1-2">1-2 vezes por semana</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3-4" id="3-4" />
                      <Label htmlFor="3-4">3-4 vezes por semana</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="5+" id="5+" />
                      <Label htmlFor="5+">5 ou mais vezes por semana</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
              
              {/* Passo 5: Conectar Contas */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#FC4C02] p-2 rounded-md">
                          <Activity className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">Conectar com Strava</h3>
                          <p className="text-sm text-muted-foreground">
                            Sincronize suas corridas, caminhadas e pedaladas
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant={formData.stravaConnected ? "outline" : "default"}
                        className={formData.stravaConnected ? "gap-2" : ""}
                        onClick={() => updateFormData('stravaConnected', !formData.stravaConnected)}
                      >
                        {formData.stravaConnected ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span>Conectado</span>
                          </>
                        ) : (
                          "Conectar"
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-md">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">Conectar Redes Sociais</h3>
                          <p className="text-sm text-muted-foreground">
                            Compartilhe suas conquistas e ganhe tokens extras
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant={formData.socialConnected ? "outline" : "default"}
                        className={formData.socialConnected ? "gap-2" : ""}
                        onClick={() => updateFormData('socialConnected', !formData.socialConnected)}
                      >
                        {formData.socialConnected ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span>Conectado</span>
                          </>
                        ) : (
                          "Conectar"
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Você pode conectar suas contas mais tarde nas configurações do perfil.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <Button
                onClick={nextStep}
                disabled={isNextDisabled()}
              >
                {step === totalSteps ? (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Começar
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
