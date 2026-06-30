import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import EstudiantePage from '@/app/(dashboard)/estudiante/page'

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => '/estudiante',
    useSearchParams: () => new URLSearchParams(),
}))

const solicitudesFixture = [
    {
        id: 's1',
        tipo: 'ACADEMICA',
        estado: 'PENDIENTE',
        comentario: 'Proyecto: Engranaje. Descripción: pieza para el módulo.',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        created_at: '2026-06-14T00:00:00Z',
    },
    {
        id: 's2',
        tipo: 'PERSONAL',
        estado: 'APROBADA',
        comentario: null,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        created_at: '2026-06-10T00:00:00Z',
    },
]

const ayudantiasFixture = [
    {
        id: 'a1',
        dia: 'LUNES',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        hora_inicio: '14:30:00',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        hora_fin: '16:00:00',
        cupos: 5,
        activo: true,
        curso: { nombre: 'Diseño 3D Avanzado' },
        ayudante: { nombre: 'Lukas', apellido: 'Avello' },
        inscritos: 1,
        inscrito: false,
        estudiantes: [{ nombre: 'Pedro', apellido: 'Pérez' }],
    },
]

function mockFetchEstudiante(ok = true) {
    global.fetch = vi.fn((url: string | Request | URL, init?: RequestInit) => {
        const u = url.toString()

        if (u.includes('/api/solicitudes')) {
            return Promise.resolve({
                ok,
                json: () => Promise.resolve(ok ? solicitudesFixture : { error: 'No autorizado' }),
            })
        }

        if (u.includes('/inscripcion') && init?.method === 'POST') {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) })
        }

        if (u.includes('/inscripcion') && init?.method === 'DELETE') {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) })
        }

        if (u.includes('/api/ayudantias')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(ayudantiasFixture) })
        }

        if (u.includes('/api/auth/me')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ nombre: 'Estudiante', apellido: 'Test', rol: 'ESTUDIANTE' }),
            })
        }

        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    }) as unknown as typeof fetch
}

describe('Dashboard Estudiante - Mis solicitudes (datos reales)', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('muestra "Cargando solicitudes..." mientras llega la respuesta', () => {
        mockFetchEstudiante()
        render(<EstudiantePage />)
        expect(screen.getByText('Cargando solicitudes...')).toBeInTheDocument()
    })

    it('carga y muestra las solicitudes propias desde la API', async () => {
        mockFetchEstudiante()
        render(<EstudiantePage />)

        await waitFor(() => expect(screen.getByText('Proyecto: Engranaje. Descripción: pieza para el módulo.')).toBeInTheDocument())
        expect(global.fetch).toHaveBeenCalledWith('/api/solicitudes')
    })

    it('muestra un error si la petición falla', async () => {
        mockFetchEstudiante(false)
        render(<EstudiantePage />)

        await waitFor(() => expect(screen.getByText('No autorizado')).toBeInTheDocument())
    })

    it('cambia a la pestaña de ayudantías correctamente', async () => {
        mockFetchEstudiante()
        render(<EstudiantePage />)

        await waitFor(() => expect(screen.queryByText('Cargando solicitudes...')).not.toBeInTheDocument())

        fireEvent.click(screen.getByText(/ayudantías/i))
        expect(screen.getByText('Ayudantías disponibles para inscripción.')).toBeInTheDocument()
    })

    it('en la pestaña Ayudantías, muestra las ayudantías disponibles y permite inscribirse', async () => {
        mockFetchEstudiante()
        render(<EstudiantePage />)

        fireEvent.click(screen.getByText(/ayudantías/i))

        await waitFor(() => expect(screen.getByText('Diseño 3D Avanzado')).toBeInTheDocument())
        expect(screen.getByText('1/5')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Inscribirse'))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/ayudantias/a1/inscripcion', { method: 'POST' })
        })
    })
})
