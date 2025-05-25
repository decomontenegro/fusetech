import apiService, { PaginatedResponse } from './api';

// Tipos
export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  level: number;
  points: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateUserData {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

// Serviço de usuário
export class UserService {
  // Obter perfil do usuário atual
  async getCurrentUser(): Promise<User> {
    return apiService.get<User>('/api/users/me');
  }

  // Atualizar perfil do usuário
  async updateProfile(data: UpdateUserData): Promise<User> {
    return apiService.put<User>('/api/users/me', data);
  }

  // Obter perfil de outro usuário
  async getUserProfile(userId: string): Promise<User> {
    return apiService.get<User>(`/api/users/${userId}`);
  }

  // Obter lista de amigos
  async getFriends(limit: number = 10, offset: number = 0): Promise<PaginatedResponse<User>> {
    return apiService.get<PaginatedResponse<User>>('/api/users/friends', {
      params: { limit, offset },
    });
  }

  // Adicionar amigo
  async addFriend(userId: string): Promise<{ success: boolean }> {
    return apiService.post<{ success: boolean }>('/api/users/friends', { userId });
  }

  // Remover amigo
  async removeFriend(userId: string): Promise<{ success: boolean }> {
    return apiService.delete<{ success: boolean }>(`/api/users/friends/${userId}`);
  }
}

// Instância única do serviço
export const userService = new UserService();

export default userService;
