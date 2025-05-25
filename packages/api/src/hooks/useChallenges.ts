import { useState } from 'react';
import { Challenge } from '@fuseapp/types';
import { challengeClient, ListChallengesParams } from '../clients/challengeClient';

interface UseChallengesOptions {
  initialLoading?: boolean;
}

export function useChallenges(options: UseChallengesOptions = {}) {
  const [loading, setLoading] = useState(options.initialLoading ?? false);
  const [error, setError] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);

  // Carregar lista de desafios
  const loadChallenges = async (params: ListChallengesParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await challengeClient.listChallenges(params);
      setChallenges(response.challenges);
      setTotalChallenges(response.total);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar desafios';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Carregar um desafio específico
  const loadChallenge = async (challengeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const challenge = await challengeClient.getChallenge(challengeId);
      setCurrentChallenge(challenge);
      return challenge;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar desafio';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Participar de um desafio
  const joinChallenge = async (userId: string, challengeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await challengeClient.joinChallenge(userId, challengeId);
      
      // Atualizar o desafio atual se estiver visualizando esse desafio
      if (currentChallenge?.id === challengeId) {
        await loadChallenge(challengeId);
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao participar do desafio';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sair de um desafio
  const leaveChallenge = async (userId: string, challengeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await challengeClient.leaveChallenge(userId, challengeId);
      
      // Atualizar o desafio atual se estiver visualizando esse desafio
      if (currentChallenge?.id === challengeId) {
        await loadChallenge(challengeId);
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao sair do desafio';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obter progresso do usuário em um desafio
  const getChallengeProgress = async (userId: string, challengeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const progress = await challengeClient.getChallengeProgress(userId, challengeId);
      return progress;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao obter progresso do desafio';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    challenges,
    totalChallenges,
    currentChallenge,
    loadChallenges,
    loadChallenge,
    joinChallenge,
    leaveChallenge,
    getChallengeProgress,
  };
} 