import { useState, useCallback } from 'react';

export interface UseToggleReturn {
  state: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
  setValue: (value: boolean) => void;
}

export function useToggle(initialState = false): UseToggleReturn {
  const [state, setState] = useState<boolean>(initialState);

  const toggle = useCallback(() => setState(state => !state), []);
  const setTrue = useCallback(() => setState(true), []);
  const setFalse = useCallback(() => setState(false), []);
  const setValue = useCallback((value: boolean) => setState(value), []);

  return { state, toggle, setTrue, setFalse, setValue };
} 