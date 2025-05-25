import { createClient } from '@supabase/supabase-js';

// Criação do cliente Supabase para uso no navegador
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Credenciais do Supabase não encontradas nas variáveis de ambiente.');
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });
};

// Cliente Supabase compartilhado para browser-side
export const supabase = typeof window !== 'undefined' ? createSupabaseClient() : null; 