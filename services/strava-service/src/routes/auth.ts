import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Rotas de autenticação para integração com Strava
 */
export function authRoutes(supabase: SupabaseClient, strava: any) {
  const router = Router();

  /**
   * Rota para iniciar processo de autenticação com Strava
   * Retorna URL para redirecionamento do usuário
   */
  router.get('/authorize', async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'Parâmetro userId obrigatório' });
      }
      
      // Verificar se o usuário existe no Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (userError || !userData) {
        console.error('Erro ao verificar usuário:', userError);
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Gerar URL de autorização
      const url = strava.oauth.getRequestAccessURL({
        scope: 'activity:read_all',
        state: userId // Usar o userId como state para identificar o usuário no callback
      });
      
      res.json({ url });
    } catch (error) {
      console.error('Erro ao gerar URL de autorização:', error);
      res.status(500).json({ error: 'Falha ao iniciar processo de autorização' });
    }
  });

  /**
   * Endpoint para callback do OAuth Strava
   * Recebe código de autorização e troca por tokens de acesso
   */
  router.get('/callback', async (req: Request, res: Response) => {
    try {
      const { code, state, error } = req.query;
      
      // Verificar erro de autorização
      if (error) {
        console.error('Erro retornado pelo Strava:', error);
        return res.redirect(`${process.env.FRONTEND_URL}/perfil?status=error&message=${error}`);
      }
      
      // Verificar parâmetros necessários
      if (!code || !state) {
        console.error('Parâmetros inválidos no callback:', { code, state });
        return res.redirect(`${process.env.FRONTEND_URL}/perfil?status=error&message=Parâmetros inválidos`);
      }
      
      // Trocar código por tokens
      const tokenResponse = await strava.oauth.getToken(code);
      const { 
        access_token, 
        refresh_token, 
        expires_at, 
        athlete 
      } = tokenResponse;
      
      // Dados do atleta Strava
      const stravaUserId = athlete.id;
      const userId = state as string;
      
      // Salvar informações da integração no Supabase
      const { error: integrationError } = await supabase
        .from('strava_integrations')
        .upsert({
          user_id: userId,
          strava_athlete_id: stravaUserId,
          access_token,
          refresh_token,
          expires_at: new Date(expires_at * 1000).toISOString(),
          athlete_data: athlete
        }, { onConflict: 'user_id' });
      
      if (integrationError) {
        console.error('Erro ao salvar tokens:', integrationError);
        return res.redirect(`${process.env.FRONTEND_URL}/perfil?status=error&message=Falha ao salvar integração`);
      }
      
      // Subscrever no webhook para eventos do atleta (se ainda não estiver inscrito)
      try {
        await strava.pushSubscriptions.create({
          callback_url: `${process.env.STRAVA_WEBHOOK_URL}/api/strava/webhook`,
          verify_token: process.env.STRAVA_VERIFY_TOKEN
        });
      } catch (webhookError: any) {
        // Se já estiver inscrito, isso pode gerar um erro que pode ser ignorado
        if (!webhookError.message.includes('already exists')) {
          console.error('Erro ao subscrever no webhook:', webhookError);
        }
      }
      
      // Redirecionar para a página de perfil com status de sucesso
      res.redirect(`${process.env.FRONTEND_URL}/perfil?status=success&provider=strava`);
    } catch (error) {
      console.error('Erro no callback OAuth:', error);
      res.redirect(`${process.env.FRONTEND_URL}/perfil?status=error&message=Falha na autenticação`);
    }
  });

  /**
   * Desconectar conta Strava
   */
  router.post('/disconnect', async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'Parâmetro userId obrigatório' });
      }
      
      // Buscar tokens da integração
      const { data: integrationData, error: getError } = await supabase
        .from('strava_integrations')
        .select('access_token')
        .eq('user_id', userId)
        .single();
      
      if (!getError && integrationData?.access_token) {
        // Revogar acesso no Strava (opcional, mas recomendado)
        try {
          await strava.oauth.deauthorize({ access_token: integrationData.access_token });
        } catch (revokeError) {
          console.error('Erro ao revogar acesso no Strava:', revokeError);
          // Continuar com a remoção local mesmo se falhar no Strava
        }
      }
      
      // Remover integração do banco de dados
      const { error: deleteError } = await supabase
        .from('strava_integrations')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) {
        console.error('Erro ao excluir integração:', deleteError);
        return res.status(500).json({ error: 'Falha ao desconectar conta' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao desconectar conta:', error);
      res.status(500).json({ error: 'Falha ao desconectar conta Strava' });
    }
  });

  return router;
} 