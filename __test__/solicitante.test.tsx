import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SolicitantePage from '@/app/(dashboard)/solicitante/page'

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => '/solicitante',
    useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/lib/supabase/client', () => ({
    getSupabaseClient: vi.fn(() => ({
        storage: {
            from: vi.fn().mockReturnThis(),
            upload: vi.fn().mockResolvedValue({ data: { path: 'modelos/prueba.stl' }, error: null }),
        },
    })),
}))

const historialFixture = [
    {
        id: 's1',
        tipo: 'PERSONAL',
        estado: 'PENDIENTE',
        comentario: 'Proyecto: Engranaje. Descripción: pieza. Notas: ninguna.',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        created_at: '2026-06-14T00:00:00Z',
    },
]

function mockFetchSolicitante(ok = true) {
    global.fetch = vi.fn((url: string | Request | URL) => {
        const u = url.toString()

        if (u.includes('/api/solicitudes')) {
            return Promise.resolve({
                ok,
                json: () => Promise.resolve(ok ? historialFixture : { error: 'No autorizado' }),
            })
        }

        if (u.includes('/api/auth/me')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ nombre: 'Solicitante', apellido: 'Test', rol: 'SOLICITANTE' }),
            })
        }

        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    }) as unknown as typeof fetch
}

describe('Dashboard Solicitante - Mis solicitudes (datos reales)', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('muestra "Cargando solicitudes..." mientras llega la respuesta', () => {
        mockFetchSolicitante()
        render(<SolicitantePage />)

        fireEvent.click(screen.getByText(/mis solicitudes/i))
        expect(screen.getByText('Cargando solicitudes...')).toBeInTheDocument()
    })

    it('carga y muestra el historial propio desde la API', async () => {
        mockFetchSolicitante()
        render(<SolicitantePage />)

        fireEvent.click(screen.getByText(/mis solicitudes/i))

        await waitFor(() => expect(screen.getByText('Proyecto: Engranaje. Descripción: pieza. Notas: ninguna.')).toBeInTheDocument())
        expect(global.fetch).toHaveBeenCalledWith('/api/solicitudes')
    })

    it('muestra un error si la petición falla', async () => {
        mockFetchSolicitante(false)
        render(<SolicitantePage />)

        fireEvent.click(screen.getByText(/mis solicitudes/i))

        await waitFor(() => expect(screen.getByText('No autorizado')).toBeInTheDocument())
    })
})
