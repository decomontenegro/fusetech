import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AtividadeCard } from '../../components/actividades/AtividadeCard';
import { ActivityStatus, ActivityType } from '@fuseapp/types';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('AtividadeCard', () => {
  // Mock das funções de callback
  const mockOnVerMais = vi.fn();
  const mockOnContinuar = vi.fn();
  const mockOnInscrever = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render physical activity card correctly', () => {
    // Criar uma atividade física de teste
    const physicalActivity = {
      id: 'activity-1',
      userId: 'user-1',
      type: ActivityType.RUN,
      distance: 5000, // 5km
      duration: 1800, // 30 minutos
      points: 50,
      status: ActivityStatus.VERIFIED,
      tokenized: true,
      source: 'strava',
      stravaId: '12345',
      createdAt: new Date('2023-01-15T10:00:00Z')
    };
    
    render(
      <AtividadeCard
        atividade={physicalActivity}
        onVerMais={mockOnVerMais}
      />
    );
    
    // Verificar se os elementos principais são renderizados
    expect(screen.getByText('Corrida')).toBeInTheDocument();
    expect(screen.getByText('5 km')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('50 pontos')).toBeInTheDocument();
    expect(screen.getByText('Verificada')).toBeInTheDocument();
    
    // Verificar se o botão "Ver mais" está presente
    const verMaisButton = screen.getByRole('button', { name: /ver detalhes/i });
    expect(verMaisButton).toBeInTheDocument();
    
    // Clicar no botão e verificar se a função de callback é chamada
    fireEvent.click(verMaisButton);
    expect(mockOnVerMais).toHaveBeenCalledWith('activity-1');
  });

  it('should render social activity card correctly', () => {
    // Criar uma atividade social de teste
    const socialActivity = {
      id: 'social-1',
      userId: 'user-1',
      type: ActivityType.SOCIAL_POST,
      platform: 'instagram',
      postId: 'post123',
      postUrl: 'https://instagram.com/p/123456',
      engagement: 124,
      points: 20,
      status: ActivityStatus.PENDING,
      tokenized: false,
      verified: false,
      createdAt: new Date('2023-01-20T14:30:00Z')
    };
    
    render(
      <AtividadeCard
        atividade={socialActivity}
        onVerMais={mockOnVerMais}
      />
    );
    
    // Verificar se os elementos principais são renderizados
    expect(screen.getByText('Post no Instagram')).toBeInTheDocument();
    expect(screen.getByText('124 interações')).toBeInTheDocument();
    expect(screen.getByText('20 pontos')).toBeInTheDocument();
    expect(screen.getByText('Pendente')).toBeInTheDocument();
    
    // Verificar se o botão "Ver mais" está presente
    const verMaisButton = screen.getByRole('button', { name: /ver detalhes/i });
    expect(verMaisButton).toBeInTheDocument();
    
    // Clicar no botão e verificar se a função de callback é chamada
    fireEvent.click(verMaisButton);
    expect(mockOnVerMais).toHaveBeenCalledWith('social-1');
  });

  it('should show "Continuar" button for active challenges', () => {
    // Criar uma atividade física em andamento
    const activeActivity = {
      id: 'activity-2',
      userId: 'user-1',
      type: ActivityType.RUN,
      distance: 2500, // 2.5km
      duration: 900, // 15 minutos
      points: 0, // Ainda não pontuada
      status: ActivityStatus.PENDING,
      tokenized: false,
      source: 'manual',
      createdAt: new Date('2023-01-25T08:00:00Z')
    };
    
    render(
      <AtividadeCard
        atividade={activeActivity}
        onVerMais={mockOnVerMais}
        onContinuar={mockOnContinuar}
      />
    );
    
    // Verificar se o botão "Continuar" está presente
    const continuarButton = screen.getByRole('button', { name: /continuar/i });
    expect(continuarButton).toBeInTheDocument();
    
    // Clicar no botão e verificar se a função de callback é chamada
    fireEvent.click(continuarButton);
    expect(mockOnContinuar).toHaveBeenCalledWith('activity-2');
  });

  it('should show "Inscrever" button for upcoming challenges', () => {
    // Criar uma atividade futura
    const upcomingActivity = {
      id: 'challenge-1',
      userId: 'user-1',
      type: ActivityType.CHALLENGE,
      title: 'Desafio de Corrida',
      description: 'Corra 10km em uma semana',
      status: ActivityStatus.UPCOMING,
      startDate: new Date(Date.now() + 86400000), // Amanhã
      endDate: new Date(Date.now() + 604800000), // Daqui a 7 dias
      createdAt: new Date()
    };
    
    render(
      <AtividadeCard
        atividade={upcomingActivity}
        onVerMais={mockOnVerMais}
        onInscrever={mockOnInscrever}
      />
    );
    
    // Verificar se o botão "Inscrever" está presente
    const inscreverButton = screen.getByRole('button', { name: /inscrever/i });
    expect(inscreverButton).toBeInTheDocument();
    
    // Clicar no botão e verificar se a função de callback é chamada
    fireEvent.click(inscreverButton);
    expect(mockOnInscrever).toHaveBeenCalledWith('challenge-1');
  });

  it('should show tokenized badge for tokenized activities', () => {
    // Criar uma atividade tokenizada
    const tokenizedActivity = {
      id: 'activity-3',
      userId: 'user-1',
      type: ActivityType.CYCLE,
      distance: 20000, // 20km
      duration: 3600, // 1 hora
      points: 60,
      status: ActivityStatus.VERIFIED,
      tokenized: true,
      source: 'strava',
      stravaId: '67890',
      createdAt: new Date('2023-01-10T16:00:00Z')
    };
    
    render(
      <AtividadeCard
        atividade={tokenizedActivity}
        onVerMais={mockOnVerMais}
      />
    );
    
    // Verificar se o badge de tokenizado está presente
    expect(screen.getByText('Tokenizado')).toBeInTheDocument();
  });
});
