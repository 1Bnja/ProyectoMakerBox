import { getSupabaseClient } from './client'

export async function signInWithEmail(email: string, password: string) {
  const client = getSupabaseClient()
  return client.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  const client = getSupabaseClient()
  return client.auth.signOut()
}

export async function getSession() {
  const client = getSupabaseClient()
  return client.auth.getSession()
}

export async function getCurrentUser() {
  const client = getSupabaseClient()
  return client.auth.getUser()
}