import { getSupabaseClient } from './client'

export async function getPerfil(userId: string) {
  const client = getSupabaseClient()
  return client.from('perfiles').select('*').eq('id', userId).single()
}