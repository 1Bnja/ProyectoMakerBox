import { describe, it, expect, vi } from 'vitest'
import { logout } from '@/lib/auth/logout'
import { signOut } from '@/lib/supabase/auth'

vi.mock('@/lib/supabase/auth', () => ({
    signOut: vi.fn(),
}))

describe('logout', () => {
    it('retorna ok cuando signOut no tiene error', async () => {
        vi.mocked(signOut).mockResolvedValue({ error: null })

        const result = await logout()

        expect(result).toEqual({ ok: true })
    })

    it('retorna el mensaje de error cuando signOut falla', async () => {
        vi.mocked(signOut).mockResolvedValue({
            error: { message: 'Error al cerrar sesión' },
        })

        const result = await logout()

        expect(result).toEqual({ error: 'Error al cerrar sesión' })
    })
})
