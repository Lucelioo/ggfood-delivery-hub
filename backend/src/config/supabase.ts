import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface SupabaseConfig {
  supabaseUrl: string
  supabaseServiceKey: string
  supabaseAnonKey: string
}

export function getSupabaseConfig(): SupabaseConfig {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return { supabaseUrl, supabaseServiceKey, supabaseAnonKey }
}

export function createAdminClient(): SupabaseClient {
  const { supabaseUrl, supabaseServiceKey } = getSupabaseConfig()
  return createClient(supabaseUrl, supabaseServiceKey)
}

export function createUserClient(authHeader: string | null): SupabaseClient {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader || '' },
    },
  })
}
