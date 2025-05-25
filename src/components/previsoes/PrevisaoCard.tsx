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
  TrendingUp, 
  TrendingDown, 
  BarChart, 
  Calendar, 
  Clock, 
  Target, 
  Award,
  Zap,
  Footprints,
  Bike,
  ArrowRight,
  Info,
  ChevronUp,
  ChevronDown,
  Minus
} from 'lucide-react';

// Tipos de previsões
export type PrevisaoTipo = 
  | 'tempo' 
  | 'distancia' 
  | 'ritmo' 
  | 'calorias' 
  | 'frequencia_cardiaca'
  | 'vo2max'
  | 'recuperacao';

export type PrevisaoCategoria = 
  | 'corrida' 
  | 'ciclismo' 
  | 'caminhada' 
  | 'natacao' 
  | 'geral';

export type PrevisaoTendencia = 'aumento' | 'diminuicao' | 'estavel';

export interface Previsao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: PrevisaoTipo;
  categoria: PrevisaoCategoria;
  tendencia: PrevisaoTendencia;
  valorAtual?: number;
  valorPrevisto?: number;
  unidade?: string;
  confianca: number; // 0-100
  dataGeracao: Date;
  dataPrevisao: Date;
  baseadoEm?: string;
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

interface PrevisaoCardProps {
  previsao: Previsao;
  onAcaoPrimaria?: (id: string) => void;
  onAcaoSecundaria?: (id: string) => void;
  onDetalhes: (id: string) => void;
  compact?: boolean;
}

export const PrevisaoCard: React.FC<PrevisaoCardProps> = ({
  previsao,
  onAcaoPrimaria,
  onAcaoSecundaria,
  onDetalhes,
  compact = false
}) => {
  // Renderizar ícone de tipo
  const renderIconeTipo = (tipo: PrevisaoTipo) => {
    switch (tipo) {
      case 'tempo':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'distancia':
        return <Footprints className="h-5 w-5 text-green-500" />;
      case 'ritmo':
        return <Zap className="h-5 w-5 text-orange-500" />;
      case 'calorias':
        return <Zap className="h-5 w-5 text-red-500" />;
      case 'frequencia_cardiaca':
        return <Zap className="h-5 w-5 text-pink-500" />;
      case 'vo2max':
        return <BarChart className="h-5 w-5 text-purple-500" />;
      case 'recuperacao':
        return <Clock className="h-5 w-5 text-indigo-500" />;
      default:
        return <BarChart className="h-5 w-5 text-gray-500" />;
    }
  };

  // Renderizar ícone de categoria
  const renderIconeCategoria = (categoria: PrevisaoCategoria) => {
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

  // Renderizar ícone de tendência
  const renderIconeTendencia = (tendencia: PrevisaoTendencia) => {
    switch (tendencia) {
      case 'aumento':
        return <ChevronUp className="h-5 w-5 text-green-500" />;
      case 'diminuicao':
        return <ChevronDown className="h-5 w-5 text-red-500" />;
      case 'estavel':
        return <Minus className="h-5 w-5 text-gray-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  // Calcular variação percentual
  const calcularVariacaoPercentual = () => {
    if (previsao.valorAtual === undefined || previsao.valorPrevisto === undefined) {
      return null;
    }
    
    const variacao = ((previsao.valorPrevisto - previsao.valorAtual) / previsao.valorAtual) * 100;
    return variacao.toFixed(1);
  };

  // Determinar cor da variação
  const corVariacao = () => {
    const variacao = calcularVariacaoPercentual();
    if (variacao === null) return 'text-gray-500';
    
    const valor = parseFloat(variacao);
    
    // Para alguns tipos, diminuição é positiva (ex: tempo, ritmo)
    const tiposInvertidos = ['tempo', 'ritmo', 'frequencia_cardiaca'];
    const invertido = tiposInvertidos.includes(previsao.tipo);
    
    if (invertido) {
      return valor < 0 ? 'text-green-500' : valor > 0 ? 'text-red-500' : 'text-gray-500';
    } else {
      return valor > 0 ? 'text-green-500' : valor < 0 ? 'text-red-500' : 'text-gray-500';
    }
  };

  return (
    <Card className={compact ? 'overflow-hidden' : ''}>
      <CardHeader className={compact ? 'p-3 pb-2' : 'pb-2'}>
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            {renderIconeTipo(previsao.tipo)}
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Previsão
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {renderIconeCategoria(previsao.categoria)}
          </div>
        </div>
        <CardTitle className={compact ? 'text-base mt-1' : 'text-lg mt-2'}>
          {previsao.titulo}
        </CardTitle>
        {!compact && (
          <CardDescription className="line-clamp-2">
            {previsao.descricao}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className={compact ? 'p-3 pt-0 pb-2' : 'pb-2'}>
        <div className="space-y-3">
          {previsao.valorAtual !== undefined && previsao.valorPrevisto !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Atual:</span>
                <span className="font-medium">
                  {previsao.valorAtual} {previsao.unidade}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {renderIconeTendencia(previsao.tendencia)}
                <span className={`font-medium ${corVariacao()}`}>
                  {calcularVariacaoPercentual()}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Previsto:</span>
                <span className="font-medium">
                  {previsao.valorPrevisto} {previsao.unidade}
                </span>
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Confiança da previsão</span>
              <span>{previsao.confianca}%</span>
            </div>
            <Progress value={previsao.confianca} className="h-2" />
          </div>
          
          {!compact && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Previsão para: {new Date(previsao.dataPrevisao).toLocaleDateString()}</span>
            </div>
          )}
          
          {!compact && previsao.baseadoEm && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              <span>Baseado em: {previsao.baseadoEm}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      {!compact && (
        <CardFooter className="pt-2">
          <div className="w-full flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onDetalhes(previsao.id)}
            >
              <Info className="h-4 w-4 mr-2" />
              Detalhes
            </Button>
            
            {previsao.acoes?.primaria && (
              <Button 
                className="flex-1 gap-1"
                onClick={() => onAcaoPrimaria && onAcaoPrimaria(previsao.id)}
              >
                <ArrowRight className="h-4 w-4" />
                <span>{previsao.acoes.primaria.texto}</span>
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
