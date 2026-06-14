import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/auth', () => ({
  signInWithEmail: vi.fn(),
}))

vi.mock('@/lib/supabase/perfiles', () => ({
  getPerfil: vi.fn(),
}))

import { signInWithEmail } from '@/lib/supabase/auth'
import { getPerfil } from '@/lib/supabase/perfiles'
import { login } from '@/lib/auth/login'

describe('AUTH-01 - login()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna error si las credenciales son inválidas', async () => {
    vi.mocked(signInWithEmail).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    } as never)

    const resultado = await login('usuario@ejemplo.com', 'malacontrasena')

    expect(resultado).toEqual({ error: 'Invalid login credentials' })
    expect(getPerfil).not.toHaveBeenCalled()
  })

  it('retorna error si no se encuentra el perfil del usuario', async () => {
    vi.mocked(signInWithEmail).mockResolvedValue({
      data: { user: { id: 'user-123' }, session: {} },
      error: null,
    } as never)

    vi.mocked(getPerfil).mockResolvedValue({
      data: null,
      error: { message: 'No rows found' },
    } as never)

    const resultado = await login('usuario@ejemplo.com', 'contrasena123')

    expect(resultado).toEqual({ error: 'No rows found' })
  })

  it('retorna el rol del usuario cuando el login es exitoso', async () => {
    vi.mocked(signInWithEmail).mockResolvedValue({
      data: { user: { id: 'user-123' }, session: {} },
      error: null,
    } as never)

    vi.mocked(getPerfil).mockResolvedValue({
      data: { id: 'user-123', nombre: 'Ana', apellido: 'Pérez', rol: 'ESTUDIANTE' },
      error: null,
    } as never)

    const resultado = await login('usuario@ejemplo.com', 'contrasena123')

    expect(resultado).toEqual({ rol: 'ESTUDIANTE' })
  })
})