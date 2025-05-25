import { useState, useEffect } from 'react';

export function useMedia(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia(query);
    
    // Inicializa com o valor atual
    setMatches(media.matches);
    
    // Callback para quando o estado mudar
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    // Adiciona o listener
    media.addEventListener('change', listener);
    
    // Cleanup ao desmontar
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Hooks pré-definidos para pontos de quebra comuns
export function useIsMobile(): boolean {
  return useMedia('(max-width: 639px)');
}

export function useIsTablet(): boolean {
  return useMedia('(min-width: 640px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMedia('(min-width: 1024px)');
}

export function useIsDarkMode(): boolean {
  return useMedia('(prefers-color-scheme: dark)');
} 