import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter,
  Button
} from '@fuseapp/ui';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart, 
  Activity, 
  Calendar, 
  Clock, 
  Zap, 
  Award, 
  Target, 
  ThumbsUp,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

// Tipos de insights
export type InsightType = 
  | 'improvement' 
  | 'decline' 
  | 'achievement' 
  | 'suggestion' 
  | 'warning' 
  | 'streak' 
  | 'milestone';

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: InsightType;
  date: Date;
  data?: {
    current?: number;
    previous?: number;
    unit?: string;
    percentage?: number;
    trend?: 'up' | 'down' | 'stable';
  };
  actionText?: string;
  actionLink?: string;
}

interface InsightCardProps {
  insight: Insight;
  onAction?: (id: string) => void;
  compact?: boolean;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onAction,
  compact = false
}) => {
  // Renderizar ícone do insight
  const renderIcon = (type: InsightType) => {
    switch(type) {
      case 'improvement':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'decline':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'achievement':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'suggestion':
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'streak':
        return <Zap className="h-5 w-5 text-purple-500" />;
      case 'milestone':
        return <Target className="h-5 w-5 text-primary" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  // Renderizar cor de fundo com base no tipo
  const getBackgroundColor = (type: InsightType) => {
    switch(type) {
      case 'improvement':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'decline':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'achievement':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'suggestion':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-900/20';
      case 'streak':
        return 'bg-purple-50 dark:bg-purple-900/20';
      case 'milestone':
        return 'bg-primary/10';
      default:
        return 'bg-gray-50 dark:bg-gray-800';
    }
  };

  // Renderizar dados adicionais
  const renderData = () => {
    if (!insight.data) return null;

    const { current, previous, unit, percentage, trend } = insight.data;

    if (trend && percentage !== undefined) {
      return (
        <div className="flex items-center gap-1 text-sm">
          {trend === 'up' ? (
            <TrendingUp className={`h-4 w-4 ${percentage > 0 ? 'text-green-500' : 'text-red-500'}`} />
          ) : trend === 'down' ? (
            <TrendingDown className={`h-4 w-4 ${percentage < 0 ? 'text-red-500' : 'text-green-500'}`} />
          ) : (
            <Activity className="h-4 w-4 text-gray-500" />
          )}
          <span className={percentage > 0 ? 'text-green-500' : percentage < 0 ? 'text-red-500' : 'text-gray-500'}>
            {percentage > 0 ? '+' : ''}{percentage}%
          </span>
        </div>
      );
    }

    if (current !== undefined && previous !== undefined) {
      return (
        <div className="text-sm">
          <span className="font-medium">{current}{unit}</span>
          <span className="text-muted-foreground"> vs {previous}{unit}</span>
        </div>
      );
    }

    if (current !== undefined) {
      return (
        <div className="text-sm font-medium">
          {current}{unit}
        </div>
      );
    }

    return null;
  };

  return (
    <Card className={`${getBackgroundColor(insight.type)} border-0 shadow-sm`}>
      <CardHeader className={compact ? 'p-3 pb-2' : 'pb-2'}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
            {renderIcon(insight.type)}
          </div>
          <CardTitle className={compact ? 'text-base' : 'text-lg'}>
            {insight.title}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className={compact ? 'p-3 pt-0' : ''}>
        <p className="text-sm text-muted-foreground mb-2">
          {insight.description}
        </p>
        
        {renderData()}
      </CardContent>
      
      {(insight.actionText && !compact) && (
        <CardFooter className={compact ? 'p-3 pt-0' : ''}>
          <Button 
            variant="outline" 
            size={compact ? 'sm' : 'default'}
            className="w-full"
            onClick={() => onAction && onAction(insight.id)}
          >
            {insight.actionText}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
