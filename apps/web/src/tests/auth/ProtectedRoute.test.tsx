import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock do contexto de autenticação
vi.mock('../../context/AuthContext', () => {
  const originalModule = vi.importActual('../../context/AuthContext');
  
  return {
    ...originalModule,
    useAuth: vi.fn()
  };
});

// Mock do useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

describe('ProtectedRoute', () => {
  const mockPush = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock do useRouter
    vi.mocked(require('next/navigation').useRouter).mockImplementation(() => ({
      push: mockPush
    }));
  });

  it('should show loading state when authentication is in progress', () => {
    // Configurar o mock do useAuth para retornar loading: true
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      getAuthService: vi.fn()
    });
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    
    // Verificar se o estado de loading é exibido
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to login page when user is not authenticated', async () => {
    // Configurar o mock do useAuth para retornar user: null e loading: false
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      getAuthService: vi.fn()
    });
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    
    // Verificar se o redirecionamento foi chamado
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });
    
    // Verificar se o conteúdo protegido não é exibido
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    // Configurar o mock do useAuth para retornar um usuário autenticado
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        user_metadata: {}
      },
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      getAuthService: vi.fn()
    });
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    
    // Verificar se o conteúdo protegido é exibido
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    
    // Verificar se o redirecionamento não foi chamado
    expect(mockPush).not.toHaveBeenCalled();
  });
});
