import { signInWithEmail } from '@/lib/supabase/auth'
import { getPerfil } from '@/lib/supabase/perfiles'
import type { Rol } from '@/lib/auth/roles'

export async function login(email: string, password: string) {
    const { data, error } = await signInWithEmail(email, password)

    if (error) {
        return { error: error.message }
    }
    const { data: perfil, error: perfilError } = await getPerfil(data.user.id)
    if (perfilError) {
        return { error: perfilError.message }
    }
    return { rol: (perfil as { rol: Rol }).rol }
}