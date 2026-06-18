import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormularioSolicitudEstudiante from '@/app/(dashboard)/estudiante/FormularioSolicitud'
import { vi } from 'vitest'
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

describe('IMP-02: Formulario de Solicitud (Estudiante)', () => {
  it('debe enviar la solicitud con tipo CURSO y los IDs correspondientes', async () => {
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
      expect(supabaseMock.insert).toHaveBeenCalledWith(
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
})