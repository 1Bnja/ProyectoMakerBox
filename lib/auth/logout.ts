import { signOut } from '@/lib/supabase/auth'

export async function logout() {
    const { error } = await signOut()

    if (error) {
        return { error: error.message }
    }
    return { ok: true as const }
}
