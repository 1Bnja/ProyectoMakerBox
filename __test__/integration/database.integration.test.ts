import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockFrom = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
    from: mockFrom,
  })),
}))

describe('Integración Supabase Database', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('debería obtener datos de la base de datos correctamente', async () => {
    const mockData = [
      { id: 1, nombre: 'Proyecto Alpha' },
      { id: 2, nombre: 'Proyecto Beta' },
    ]

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      }),
    })

    const { getSupabaseClient } = await import('@/lib/supabase/client')
    const client = getSupabaseClient()
    const { data, error } = await client.from('proyectos').select('*').limit(10)

    expect(error).toBeNull()
    expect(data).toHaveLength(2)
    expect(data?.[0].nombre).toBe('Proyecto Alpha')
    expect(mockFrom).toHaveBeenCalledWith('proyectos')
  })

  it('debería retornar arreglo vacío cuando la tabla no tiene registros', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    })

    const { getSupabaseClient } = await import('@/lib/supabase/client')
    const client = getSupabaseClient()
    const { data, error } = await client.from('proyectos').select('*').limit(10)

    expect(error).toBeNull()
    expect(data).toHaveLength(0)
  })

  it('debería retornar error cuando falla la consulta a la base de datos', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'relation "proyectos" does not exist' },
        }),
      }),
    })

    const { getSupabaseClient } = await import('@/lib/supabase/client')
    const client = getSupabaseClient()
    const { data, error } = await client.from('proyectos').select('*').limit(10)

    expect(data).toBeNull()
    expect(error?.message).toContain('does not exist')
  })

  it('debería lanzar error si faltan las variables de entorno de Supabase', async () => {
    vi.unstubAllEnvs()

    const { getSupabaseClient } = await import('@/lib/supabase/client')

    expect(() => getSupabaseClient()).toThrow(
      'Faltan las variables de entorno de Supabase'
    )
  })

  it('debería reutilizar la misma instancia del cliente (singleton)', async () => {
    const { createBrowserClient } = await import('@supabase/ssr')
    const { getSupabaseClient } = await import('@/lib/supabase/client')

    const client1 = getSupabaseClient()
    const client2 = getSupabaseClient()

    expect(client1).toBe(client2)
    expect(createBrowserClient).toHaveBeenCalledOnce()
  })
})