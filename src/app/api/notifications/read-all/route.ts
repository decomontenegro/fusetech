import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('fusetech_user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userData = JSON.parse(userCookie.value);

    // Marcar todas as notificações como lidas
    markAllNotificationsAsRead(userData.id);

    // Atualizar dados do usuário
    const updatedUserData = {
      ...userData,
      allNotificationsReadAt: new Date().toISOString()
    };

    const response = NextResponse.json({
      success: true,
      message: 'Todas as notificações foram marcadas como lidas'
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
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Sistema de notificações lidas (simulado)
const allReadTimestamps = new Map<string, Date>();

function markAllNotificationsAsRead(userId: string) {
  allReadTimestamps.set(userId, new Date());
  console.log(`Todas as notificações marcadas como lidas para usuário ${userId}`);
}
