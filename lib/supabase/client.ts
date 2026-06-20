// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Faltan las variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)");
  }

  if (!supabaseClient) {
    // createBrowserClient sincroniza con las mismas cookies de sesion
    // que usa el cliente server-side (@supabase/ssr), a diferencia del
    // cliente plano de @supabase/supabase-js que siempre actua como anon.
    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseClient
}