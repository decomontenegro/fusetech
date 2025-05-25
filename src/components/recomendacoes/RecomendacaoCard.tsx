import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter,
  Button,
  Badge
} from '@fuseapp/ui';
import { 
  Lightbulb, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Target, 
  Zap,
  BarChart,
  Heart,
  Footprints,
  Bike,
  ArrowRight,
  Info
} from 'lucide-react';

// Tipos de recomendações
export type RecomendacaoTipo = 
  | 'treino' 
  | 'descanso' 
  | 'nutricao' 
  | 'hidratacao' 
  | 'sono' 
  | 'equipamento'
  | 'tecnica'
  | 'desafio';

export type RecomendacaoCategoria = 
  | 'corrida' 
  | 'ciclismo' 
  | 'caminhada' 
  | 'natacao' 
  | 'geral';

export interface Recomendacao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: RecomendacaoTipo;
  categoria: RecomendacaoCategoria;
  prioridade: 'baixa' | 'media' | 'alta';
  baseadoEm?: string;
  dataGeracao: Date;
  acoes?: {
    primaria?: {
      texto: string;
      url: string;
    };
    secundaria?: {
      texto: string;
      url: string;
    };
  };
}

interface RecomendacaoCardProps {
  recomendacao: Recomendacao;
  onAcaoPrimaria?: (id: string) => void;
  onAcaoSecundaria?: (id: string) => void;
  onDetalhes: (id: string) => void;
  compact?: boolean;
}

export const RecomendacaoCard: React.FC<RecomendacaoCardProps> = ({
  recomendacao,
  onAcaoPrimaria,
  onAcaoSecundaria,
  onDetalhes,
  compact = false
}) => {
  // Renderizar ícone de tipo
  const renderIconeTipo = (tipo: RecomendacaoTipo) => {
    switch (tipo) {
      case 'treino':
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'descanso':
        return <Clock className="h-5 w-5 text-purple-500" />;
      case 'nutricao':
        return <Heart className="h-5 w-5 text-green-500" />;
      case 'hidratacao':
        return <Heart className="h-5 w-5 text-cyan-500" />;
      case 'sono':
        return <Clock className="h-5 w-5 text-indigo-500" />;
      case 'equipamento':
        return <Footprints className="h-5 w-5 text-orange-500" />;
      case 'tecnica':
        return <Target className="h-5 w-5 text-yellow-500" />;
      case 'desafio':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-gray-500" />;
    }
  };

  // Renderizar ícone de categoria
  const renderIconeCategoria = (categoria: RecomendacaoCategoria) => {
    switch (categoria) {
      case 'corrida':
        return <Footprints className="h-5 w-5 text-orange-500" />;
      case 'ciclismo':
        return <Bike className="h-5 w-5 text-blue-500" />;
      case 'caminhada':
        return <Footprints className="h-5 w-5 text-green-500" />;
      case 'natacao':
        return <Zap className="h-5 w-5 text-cyan-500" />;
      case 'geral':
        return <BarChart className="h-5 w-5 text-gray-500" />;
      default:
        return <BarChart className="h-5 w-5 text-gray-500" />;
    }
  };

  // Renderizar badge de prioridade
  const renderBadgePrioridade = (prioridade: string) => {
    switch (prioridade) {
      case 'baixa':
        return <Badge className="bg-green-500">Baixa</Badge>;
      case 'media':
        return <Badge className="bg-orange-500">Média</Badge>;
      case 'alta':
        return <Badge className="bg-red-500">Alta</Badge>;
      default:
        return <Badge>Desconhecida</Badge>;
    }
  };

  return (
    <Card className={compact ? 'overflow-hidden' : ''}>
      <CardHeader className={compact ? 'p-3 pb-2' : 'pb-2'}>
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            {renderIconeTipo(recomendacao.tipo)}
            {renderBadgePrioridade(recomendacao.prioridade)}
          </div>
          <div className="flex items-center gap-2">
            {renderIconeCategoria(recomendacao.categoria)}
          </div>
        </div>
        <CardTitle className={compact ? 'text-base mt-1' : 'text-lg mt-2'}>
          {recomendacao.titulo}
        </CardTitle>
        {!compact && (
          <CardDescription className="line-clamp-2">
            {recomendacao.descricao}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className={compact ? 'p-3 pt-0 pb-2' : 'pb-2'}>
        {compact ? (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {recomendacao.descricao}
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {recomendacao.descricao}
            </p>
            
            {recomendacao.baseadoEm && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                <span>Baseado em: {recomendacao.baseadoEm}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {!compact && (
        <CardFooter className="pt-2">
          <div className="w-full flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onDetalhes(recomendacao.id)}
            >
              <Info className="h-4 w-4 mr-2" />
              Detalhes
            </Button>
            
            {recomendacao.acoes?.primaria && (
              <Button 
                className="flex-1 gap-1"
                onClick={() => onAcaoPrimaria && onAcaoPrimaria(recomendacao.id)}
              >
                <ArrowRight className="h-4 w-4" />
                <span>{recomendacao.acoes.primaria.texto}</span>
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
