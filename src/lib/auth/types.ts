// Tipos para sistema de autenticação social e wallet abstraction

export type AuthProvider = 'strava' | 'google' | 'apple' | 'email';

export interface SocialAuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: AuthProvider;
  providerId: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface AbstractedWallet {
  id: string;
  userId: string;
  address: string;
  publicKey: string;
  // Private key é armazenado de forma segura e criptografada
  encryptedPrivateKey: string;
  chainId: number;
  isActive: boolean;
  createdAt: Date;
  // Backup e recovery
  recoveryPhrase?: string; // Criptografado
  backupCompleted: boolean;
}

export interface UserAccount {
  id: string;
  user: SocialAuthUser;
  wallet: AbstractedWallet;
  // Dados específicos da aplicação
  fitnessProfile?: {
    stravaConnected: boolean;
    stravaUserId?: string;
    preferredActivities: string[];
    goals: string[];
  };
  // Configurações de privacidade
  privacy: {
    shareActivity: boolean;
    shareProgress: boolean;
    allowNotifications: boolean;
  };
  // Dados da Fase 1
  pointsBalance: number;
  totalEarned: number;
  totalSpent: number;
  stakingBalance: number;
  // Status da conta
  isVerified: boolean;
  kycCompleted: boolean; // Para Fase 2
}

export interface AuthSession {
  user: UserAccount;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface AuthError {
  code: string;
  message: string;
  provider?: AuthProvider;
}

// Estados de autenticação
export type AuthState = 
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: UserAccount }
  | { status: 'error'; error: AuthError };

// Configurações dos providers
export interface ProviderConfig {
  strava: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
  };
  google: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
  };
  apple: {
    clientId: string;
    teamId: string;
    keyId: string;
    privateKey: string;
    redirectUri: string;
    scopes: string[];
  };
  email: {
    smtpConfig: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
  };
}

// Eventos de autenticação
export interface AuthEvent {
  type: 'login' | 'logout' | 'register' | 'wallet_created' | 'backup_completed';
  userId: string;
  provider?: AuthProvider;
  timestamp: Date;
  metadata?: Record<string, any>;
}
