import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock do serviço de autenticação
vi.mock('@fuseapp/auth', () => ({
  createAuthService: () => ({
    getCurrentUser: vi.fn().mockResolvedValue({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: {
          name: 'Test User',
          role: 'user'
        },
        created_at: new Date().toISOString()
      },
      error: null
    }),
    signInWithEmail: vi.fn().mockImplementation(({ email, password }) => {
      if (email === 'valid@example.com' && password === 'password123') {
        return Promise.resolve({
          data: {
            user: {
              id: 'test-user-id',
              email: 'valid@example.com'
            }
          },
          error: null
        });
      }
      return Promise.resolve({
        data: null,
        error: new Error('Invalid credentials')
      });
    }),
    signUpWithEmail: vi.fn().mockImplementation(({ email, password, name }) => {
      if (email && password && name) {
        return Promise.resolve({
          data: {
            user: {
              id: 'new-user-id',
              email
            }
          },
          error: null
        });
      }
      return Promise.resolve({
        data: null,
        error: new Error('Invalid data')
      });
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    getSupabaseClient: vi.fn().mockReturnValue({
      auth: {
        onAuthStateChange: vi.fn().mockReturnValue({
          data: {
            subscription: {
              unsubscribe: vi.fn()
            }
          }
        })
      }
    })
  })
}));

// Mock do useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Componente de teste para acessar o contexto
const TestComponent = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  
  return (
    <div>
      {loading ? (
        <div data-testid="loading">Loading...</div>
      ) : user ? (
        <div>
          <div data-testid="user-email">{user.email}</div>
          <div data-testid="user-name">{user.name}</div>
          <button data-testid="logout-button" onClick={signOut}>
            Logout
          </button>
        </div>
      ) : (
        <div>
          <div data-testid="not-authenticated">Not authenticated</div>
          <button
            data-testid="login-button"
            onClick={() => signIn('valid@example.com', 'password123')}
          >
            Login
          </button>
          <button
            data-testid="register-button"
            onClick={() => signUp('New User', 'new@example.com', 'password123')}
          >
            Register
          </button>
        </div>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should load user data on mount', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    });
  });

  it('should handle sign in correctly', async () => {
    const { createAuthService } = await import('@fuseapp/auth');
    const mockSignIn = createAuthService().signInWithEmail;
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Esperar o estado inicial carregar e mostrar que não está autenticado
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Clicar no botão de login
    fireEvent.click(screen.getByTestId('login-button'));
    
    // Verificar se a função de login foi chamada corretamente
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'valid@example.com',
      password: 'password123'
    });
  });

  it('should handle sign up correctly', async () => {
    const { createAuthService } = await import('@fuseapp/auth');
    const mockSignUp = createAuthService().signUpWithEmail;
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Esperar o estado inicial carregar e mostrar que não está autenticado
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Clicar no botão de registro
    fireEvent.click(screen.getByTestId('register-button'));
    
    // Verificar se a função de registro foi chamada corretamente
    expect(mockSignUp).toHaveBeenCalledWith({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123'
    });
  });

  it('should handle sign out correctly', async () => {
    const { createAuthService } = await import('@fuseapp/auth');
    const mockSignOut = createAuthService().signOut;
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Esperar o usuário ser carregado
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toBeInTheDocument();
    });
    
    // Clicar no botão de logout
    fireEvent.click(screen.getByTestId('logout-button'));
    
    // Verificar se a função de logout foi chamada
    expect(mockSignOut).toHaveBeenCalled();
  });
});
