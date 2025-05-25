import React from 'react';
import Image from 'next/image';
import { formatDistance, formatDuration, formatDate } from '@fuseapp/utils';
import { PhysicalActivity, SocialActivity, ActivityType } from '@fuseapp/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Badge } from '@fuseapp/ui';

type AtividadeCardProps = {
  atividade: PhysicalActivity | SocialActivity;
  onVerMais?: () => void;
};

export function AtividadeCard({ atividade, onVerMais }: AtividadeCardProps) {
  const isPhysical = 'distance' in atividade;
  
  // Determinar ícone com base no tipo
  const getIconSrc = () => {
    if (isPhysical) {
      switch (atividade.type) {
        case ActivityType.RUN:
          return '/icons/run.svg';
        case ActivityType.WALK:
          return '/icons/walk.svg';
        case ActivityType.CYCLE:
          return '/icons/cycle.svg';
        default:
          return '/icons/activity.svg';
      }
    } else {
      // Atividade social
      const social = atividade as SocialActivity;
      return social.platform === 'instagram' 
        ? '/icons/instagram.svg' 
        : '/icons/tiktok.svg';
    }
  };
  
  // Determinar título com base no tipo
  const getTitle = () => {
    if (isPhysical) {
      const physical = atividade as PhysicalActivity;
      switch (physical.type) {
        case ActivityType.RUN:
          return 'Corrida';
        case ActivityType.WALK:
          return 'Caminhada';
        case ActivityType.CYCLE:
          return 'Ciclismo';
        default:
          return 'Atividade Física';
      }
    } else {
      const social = atividade as SocialActivity;
      return social.platform === 'instagram' 
        ? 'Post Instagram' 
        : 'Post TikTok';
    }
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 relative">
            <Image
              src={getIconSrc()}
              alt={getTitle()}
              fill
              className="object-contain"
            />
          </div>
          <CardTitle className="text-lg">{getTitle()}</CardTitle>
          
          {atividade.tokenized && (
            <Badge variant="success" className="ml-auto">
              Tokenizado
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            {formatDate(atividade.createdAt)}
          </div>
          
          {isPhysical ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Distância</span>
                <span className="font-medium">
                  {formatDistance((atividade as PhysicalActivity).distance)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Duração</span>
                <span className="font-medium">
                  {formatDuration((atividade as PhysicalActivity).duration)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Engajamento</span>
              <span className="font-medium">
                {(atividade as SocialActivity).engagement} interações
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">Pontos:</span>
              <span className="font-semibold text-primary">{atividade.points}</span>
            </div>
            
            <Badge variant={atividade.status === 'verified' ? 'success' : 
                           atividade.status === 'rejected' ? 'destructive' : 
                           atividade.status === 'flagged' ? 'default' : 'secondary'}>
              {atividade.status === 'verified' ? 'Verificado' :
               atividade.status === 'rejected' ? 'Rejeitado' :
               atividade.status === 'flagged' ? 'Sinalizado' : 'Pendente'}
            </Badge>
          </div>
        </div>
      </CardContent>
      
      {onVerMais && (
        <CardFooter className="pt-2 pb-4">
          <button 
            onClick={onVerMais}
            className="text-primary text-sm font-medium hover:underline ml-auto"
          >
            Ver detalhes
          </button>
        </CardFooter>
      )}
    </Card>
  );
} 