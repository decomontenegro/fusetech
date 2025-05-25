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
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  Flame,
  Zap,
  Target,
  ArrowRight,
  Footprints,
  Heart,
  Dumbbell,
  Repeat,
  Info
} from 'lucide-react';

// Tipos de missões
export type MissaoTipo =
  | 'distancia'
  | 'tempo'
  | 'calorias'
  | 'passos'
  | 'frequencia'
  | 'social';

export type MissaoDificuldade = 'facil' | 'media' | 'dificil';

export type MissaoStatus = 'ativa' | 'concluida' | 'expirada';

export interface Missao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: MissaoTipo;
  dificuldade: MissaoDificuldade;
  meta: number;
  unidade: string;
  progresso?: number;
  status: MissaoStatus;
  dataExpiracao: Date;
  recompensa: {
    tokens: number;
    xp: number;
  };
}

interface MissaoCardProps {
  missao: Missao;
  onConcluir?: (id: string) => void;
  onDetalhes: (id: string) => void;
  compact?: boolean;
}

export const MissaoCard: React.FC<MissaoCardProps> = ({
  missao,
  onConcluir,
  onDetalhes,
  compact = false
}) => {
  // Calcular porcentagem de progresso
  const calcularPorcentagem = () => {
    if (missao.progresso === undefined) return 0;
    return Math.min(100, Math.round((missao.progresso / missao.meta) * 100));
  };

  // Renderizar ícone de tipo
  const renderIconeTipo = (tipo: MissaoTipo) => {
    switch (tipo) {
      case 'distancia':
        return <Footprints className="h-5 w-5 text-blue-500" />;
      case 'tempo':
        return <Clock className="h-5 w-5 text-green-500" />;
      case 'calorias':
        return <Flame className="h-5 w-5 text-orange-500" />;
      case 'passos':
        return <Footprints className="h-5 w-5 text-purple-500" />;
      case 'frequencia':
        return <Repeat className="h-5 w-5 text-indigo-500" />;
      case 'social':
        return <Heart className="h-5 w-5 text-red-500" />;
      default:
        return <Target className="h-5 w-5 text-gray-500" />;
    }
  };

  // Renderizar badge de dificuldade
  const renderBadgeDificuldade = (dificuldade: MissaoDificuldade) => {
    switch (dificuldade) {
      case 'facil':
        return <Badge className="bg-green-500">Fácil</Badge>;
      case 'media':
        return <Badge className="bg-orange-500">Média</Badge>;
      case 'dificil':
        return <Badge className="bg-red-500">Difícil</Badge>;
      default:
        return <Badge>Desconhecida</Badge>;
    }
  };

  // Renderizar badge de status
  const renderBadgeStatus = (status: MissaoStatus) => {
    switch (status) {
      case 'ativa':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Ativa</Badge>;
      case 'concluida':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Concluída</Badge>;
      case 'expirada':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Expirada</Badge>;
      default:
        return <Badge variant="outline">Desconhecida</Badge>;
    }
  };

  // Verificar se a missão está pronta para ser concluída
  const prontaParaConcluir = () => {
    return missao.status === 'ativa' && missao.progresso !== undefined && missao.progresso >= missao.meta;
  };

  // Calcular tempo restante
  const calcularTempoRestante = () => {
    const agora = new Date();
    const expiracao = new Date(missao.dataExpiracao);

    if (agora > expiracao) return 'Expirada';

    const diff = expiracao.getTime() - agora.getTime();
    const horas = Math.floor(diff / (1000 * 60 * 60));

    if (horas < 24) {
      return `${horas}h restantes`;
    } else {
      const dias = Math.floor(horas / 24);
      return `${dias} dia${dias > 1 ? 's' : ''} restantes`;
    }
  };

  return (
    <Card className={`${
      missao.status === 'concluida' ? 'border-green-200' :
      missao.status === 'expirada' ? 'border-red-200' :
      prontaParaConcluir() ? 'border-yellow-200' : ''
    } ${compact ? 'overflow-hidden' : ''}`}>
      <CardHeader className={compact ? 'p-3 pb-2' : 'pb-2'}>
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            {renderIconeTipo(missao.tipo)}
            {renderBadgeDificuldade(missao.dificuldade)}
          </div>
          {renderBadgeStatus(missao.status)}
        </div>
        <CardTitle className={compact ? 'text-base mt-1' : 'text-lg mt-2'}>
          {missao.titulo}
        </CardTitle>
        {!compact && (
          <CardDescription className="line-clamp-2">
            {missao.descricao}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className={compact ? 'p-3 pt-0 pb-2' : 'pb-2'}>
        <div className="space-y-3">
          {missao.status === 'ativa' && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {calcularTempoRestante()}
              </span>
              {prontaParaConcluir() && (
                <Badge className="bg-yellow-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Pronta para concluir
                </Badge>
              )}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Meta: {missao.meta} {missao.unidade}</span>
              {missao.progresso !== undefined && (
                <span>
                  {missao.progresso} / {missao.meta} {missao.unidade}
                </span>
              )}
            </div>
            {missao.progresso !== undefined && (
              <Progress value={calcularPorcentagem()} className="h-2" />
            )}
          </div>

          {!compact && (
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-primary" />
                <span>{missao.recompensa.tokens} FUSE</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span>{missao.recompensa.xp} XP</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {!compact && (
        <CardFooter className="pt-2">
          {missao.status === 'ativa' ? (
            prontaParaConcluir() ? (
              <Button
                className="w-full gap-1"
                onClick={() => onConcluir && onConcluir(missao.id)}
              >
                <CheckCircle className="h-4 w-4" />
                <span>Concluir Missão</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full gap-1"
                onClick={() => onDetalhes(missao.id)}
              >
                <Target className="h-4 w-4" />
                <span>Ver Detalhes</span>
              </Button>
            )
          ) : (
            <Button
              variant="outline"
              className="w-full gap-1"
              onClick={() => onDetalhes(missao.id)}
            >
              <Info className="h-4 w-4" />
              <span>Ver Detalhes</span>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};
