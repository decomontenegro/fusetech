import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { products } from '@/data/products';

export async function POST(request: NextRequest) {
  try {
    const { productId, tokens } = await request.json();
    
    // Verificar se usuário está logado
    const cookieStore = cookies();
    const userCookie = cookieStore.get('fusetech_user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userData = JSON.parse(userCookie.value);
    
    // Buscar produto
    const product = products.find(p => p.id === productId);
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    // Verificar se produto está em estoque
    if (!product.inStock) {
      return NextResponse.json({ error: 'Produto fora de estoque' }, { status: 400 });
    }

    // Buscar tokens do usuário
    const tokensResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/tokens`, {
      headers: {
        'Cookie': `fusetech_user=${userCookie.value}`
      }
    });
    
    if (!tokensResponse.ok) {
      return NextResponse.json({ error: 'Erro ao verificar tokens' }, { status: 500 });
    }

    const tokensData = await tokensResponse.json();
    const userTokens = tokensData.totalTokens || 0;

    // Verificar se usuário tem tokens suficientes
    if (userTokens < product.tokens) {
      return NextResponse.json({ 
        error: 'Tokens insuficientes',
        required: product.tokens,
        available: userTokens
      }, { status: 400 });
    }

    // Simular processamento da compra
    // Em produção, aqui você integraria com:
    // - Sistema de estoque
    // - Sistema de entrega
    // - Banco de dados de pedidos
    // - Notificações por email/WhatsApp

    const purchase = {
      id: `purchase_${Date.now()}`,
      userId: userData.id,
      userName: userData.name,
      productId: product.id,
      productName: product.name,
      tokensSpent: product.tokens,
      realValue: product.price,
      timestamp: new Date().toISOString(),
      status: 'confirmed',
      deliveryInfo: {
        message: 'Entraremos em contato via WhatsApp para confirmar endereço de entrega.',
        estimatedDays: '5-10 dias úteis'
      }
    };

    // Salvar compra (simulado - em produção salvaria no banco)
    console.log('Nova compra registrada:', purchase);

    // Debitar tokens do usuário
    const newTokenBalance = userTokens - product.tokens;
    
    // Atualizar cookie com novo saldo (simulado)
    const updatedUserData = {
      ...userData,
      lastPurchase: purchase,
      tokensSpent: (userData.tokensSpent || 0) + product.tokens
    };

    const response = NextResponse.json({
      success: true,
      purchase,
      newTokenBalance,
      message: `Parabéns! Você trocou ${product.tokens} tokens por ${product.name}!`
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
    console.error('Erro ao processar compra:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
