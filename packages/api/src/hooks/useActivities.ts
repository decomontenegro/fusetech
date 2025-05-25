import { useState } from 'react';
import { PhysicalActivity, SocialActivity } from '@fuseapp/types';
import { activityClient, ListActivitiesParams } from '../clients/activityClient';

interface UseActivitiesOptions {
  initialLoading?: boolean;
}

export function useActivities(userId: string, options: UseActivitiesOptions = {}) {
  const [loading, setLoading] = useState(options.initialLoading ?? false);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<(PhysicalActivity | SocialActivity)[]>([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [currentActivity, setCurrentActivity] = useState<PhysicalActivity | SocialActivity | null>(null);

  // Carregar lista de atividades
  const loadActivities = async (params: Omit<ListActivitiesParams, 'userId'> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await activityClient.listActivities({
        userId,
        ...params,
      });
      setActivities(response.activities);
      setTotalActivities(response.total);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar atividades';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Carregar uma atividade específica
  const loadActivity = async (activityId: string) => {
    setLoading(true);
    setError(null);
    try {
      const activity = await activityClient.getActivity(activityId);
      setCurrentActivity(activity);
      return activity;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar atividade';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Conectar com Strava
  const connectStrava = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await activityClient.connectStrava({ userId, code });
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao conectar com Strava';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obter status da conexão com Strava
  const getStravaStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const status = await activityClient.getStravaStatus(userId);
      return status;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao verificar status do Strava';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Desconectar do Strava
  const disconnectStrava = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await activityClient.disconnectStrava(userId);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao desconectar do Strava';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar atividades
  const syncActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await activityClient.syncActivities(userId);
      // Recarregar atividades após sincronização
      if (result.success) {
        await loadActivities();
      }
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao sincronizar atividades';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    activities,
    totalActivities,
    currentActivity,
    loadActivities,
    loadActivity,
    connectStrava,
    getStravaStatus,
    disconnectStrava,
    syncActivities,
  };
} 