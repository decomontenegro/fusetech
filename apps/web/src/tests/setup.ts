import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock do Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      {...props}
    />
  )
}));

// Mock do processo do Node para variáveis de ambiente
vi.mock('process', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
    NEXT_PUBLIC_STRAVA_CLIENT_ID: '12345',
    NEXT_PUBLIC_STRAVA_REDIRECT_URI: 'http://localhost:3000/api/auth/strava/callback',
    NEXT_PUBLIC_API_URL: 'http://localhost:3001'
  }
}));

// Configuração global para testes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock do sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Mock do navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockImplementation(() => Promise.resolve()),
    readText: vi.fn().mockImplementation(() => Promise.resolve(''))
  }
});

// Mock do navigator.share
Object.defineProperty(navigator, 'share', {
  value: vi.fn().mockImplementation(() => Promise.resolve())
});

// Limpar todos os mocks após cada teste
afterEach(() => {
  vi.clearAllMocks();
});
