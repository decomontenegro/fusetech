import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Rotas para gerenciamento de atividades
 */
export function activityRoutes(supabase: SupabaseClient, strava: any) {
  const router = Router();

  /**
   * Listar atividades de um usuário
   */
  router.get('/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit = 20, page = 1, status } = req.query;
      
      // Construir query
      let query = supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });
      
      // Filtrar por status, se fornecido
      if (status) {
        query = query.eq('status', status);
      }
      
      // Paginação
      const offset = (Number(page) - 1) * Number(limit);
      query = query.range(offset, offset + Number(limit) - 1);
      
      // Executar query
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Erro ao buscar atividades:', error);
        return res.status(500).json({ error: 'Falha ao buscar atividades' });
      }
      
      // Obter contagem total
      const { count: totalCount, error: countError } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (countError) {
        console.error('Erro ao contar atividades:', countError);
      }
      
      res.json({
        data,
        page: Number(page),
        limit: Number(limit),
        total: totalCount || 0
      });
    } catch (error) {
      console.error('Erro ao listar atividades:', error);
      res.status(500).json({ error: 'Falha ao processar requisição' });
    }
  });

  /**
   * Obter detalhes de uma atividade específica
   */
  router.get('/detail/:activityId', async (req: Request, res: Response) => {
    try {
      const { activityId } = req.params;
      
      // Buscar atividade no banco
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar atividade:', error);
        return res.status(404).json({ error: 'Atividade não encontrada' });
      }
      
      res.json(data);
    } catch (error) {
      console.error('Erro ao obter detalhes da atividade:', error);
      res.status(500).json({ error: 'Falha ao processar requisição' });
    }
  });

  /**
   * Sincronizar histórico de atividades
   * Busca atividades anteriores no Strava e sincroniza com o banco
   */
  router.post('/sync-history/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { days = 30 } = req.body;
      
      // Buscar integração do usuário com Strava
      const { data: integration, error: integrationError } = await supabase
        .from('strava_integrations')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (integrationError || !integration) {
        return res.status(404).json({ error: 'Integração com Strava não encontrada' });
      }
      
      // Verificar token e renovar se necessário
      const now = Math.floor(Date.now() / 1000);
      const tokenExpiry = Math.floor(new Date(integration.expires_at).getTime() / 1000);
      
      let accessToken = integration.access_token;
      
      if (tokenExpiry <= now) {
        try {
          const refreshResponse = await strava.oauth.refreshToken(integration.refresh_token);
          
          // Atualizar tokens na base de dados
          await supabase
            .from('strava_integrations')
            .update({
              access_token: refreshResponse.access_token,
              refresh_token: refreshResponse.refresh_token,
              expires_at: new Date(refreshResponse.expires_at * 1000).toISOString()
            })
            .eq('user_id', userId);
          
          accessToken = refreshResponse.access_token;
        } catch (refreshError) {
          console.error('Erro ao renovar token:', refreshError);
          return res.status(500).json({ error: 'Falha ao renovar token de acesso' });
        }
      }
      
      // Data de início (X dias atrás)
      const after = Math.floor(Date.now() / 1000) - (Number(days) * 86400);
      
      // Iniciar sincronização em background
      res.json({ status: 'sync_started', message: 'Sincronização iniciada em background' });
      
      // Buscar atividades do Strava
      try {
        const activities = await strava.athlete.listActivities({
          access_token: accessToken,
          after,
          per_page: 200 // máximo permitido pela API do Strava
        });
        
        let syncedCount = 0;
        
        // Processar cada atividade
        for (const activity of activities) {
          // Verificar se já existe no banco
          const { data: existingActivity } = await supabase
            .from('activities')
            .select('id')
            .eq('source', 'strava')
            .eq('source_id', activity.id.toString())
            .single();
          
          if (existingActivity) {
            continue; // Pular se já existir
          }
          
          // Mapear tipo de atividade
          const activityType = mapActivityType(activity.type);
          
          // Pular se não for um tipo suportado
          if (!activityType) {
            continue;
          }
          
          // Calcular pontos
          const points = calculatePoints(activity);
          
          // Inserir no banco
          const { error: insertError } = await supabase
            .from('activities')
            .insert({
              id: `strava_${activity.id}`,
              user_id: userId,
              source: 'strava',
              source_id: activity.id.toString(),
              type: activityType,
              distance: activity.distance,
              duration: activity.moving_time,
              start_date: activity.start_date,
              points: points,
              status: 'pending', // Pendente de verificação
              tokenized: false,
              raw_data: activity,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (!insertError) {
            syncedCount++;
          }
        }
        
        // Notificar serviço de verificação em massa
        try {
          await fetch(`${process.env.VERIFICATION_SERVICE_URL}/api/verify-batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
          });
        } catch (notifyError) {
          console.error('Erro ao notificar serviço de verificação:', notifyError);
        }
        
        console.log(`Sincronização concluída para o usuário ${userId}: ${syncedCount} atividades sincronizadas`);
      } catch (stravaError) {
        console.error('Erro ao buscar atividades do Strava:', stravaError);
      }
    } catch (error) {
      console.error('Erro na sincronização de histórico:', error);
      res.status(500).json({ error: 'Falha ao iniciar sincronização' });
    }
  });

  /**
   * Excluir uma atividade
   */
  router.delete('/:activityId', async (req: Request, res: Response) => {
    try {
      const { activityId } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório' });
      }
      
      // Verificar se a atividade pertence ao usuário
      const { data: activity, error: getError } = await supabase
        .from('activities')
        .select('user_id, source, source_id, tokenized')
        .eq('id', activityId)
        .single();
      
      if (getError || !activity) {
        return res.status(404).json({ error: 'Atividade não encontrada' });
      }
      
      if (activity.user_id !== userId) {
        return res.status(403).json({ error: 'Você não tem permissão para excluir esta atividade' });
      }
      
      // Não permitir exclusão de atividades já tokenizadas
      if (activity.tokenized) {
        return res.status(400).json({ error: 'Não é possível excluir atividades já tokenizadas' });
      }
      
      // Excluir atividade do banco
      const { error: deleteError } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);
      
      if (deleteError) {
        console.error('Erro ao excluir atividade:', deleteError);
        return res.status(500).json({ error: 'Falha ao excluir atividade' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao excluir atividade:', error);
      res.status(500).json({ error: 'Falha ao processar requisição' });
    }
  });

  return router;
}

/**
 * Mapeia o tipo de atividade do Strava para o formato interno
 */
function mapActivityType(stravaType: string): string | null {
  const typeMap: Record<string, string> = {
    'Run': 'run',
    'VirtualRun': 'run',
    'TrailRun': 'run',
    'Walk': 'walk',
    'Hike': 'walk',
    'Ride': 'cycle',
    'VirtualRide': 'cycle',
    'MountainBikeRide': 'cycle',
    'EBikeRide': 'cycle'
  };
  
  return typeMap[stravaType] || null;
}

/**
 * Calcula pontos para uma atividade
 */
function calculatePoints(activity: any): number {
  // Algoritmo básico de pontuação: 1 ponto a cada 100m
  // Pode ser ajustado conforme regras de negócio
  let points = Math.floor(activity.distance / 100);
  
  // Bônus por duração longa (mais de 1h)
  if (activity.moving_time > 3600) {
    points += 10;
  }
  
  // Bônus por elevação (cada 100m de ganho)
  if (activity.total_elevation_gain) {
    points += Math.floor(activity.total_elevation_gain / 100) * 5;
  }
  
  return points;
} 