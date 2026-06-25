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

const bloquesFixture = [
    // eslint-disable-next-line @typescript-eslint/naming-convention
    { id: 'b1', dia: 'LUNES', hora_inicio: '09:00:00', hora_fin: '10:00:00' },
]

function mockFetchSolicitante(ok = true) {
    global.fetch = vi.fn((url: string | Request | URL, init?: RequestInit) => {
        const u = url.toString()

        if (u.includes('/api/reservas-sala') && init?.method === 'POST') {
            return Promise.resolve({
                ok: true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                json: () => Promise.resolve({ id: 'r1', fecha: '2026-06-22', actividad: null, created_at: '2026-06-14T00:00:00Z' }),
            })
        }
        if (u.includes('/api/disponibilidad-sala')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(bloquesFixture) })
        }

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

describe('RES-01: Dashboard Solicitante - Reservar Sala', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('al elegir una fecha, carga los bloques disponibles y permite reservar uno', async () => {
        mockFetchSolicitante()
        render(<SolicitantePage />)

        fireEvent.click(screen.getByText(/reservar sala/i))

        const inputFecha = document.getElementById('fechaSala') as HTMLInputElement
        fireEvent.change(inputFecha, { target: { value: '2026-06-22' } })

        await waitFor(() => expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument())

        fireEvent.click(screen.getByText('09:00 - 10:00'))
        fireEvent.click(screen.getByText('Solicitar Reserva'))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/reservas-sala',
                expect.objectContaining({ method: 'POST' })
            )
        })
        await waitFor(() => expect(screen.getByText('¡Reserva de sala creada exitosamente!')).toBeInTheDocument())
    })

    it('si la fecha elegida es fin de semana, avisa que la sala no opera y no consulta la API', async () => {
        mockFetchSolicitante()
        render(<SolicitantePage />)

        fireEvent.click(screen.getByText(/reservar sala/i))

        const inputFecha = document.getElementById('fechaSala') as HTMLInputElement
        // 2026-06-28 es domingo
        fireEvent.change(inputFecha, { target: { value: '2026-06-28' } })

        await waitFor(() =>
            expect(screen.getByText('La sala no opera ese día (solo de lunes a viernes).')).toBeInTheDocument()
        )
        expect(global.fetch).not.toHaveBeenCalledWith(expect.stringContaining('/api/disponibilidad-sala?fecha=2026-06-28'))
    })

    it('muestra un error si se intenta reservar sin seleccionar un bloque', async () => {
        mockFetchSolicitante()
        const { container } = render(<SolicitantePage />)

        fireEvent.click(screen.getByText(/reservar sala/i))

        const form = container.querySelector('form') as HTMLFormElement
        fireEvent.submit(form)

        await waitFor(() =>
            expect(screen.getByText('Selecciona una fecha y un bloque horario disponible.')).toBeInTheDocument()
        )
    })
})
