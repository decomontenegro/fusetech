'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { toast } from 'sonner';
import {
  GET_CHALLENGES,
  GET_CHALLENGE,
  GET_USER_CHALLENGES,
  GET_USER_CHALLENGE,
  GET_ACHIEVEMENTS,
  GET_USER_ACHIEVEMENTS,
  GET_LEADERBOARD,
  GET_USER_RANK
} from '../lib/graphql/queries/gamification';

export function useGamification() {
  const [challengesLimit, setChallengesLimit] = useState(10);
  const [challengesOffset, setChallengesOffset] = useState(0);
  const [isActive, setIsActive] = useState<boolean | null>(true);
  const [isCompleted, setIsCompleted] = useState<boolean | null>(false);
  const [leaderboardLimit, setLeaderboardLimit] = useState(10);
  const [leaderboardOffset, setLeaderboardOffset] = useState(0);

  // Obter lista de desafios
  const {
    data: challengesData,
    loading: challengesLoading,
    error: challengesError,
    refetch: refetchChallenges
  } = useQuery(GET_CHALLENGES, {
    variables: {
      limit: challengesLimit,
      offset: challengesOffset,
      isActive
    },
    skip: typeof window === 'undefined', // Não executar no servidor
    fetchPolicy: 'cache-and-network'
  });

  // Obter desafios do usuário
  const {
    data: userChallengesData,
    loading: userChallengesLoading,
    error: userChallengesError,
    refetch: refetchUserChallenges
  } = useQuery(GET_USER_CHALLENGES, {
    variables: {
      limit: challengesLimit,
      offset: challengesOffset,
      isCompleted
    },
    skip: typeof window === 'undefined', // Não executar no servidor
    fetchPolicy: 'cache-and-network'
  });

  // Obter conquistas
  const {
    data: achievementsData,
    loading: achievementsLoading,
    error: achievementsError,
    refetch: refetchAchievements
  } = useQuery(GET_ACHIEVEMENTS, {
    skip: typeof window === 'undefined', // Não executar no servidor
    fetchPolicy: 'cache-and-network'
  });

  // Obter conquistas do usuário
  const {
    data: userAchievementsData,
    loading: userAchievementsLoading,
    error: userAchievementsError,
    refetch: refetchUserAchievements
  } = useQuery(GET_USER_ACHIEVEMENTS, {
    skip: typeof window === 'undefined', // Não executar no servidor
    fetchPolicy: 'cache-and-network'
  });

  // Obter leaderboard
  const {
    data: leaderboardData,
    loading: leaderboardLoading,
    error: leaderboardError,
    refetch: refetchLeaderboard
  } = useQuery(GET_LEADERBOARD, {
    variables: {
      limit: leaderboardLimit,
      offset: leaderboardOffset
    },
    skip: typeof window === 'undefined', // Não executar no servidor
    fetchPolicy: 'cache-and-network'
  });

  // Obter posição do usuário no leaderboard
  const {
    data: userRankData,
    loading: userRankLoading,
    error: userRankError,
    refetch: refetchUserRank
  } = useQuery(GET_USER_RANK, {
    skip: typeof window === 'undefined', // Não executar no servidor
    fetchPolicy: 'cache-and-network'
  });

  // Obter detalhes de um desafio
  const getChallenge = (id: string) => {
    return useQuery(GET_CHALLENGE, {
      variables: { id },
      skip: typeof window === 'undefined', // Não executar no servidor
      fetchPolicy: 'cache-and-network'
    });
  };

  // Obter progresso do usuário em um desafio
  const getUserChallenge = (challengeId: string) => {
    return useQuery(GET_USER_CHALLENGE, {
      variables: { challengeId },
      skip: typeof window === 'undefined', // Não executar no servidor
      fetchPolicy: 'cache-and-network'
    });
  };

  // Reivindicar recompensa de desafio (via API REST)
  const claimChallengeReward = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/users/me/challenges/${challengeId}/claim`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao reivindicar recompensa');
      }
      
      const data = await response.json();
      toast.success('Recompensa reivindicada com sucesso!');
      refetchUserChallenges();
      return data.data;
    } catch (error) {
      console.error('Erro ao reivindicar recompensa:', error);
      toast.error('Erro ao reivindicar recompensa');
      return null;
    }
  };

  // Reivindicar recompensa de conquista (via API REST)
  const claimAchievementReward = async (achievementId: string) => {
    try {
      const response = await fetch(`/api/users/me/achievements/${achievementId}/claim`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao reivindicar recompensa');
      }
      
      const data = await response.json();
      toast.success('Recompensa reivindicada com sucesso!');
      refetchUserAchievements();
      return data.data;
    } catch (error) {
      console.error('Erro ao reivindicar recompensa:', error);
      toast.error('Erro ao reivindicar recompensa');
      return null;
    }
  };

  // Processar dados do rank do usuário
  const processUserRank = () => {
    if (!userRankData) return null;

    const currentUser = userRankData.current_user[0];
    const higherRankedUsers = userRankData.higher_ranked_users.aggregate.count;
    const totalUsers = userRankData.total_users.aggregate.count;
    
    // Posição do usuário (1-based)
    const position = higherRankedUsers + 1;
    
    // Determinar rank com base na posição percentual
    let rank = 'bronze';
    const percentile = (totalUsers - position) / totalUsers * 100;
    
    if (percentile >= 90) {
      rank = 'diamond';
    } else if (percentile >= 75) {
      rank = 'platinum';
    } else if (percentile >= 50) {
      rank = 'gold';
    } else if (percentile >= 25) {
      rank = 'silver';
    }
    
    return {
      ...currentUser,
      position,
      totalUsers,
      rank
    };
  };

  return {
    // Dados
    challenges: challengesData?.challenges || [],
    totalChallenges: challengesData?.challenges_aggregate.aggregate.count || 0,
    userChallenges: userChallengesData?.user_challenges || [],
    totalUserChallenges: userChallengesData?.user_challenges_aggregate.aggregate.count || 0,
    achievements: achievementsData?.achievements || [],
    userAchievements: userAchievementsData?.user_achievements || [],
    leaderboard: leaderboardData?.users || [],
    totalLeaderboardUsers: leaderboardData?.users_aggregate.aggregate.count || 0,
    userRank: processUserRank(),
    
    // Estado
    loading: challengesLoading || userChallengesLoading || achievementsLoading || 
             userAchievementsLoading || leaderboardLoading || userRankLoading,
    error: challengesError || userChallengesError || achievementsError || 
           userAchievementsError || leaderboardError || userRankError,
    
    // Paginação e filtros para desafios
    challengesLimit,
    challengesOffset,
    setChallengesLimit,
    setChallengesOffset,
    isActive,
    setIsActive,
    isCompleted,
    setIsCompleted,
    
    // Paginação para leaderboard
    leaderboardLimit,
    leaderboardOffset,
    setLeaderboardLimit,
    setLeaderboardOffset,
    
    // Ações
    refetchChallenges,
    refetchUserChallenges,
    refetchAchievements,
    refetchUserAchievements,
    refetchLeaderboard,
    refetchUserRank,
    getChallenge,
    getUserChallenge,
    claimChallengeReward,
    claimAchievementReward
  };
}
