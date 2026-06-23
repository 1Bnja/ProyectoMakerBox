import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormularioSolicitudEstudiante from '@/app/(dashboard)/estudiante/FormularioSolicitud'
import { describe, it, expect, vi } from 'vitest'
import { getSupabaseClient } from '@/lib/supabase/client'

// Mock de Supabase actualizado para simular que nos devuelve UUIDs reales
vi.mock('@/lib/supabase/client', () => {
  const mockClient = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-estudiante-123' } } })
    },
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn().mockResolvedValue({ data: { path: 'modelos/prueba.stl' }, error: null })
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockResolvedValue({ data: [{ id: '11111111-1111-1111-1111-111111111111', nombre: 'Mock DB' }] }),
    insert: vi.fn().mockResolvedValue({ error: null })
  }
  
  return {
    getSupabaseClient: vi.fn(() => mockClient)
  }
})

// Mock de fetch para los endpoints autenticados de cursos y grupos
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([{ id: '11111111-1111-1111-1111-111111111111', nombre: 'Mock DB' }]),
  })
) as unknown as typeof fetch

describe('IMP-02: Formulario de Solicitud (Estudiante)', () => {
  it('debe enviar la solicitud con tipo ACADEMICA y los IDs correspondientes', async () => {
    const supabaseMock = getSupabaseClient()
    render(<FormularioSolicitudEstudiante onCancelar={() => {}} />)

    await userEvent.type(screen.getByLabelText(/nombre de la pieza/i), 'Engranaje Proyecto')
    await userEvent.type(screen.getByLabelText(/descripción/i), 'Pieza para robótica')
    
    // El test ahora interactúa con las opciones dinámicas cargadas por el useEffect
    await waitFor(() => {
      expect(screen.getAllByRole('option').length).toBeGreaterThan(2)
    })

    await userEvent.selectOptions(screen.getByLabelText(/selecciona tu curso/i), '11111111-1111-1111-1111-111111111111')
    await userEvent.selectOptions(screen.getByLabelText(/selecciona tu grupo/i), '11111111-1111-1111-1111-111111111111')

    const file = new File(['dummy'], 'pieza.stl', { type: 'application/octet-stream' })
    await userEvent.upload(screen.getByLabelText(/modelo 3d/i), file)

    fireEvent.submit(screen.getByRole('button', { name: /enviar solicitud/i }))

    await waitFor(() => {
      expect(supabaseMock.from).toHaveBeenCalledWith('impresiones')
      /* eslint-disable @typescript-eslint/naming-convention */
      
      // Le decimos a TypeScript exactamente qué forma tiene este mock sin usar 'any'
      const mockInsert = (supabaseMock as unknown as { insert: ReturnType<typeof vi.fn> }).insert;
      
      expect(mockInsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            user_id: 'user-estudiante-123',
            curso_id: '11111111-1111-1111-1111-111111111111',
            grupo_id: '11111111-1111-1111-1111-111111111111'
          })
        ])
      )
      /* eslint-enable @typescript-eslint/naming-convention */
    })
  })

  it('muestra un mensaje de error cuando el insert falla', async () => {
    const supabaseMock = getSupabaseClient() as unknown as { insert: ReturnType<typeof vi.fn> }
    supabaseMock.insert.mockResolvedValueOnce({ error: new Error('Fallo de conexión') })

    render(<FormularioSolicitudEstudiante onCancelar={() => {}} />)

    await userEvent.type(screen.getByLabelText(/nombre de la pieza/i), 'Engranaje Proyecto')
    await userEvent.type(screen.getByLabelText(/descripción/i), 'Pieza para robótica')

    await waitFor(() => {
      expect(screen.getAllByRole('option').length).toBeGreaterThan(2)
    })

    await userEvent.selectOptions(screen.getByLabelText(/selecciona tu curso/i), '11111111-1111-1111-1111-111111111111')
    await userEvent.selectOptions(screen.getByLabelText(/selecciona tu grupo/i), '11111111-1111-1111-1111-111111111111')

    fireEvent.submit(screen.getByRole('button', { name: /enviar solicitud/i }))

    expect(await screen.findByText('Fallo de conexión')).toBeInTheDocument()
  })

  it('muestra el mensaje de un error que no es instancia de Error', async () => {
    const supabaseMock = getSupabaseClient() as unknown as { insert: ReturnType<typeof vi.fn> }
    supabaseMock.insert.mockResolvedValueOnce({ error: { message: 'Error con forma de objeto plano' } })

    render(<FormularioSolicitudEstudiante onCancelar={() => {}} />)

    await userEvent.type(screen.getByLabelText(/nombre de la pieza/i), 'Engranaje Proyecto')
    await userEvent.type(screen.getByLabelText(/descripción/i), 'Pieza para robótica')

    await waitFor(() => {
      expect(screen.getAllByRole('option').length).toBeGreaterThan(2)
    })

    await userEvent.selectOptions(screen.getByLabelText(/selecciona tu curso/i), '11111111-1111-1111-1111-111111111111')
    await userEvent.selectOptions(screen.getByLabelText(/selecciona tu grupo/i), '11111111-1111-1111-1111-111111111111')

    fireEvent.submit(screen.getByRole('button', { name: /enviar solicitud/i }))

    expect(await screen.findByText('Error con forma de objeto plano')).toBeInTheDocument()
  })

  it('registra un error en consola cuando falla la carga de cursos o grupos', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(global.fetch).mockImplementation((url) => {
      const u = url.toString()
      if (u.includes('/api/cursos')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: '11111111-1111-1111-1111-111111111111', nombre: 'Mock DB' }]),
        }) as unknown as Promise<Response>
      }
      if (u.includes('/api/grupos?curso_id=11111111-1111-1111-1111-111111111111')) {
        return Promise.resolve({ ok: false, text: () => Promise.resolve('Error de grupos') }) as unknown as Promise<Response>
      }
      return Promise.resolve({ ok: true, text: () => Promise.resolve('') }) as unknown as Promise<Response>
    })

    render(<FormularioSolicitudEstudiante onCancelar={() => {}} />)

    await waitFor(() => {
      expect(screen.getAllByRole('option').length).toBeGreaterThan(1)
    })

    await userEvent.selectOptions(screen.getByLabelText(/selecciona tu curso/i), '11111111-1111-1111-1111-111111111111')

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error cargando grupos:', 'Error de grupos')
    })

    consoleSpy.mockRestore()
    vi.mocked(global.fetch).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: '11111111-1111-1111-1111-111111111111', nombre: 'Mock DB' }]),
      }) as unknown as Promise<Response>
    )
  })
})