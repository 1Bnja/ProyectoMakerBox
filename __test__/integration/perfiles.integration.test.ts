import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockSingle = vi.fn()
const mockEq = vi.fn(() => ({ single: mockSingle }))
const mockSelect = vi.fn(() => ({ eq: mockEq }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {},
    from: mockFrom,
  })),
}))

describe('Integración Supabase - Perfiles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('debería obtener el perfil de un usuario existente', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'user-123', nombre: 'Ana', apellido: 'Pérez', rol: 'ESTUDIANTE' },
      error: null,
    })

    const { getPerfil } = await import('@/lib/supabase/perfiles')
    const { data, error } = await getPerfil('user-123')

    expect(error).toBeNull()
    expect(data?.rol).toBe('ESTUDIANTE')
    expect(mockFrom).toHaveBeenCalledWith('perfiles')
    expect(mockEq).toHaveBeenCalledWith('id', 'user-123')
  })

  it('debería retornar error si el perfil no existe', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'No rows found' },
    })

    const { getPerfil } = await import('@/lib/supabase/perfiles')
    const { data, error } = await getPerfil('user-inexistente')

    expect(error?.message).toBe('No rows found')
    expect(data).toBeNull()
  })
})