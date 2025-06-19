import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { notificationId } = await request.json();
    
    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID é obrigatório' }, { status: 400 });
    }

    const cookieStore = cookies();
    const userCookie = cookieStore.get('fusetech_user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userData = JSON.parse(userCookie.value);

    // Marcar notificação como lida
    markNotificationAsRead(userData.id, notificationId);

    // Atualizar dados do usuário
    const updatedUserData = {
      ...userData,
      notificationsRead: [...(userData.notificationsRead || []), notificationId],
      lastNotificationRead: {
        notificationId,
        readAt: new Date().toISOString()
      }
    };

    const response = NextResponse.json({
      success: true,
      message: 'Notificação marcada como lida'
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
    console.error('Erro ao marcar notificação como lida:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Sistema de notificações lidas (simulado)
const readNotifications = new Map<string, Set<string>>();

function markNotificationAsRead(userId: string, notificationId: string) {
  if (!readNotifications.has(userId)) {
    readNotifications.set(userId, new Set());
  }
  
  const userReadNotifications = readNotifications.get(userId)!;
  userReadNotifications.add(notificationId);
  
  console.log(`Notificação ${notificationId} marcada como lida para usuário ${userId}`);
}
