import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Badge,
  Button,
  Progress
} from '@fuseapp/ui';
import { Award, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { ChallengeStatus, ActivityType } from '@fuseapp/types';

// Tipo para os desafios
export interface Desafio {
  id: string;
  title: string;
  description: string;
  type: 'distance' | 'count' | 'duration';
  targetValue: number;
  status: ChallengeStatus;
  startDate: Date;
  endDate: Date;
  progress?: number; // Progresso atual (0-100)
  categories: ActivityType[];
  participants: number;
  reward: {
    points: number;
    tokens: number;
  };
}

interface DesafioCardProps {
  desafio: Desafio;
  onContinuar?: (id: string) => void;
  onInscrever?: (id: string) => void;
  onVerDetalhes?: (id: string) => void;
}

export function DesafioCard({ desafio, onContinuar, onInscrever, onVerDetalhes }: DesafioCardProps) {
  // Função para calcular dias restantes
  const getDiasRestantes = (endDate: Date) => {
    const diff = endDate.getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };
  
  // Renderizar ícone com base nas categorias do desafio
  const renderCategoriasIcons = (categorias: ActivityType[]) => {
    return (
      <div className="flex flex-wrap gap-1">
        {categorias.map((categoria, index) => {
          switch(categoria) {
            case ActivityType.RUN:
              return <Badge key={index} variant="outline" className="px-2 py-1">Corrida</Badge>;
            case ActivityType.WALK:
              return <Badge key={index} variant="outline" className="px-2 py-1">Caminhada</Badge>;
            case ActivityType.CYCLE:
              return <Badge key={index} variant="outline" className="px-2 py-1">Ciclismo</Badge>;
            case ActivityType.SOCIAL_POST:
              return <Badge key={index} variant="outline" className="px-2 py-1">Social</Badge>;
            default:
              return <Badge key={index} variant="outline" className="px-2 py-1">Outros</Badge>;
          }
        })}
      </div>
    );
  };
  
  const diasRestantes = getDiasRestantes(desafio.endDate);
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="mr-4 p-2 bg-primary/10 rounded-full">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">{desafio.title}</CardTitle>
          </div>
          
          {desafio.status === ChallengeStatus.ACTIVE && (
            <Badge variant="default">
              <Clock className="h-3 w-3 mr-1" />
              {diasRestantes} dias
            </Badge>
          )}
          
          {desafio.status === ChallengeStatus.COMPLETED && (
            <Badge variant="success">
              <CheckCircle className="h-3 w-3 mr-1" />
              Concluído
            </Badge>
          )}
          
          {desafio.status === ChallengeStatus.UPCOMING && (
            <Badge variant="secondary">Em breve</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{desafio.description}</p>
        
        <div className="flex flex-wrap gap-3 items-center">
          {renderCategoriasIcons(desafio.categories)}
          
          <div className="flex items-center ml-auto">
            <TrendingUp className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm font-medium">{desafio.participants} participantes</span>
          </div>
        </div>
        
        {desafio.status === ChallengeStatus.ACTIVE && desafio.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso:</span>
              <span>{desafio.progress}%</span>
            </div>
            <Progress value={desafio.progress} />
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Recompensas:</p>
            <div className="flex space-x-2">
              <Badge variant="outline" className="px-2 py-1">
                {desafio.reward.points} pontos
              </Badge>
              <Badge variant="outline" className="px-2 py-1">
                {desafio.reward.tokens} FUSE
              </Badge>
            </div>
          </div>
          
          {desafio.status === ChallengeStatus.ACTIVE && onContinuar && (
            <Button size="sm" onClick={() => onContinuar(desafio.id)}>
              Continuar
            </Button>
          )}
          
          {desafio.status === ChallengeStatus.UPCOMING && onInscrever && (
            <Button size="sm" variant="outline" onClick={() => onInscrever(desafio.id)}>
              Inscrever-se
            </Button>
          )}
          
          {desafio.status === ChallengeStatus.COMPLETED && onVerDetalhes && (
            <Button size="sm" variant="outline" onClick={() => onVerDetalhes(desafio.id)}>
              Detalhes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 