import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockSupabaseAuth = {
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  getUser: vi.fn(),
}

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: mockSupabaseAuth,
    from: vi.fn(),
  })),
}))

describe('Integración Supabase Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('debería iniciar sesión con credenciales válidas', async () => {
    const mockUser = { id: 'user-123', email: 'usuario@ejemplo.com' }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const mockSession = { access_token: 'token-abc123', user: mockUser }

    mockSupabaseAuth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    })

    const { signInWithEmail } = await import('@/lib/supabase/auth')
    const { data, error } = await signInWithEmail('usuario@ejemplo.com', 'contraseña123')

    expect(error).toBeNull()
    expect(data.user?.email).toBe('usuario@ejemplo.com')
    expect(data.session?.access_token).toBe('token-abc123')
    expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
      email: 'usuario@ejemplo.com',
      password: 'contraseña123',
    })
  })

  it('debería retornar error con credenciales inválidas', async () => {
    mockSupabaseAuth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    })

    const { signInWithEmail } = await import('@/lib/supabase/auth')
    const { data, error } = await signInWithEmail('usuario@ejemplo.com', 'contraseñaIncorrecta')

    expect(error).toBeDefined()
    expect(error?.message).toBe('Invalid login credentials')
    expect(data.user).toBeNull()
  })

  it('debería cerrar sesión exitosamente', async () => {
    mockSupabaseAuth.signOut.mockResolvedValue({ error: null })

    const { signOut } = await import('@/lib/supabase/auth')
    const { error } = await signOut()

    expect(error).toBeNull()
    expect(mockSupabaseAuth.signOut).toHaveBeenCalledOnce()
  })

  it('debería retornar error al fallar el cierre de sesión', async () => {
    mockSupabaseAuth.signOut.mockResolvedValue({
      error: { message: 'Network error' },
    })

    const { signOut } = await import('@/lib/supabase/auth')
    const { error } = await signOut()

    expect(error?.message).toBe('Network error')
  })

  it('debería obtener la sesión activa del usuario autenticado', async () => {
    const mockSession = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
      access_token: 'token-abc123',
      user: { id: 'user-123', email: 'usuario@ejemplo.com' },
    }

    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    const { getSession } = await import('@/lib/supabase/auth')
    const { data, error } = await getSession()

    expect(error).toBeNull()
    expect(data.session?.access_token).toBe('token-abc123')
    expect(data.session?.user.email).toBe('usuario@ejemplo.com')
  })

  it('debería retornar sesión nula cuando no hay usuario autenticado', async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    const { getSession } = await import('@/lib/supabase/auth')
    const { data, error } = await getSession()

    expect(error).toBeNull()
    expect(data.session).toBeNull()
  })

  it('debería obtener el usuario actual autenticado', async () => {
    const mockUser = { id: 'user-123', email: 'usuario@ejemplo.com' }

    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const { getCurrentUser } = await import('@/lib/supabase/auth')
    const { data, error } = await getCurrentUser()

    expect(error).toBeNull()
    expect(data.user?.id).toBe('user-123')
    expect(data.user?.email).toBe('usuario@ejemplo.com')
  })

  it('debería retornar error cuando falla la obtención del usuario', async () => {
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'JWT expired' },
    })

    const { getCurrentUser } = await import('@/lib/supabase/auth')
    const { data, error } = await getCurrentUser()

    expect(error?.message).toBe('JWT expired')
    expect(data.user).toBeNull()
  })
})