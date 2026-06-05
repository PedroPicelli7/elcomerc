// src/services/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("As chaves do Supabase não foram encontradas nas variáveis de ambiente.");
}

export const supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);