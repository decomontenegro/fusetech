import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter,
  Button,
  Badge,
  Progress
} from '@fuseapp/ui';
import { 
  Trophy, 
  Award, 
  Star, 
  Zap, 
  Flame, 
  Medal,
  CheckCircle,
  Lock
} from 'lucide-react';

// Tipos de conquistas
export interface Conquista {
  id: string;
  title: string;
  description: string;
  category: 'distance' | 'activity' | 'social' | 'challenge' | 'streak';
  icon: 'trophy' | 'award' | 'star' | 'zap' | 'flame' | 'medal';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  progress?: number; // 0-100
  completed: boolean;
  completedAt?: Date;
  reward: {
    xp: number;
    tokens?: number;
  };
  secret?: boolean;
}

interface ConquistaCardProps {
  conquista: Conquista;
  onVerDetalhes: (id: string) => void;
  compact?: boolean;
}

export const ConquistaCard: React.FC<ConquistaCardProps> = ({
  conquista,
  onVerDetalhes,
  compact = false
}) => {
  // Renderizar ícone da conquista
  const renderIcon = (icon: string, level: string) => {
    const iconColor = level === 'bronze' ? 'text-amber-600' :
                     level === 'silver' ? 'text-slate-400' :
                     level === 'gold' ? 'text-yellow-500' :
                     'text-purple-600';
    
    switch(icon) {
      case 'trophy':
        return <Trophy className={`h-6 w-6 ${iconColor}`} />;
      case 'award':
        return <Award className={`h-6 w-6 ${iconColor}`} />;
      case 'star':
        return <Star className={`h-6 w-6 ${iconColor}`} />;
      case 'zap':
        return <Zap className={`h-6 w-6 ${iconColor}`} />;
      case 'flame':
        return <Flame className={`h-6 w-6 ${iconColor}`} />;
      case 'medal':
        return <Medal className={`h-6 w-6 ${iconColor}`} />;
      default:
        return <Award className={`h-6 w-6 ${iconColor}`} />;
    }
  };

  // Renderizar badge de nível
  const renderLevelBadge = (level: string) => {
    switch(level) {
      case 'bronze':
        return <Badge className="bg-amber-600">Bronze</Badge>;
      case 'silver':
        return <Badge className="bg-slate-400">Prata</Badge>;
      case 'gold':
        return <Badge className="bg-yellow-500">Ouro</Badge>;
      case 'platinum':
        return <Badge className="bg-purple-600">Platina</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        compact ? 'border-l-4' : ''
      } ${
        conquista.completed 
          ? 'border-green-200' + (compact ? ' border-l-green-500' : '') 
          : compact ? 'border-l-primary' : ''
      }`}
      onClick={() => onVerDetalhes(conquista.id)}
    >
      <CardHeader className={compact ? 'p-3 pb-2' : 'pb-2'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              {renderIcon(conquista.icon, conquista.level)}
            </div>
            <div>
              <CardTitle className={compact ? 'text-base' : 'text-lg'}>
                {conquista.title}
              </CardTitle>
              {!compact && (
                <CardDescription>
                  {conquista.level.charAt(0).toUpperCase() + conquista.level.slice(1)}
                </CardDescription>
              )}
            </div>
          </div>
          
          {conquista.completed && (
            <Badge variant="success" className="ml-auto">
              <CheckCircle className="h-3 w-3 mr-1" />
              Concluída
            </Badge>
          )}
          
          {conquista.secret && !conquista.completed && (
            <Badge variant="outline" className="ml-auto">
              <Lock className="h-3 w-3 mr-1" />
              Secreta
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={compact ? 'p-3 pt-0' : ''}>
        <div className="space-y-3">
          {!compact && (
            <p className="text-sm text-muted-foreground">
              {conquista.secret && !conquista.completed 
                ? 'Complete esta conquista para revelar seus detalhes.' 
                : conquista.description}
            </p>
          )}
          
          {!conquista.completed && conquista.progress !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progresso:</span>
                <span>{conquista.progress}%</span>
              </div>
              <Progress value={conquista.progress} />
            </div>
          )}
          
          {!compact && (
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-2 py-1">
                  {conquista.reward.xp} XP
                </Badge>
                {conquista.reward.tokens && (
                  <Badge variant="outline" className="px-2 py-1">
                    {conquista.reward.tokens} FUSE
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      {!compact && (
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onVerDetalhes(conquista.id);
            }}
          >
            Ver Detalhes
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
