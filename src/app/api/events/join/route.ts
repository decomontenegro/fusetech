import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { activeEvents } from '@/data/events';

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json();
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID é obrigatório' }, { status: 400 });
    }

    const cookieStore = cookies();
    const userCookie = cookieStore.get('fusetech_user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userData = JSON.parse(userCookie.value);

    // Verificar se o evento existe
    const event = activeEvents.find(e => e.id === eventId);
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 });
    }

    // Verificar se o evento está ativo
    const now = new Date();
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    if (now < eventStart) {
      return NextResponse.json({ error: 'Evento ainda não começou' }, { status: 400 });
    }
    
    if (now > eventEnd) {
      return NextResponse.json({ error: 'Evento já terminou' }, { status: 400 });
    }

    // Verificar se já está participando
    if (isUserParticipating(userData.id, eventId)) {
      return NextResponse.json({ error: 'Você já está participando deste evento' }, { status: 400 });
    }

    // Verificar limite de participantes
    if (event.maxParticipants && event.participants >= event.maxParticipants) {
      return NextResponse.json({ error: 'Evento lotado' }, { status: 400 });
    }

    // Registrar participação
    registerEventParticipation(userData.id, eventId);

    // Atualizar dados do usuário
    const updatedUserData = {
      ...userData,
      eventsParticipating: [...(userData.eventsParticipating || []), eventId],
      totalEventsJoined: (userData.totalEventsJoined || 0) + 1,
      lastEventJoined: {
        eventId,
        eventName: event.name,
        joinedAt: new Date().toISOString()
      }
    };

    // Dar tokens de bônus por participar
    const participationBonus = getParticipationBonus(event.type);
    updatedUserData.eventTokens = (userData.eventTokens || 0) + participationBonus;

    const response = NextResponse.json({
      success: true,
      message: `Você se inscreveu no evento "${event.name}"! +${participationBonus} tokens`,
      tokensEarned: participationBonus,
      event: {
        id: event.id,
        name: event.name,
        type: event.type,
        endDate: event.endDate
      }
    });

    // Atualizar cookie
    response.cookies.set('fusetech_user', JSON.stringify(updatedUserData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 dias
    });

    return response;

  } catch (error) {
    console.error('Erro ao participar do evento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Sistema de participação em eventos (simulado)
const eventParticipations = new Map<string, Set<string>>();

function isUserParticipating(userId: string, eventId: string): boolean {
  const participants = eventParticipations.get(eventId) || new Set();
  return participants.has(userId);
}

function registerEventParticipation(userId: string, eventId: string) {
  if (!eventParticipations.has(eventId)) {
    eventParticipations.set(eventId, new Set());
  }
  
  const participants = eventParticipations.get(eventId)!;
  participants.add(userId);
  
  console.log(`Usuário ${userId} se inscreveu no evento ${eventId}`);
}

function getParticipationBonus(eventType: string): number {
  const bonuses = {
    'challenge': 200,
    'campaign': 150,
    'tournament': 300,
    'special': 500,
    'seasonal': 400
  };
  
  return bonuses[eventType as keyof typeof bonuses] || 100;
}
