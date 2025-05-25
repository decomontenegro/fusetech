'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import {
  GET_ACTIVITIES,
  GET_ACTIVITY,
  CREATE_ACTIVITY,
  UPDATE_ACTIVITY,
  GET_ACTIVITY_STATS
} from '../lib/graphql/queries/activity';

export function useActivities() {
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [type, setType] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  // Obter lista de atividades
  const {
    data: activitiesData,
    loading: activitiesLoading,
    error: activitiesError,
    refetch: refetchActivities
  } = useQuery(GET_ACTIVITIES, {
    variables: {
      limit,
      offset,
      type,
      source
    },
    skip: typeof window === 'undefined', // Não executar no servidor
    fetchPolicy: 'cache-and-network'
  });

  // Obter estatísticas de atividades
  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery(GET_ACTIVITY_STATS, {
    skip: typeof window === 'undefined', // Não executar no servidor
    fetchPolicy: 'cache-and-network'
  });

  // Criar atividade
  const [createActivity, { loading: createLoading }] = useMutation(CREATE_ACTIVITY, {
    onCompleted: () => {
      toast.success('Atividade criada com sucesso!');
      refetchActivities();
      refetchStats();
    },
    onError: (error) => {
      toast.error(`Erro ao criar atividade: ${error.message}`);
    }
  });

  // Atualizar atividade
  const [updateActivity, { loading: updateLoading }] = useMutation(UPDATE_ACTIVITY, {
    onCompleted: () => {
      toast.success('Atividade atualizada com sucesso!');
      refetchActivities();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar atividade: ${error.message}`);
    }
  });

  // Obter detalhes de uma atividade
  const getActivity = (id: string) => {
    return useQuery(GET_ACTIVITY, {
      variables: { id },
      skip: typeof window === 'undefined', // Não executar no servidor
      fetchPolicy: 'cache-and-network'
    });
  };

  // Criar nova atividade
  const handleCreateActivity = async (activityData: any) => {
    try {
      await createActivity({
        variables: {
          type: activityData.type,
          title: activityData.title,
          description: activityData.description,
          distance: activityData.distance,
          duration: activityData.duration,
          startDate: activityData.startDate,
          endDate: activityData.endDate,
          source: activityData.source || 'manual',
          calories: activityData.calories,
          elevationGain: activityData.elevationGain,
          averageHeartRate: activityData.averageHeartRate,
          maxHeartRate: activityData.maxHeartRate
        }
      });
      return true;
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      return false;
    }
  };

  // Atualizar atividade existente
  const handleUpdateActivity = async (id: string, activityData: any) => {
    try {
      await updateActivity({
        variables: {
          id,
          title: activityData.title,
          description: activityData.description
        }
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      return false;
    }
  };

  // Processar dados de estatísticas
  const processStats = () => {
    if (!statsData) return null;

    const totalActivities = statsData.total_activities.aggregate.count;
    const totalDistance = statsData.total_distance.aggregate.sum.distance || 0;
    const totalDuration = statsData.total_duration.aggregate.sum.duration || 0;
    const totalPoints = statsData.total_points.aggregate.sum.points || 0;

    // Contar atividades por tipo
    const activitiesByType = statsData.activities_by_type.reduce((acc: any, curr: any) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalActivities,
      totalDistance,
      totalDuration,
      totalPoints,
      activitiesByType
    };
  };

  return {
    // Dados
    activities: activitiesData?.physical_activities || [],
    totalCount: activitiesData?.physical_activities_aggregate.aggregate.count || 0,
    stats: processStats(),
    
    // Estado
    loading: activitiesLoading || statsLoading || createLoading || updateLoading,
    error: activitiesError || statsError,
    
    // Paginação
    limit,
    offset,
    setLimit,
    setOffset,
    
    // Filtros
    type,
    source,
    setType,
    setSource,
    
    // Ações
    refetchActivities,
    refetchStats,
    getActivity,
    createActivity: handleCreateActivity,
    updateActivity: handleUpdateActivity
  };
}
