import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProfesorPage from '@/app/(dashboard)/profesor/page'

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => '/profesor',
    useSearchParams: () => new URLSearchParams(),
}))

const cursosFixture = [
    {
        id: 'c1',
        nombre: 'Construcción de Software',
        sigla: 'ICI-301',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        semestre_id: null,
        activo: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ayudante_id: null,
        ayudante: null,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        profesor_id: 'p1',
        profesor: null,
        estudiantes: 5,
    },
]

const estudiantesFixture = [
    {
        id: 'e1',
        nombre: 'Ana',
        apellido: 'Pérez',
        email: 'ana@test.com',
        activo: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        curso_id: 'c1',
        cursos: { nombre: 'Construcción de Software' },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        cursos_asociados: [{ id: 'c1', nombre: 'Construcción de Software' }],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        grupos_asociados: [],
    },
]

// eslint-disable-next-line @typescript-eslint/naming-convention
const gruposFixture = [{ id: 'g1', nombre: 'Grupo A', curso_id: 'c1' }]

const solicitudesFixture = [
    {
        id: 's1',
        tipo: 'ACADEMICA',
        estado: 'PENDIENTE',
        comentario: 'Pieza para el proyecto final',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        created_at: '2026-06-14T00:00:00Z',
        solicitante: { nombre: 'Ana', apellido: 'Pérez' },
    },
]

function mockFetchProfesor() {
    global.fetch = vi.fn((url: string | Request | URL, init?: RequestInit) => {
        const u = url.toString()

        if (u.includes('/api/grupos?curso_id=c1')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(gruposFixture) })
        }
        if (u.endsWith('/api/grupos') && init?.method === 'POST') {
            return Promise.resolve({
                ok: true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                json: () => Promise.resolve({ id: 'g2', nombre: 'Grupo B', curso_id: 'c1' }),
            })
        }
        if (u.includes('/api/cursos')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(cursosFixture) })
        }
        if (u.includes('/api/estudiantes')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(estudiantesFixture) })
        }
        if (u.includes('/api/solicitudes')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(solicitudesFixture) })
        }
        if (u.includes('/api/auth/me')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ nombre: 'Rodrigo', apellido: 'Pavez', rol: 'PROFESOR' }),
            })
        }

        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    }) as unknown as typeof fetch
}

describe('Dashboard Profesor', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('muestra la lista de sus cursos en la pestaña Cursos (default)', async () => {
        mockFetchProfesor()
        render(<ProfesorPage />)

        expect(screen.getByText('Cargando cursos...')).toBeInTheDocument()
        await waitFor(() => expect(screen.getByText('Construcción de Software')).toBeInTheDocument())
        expect(screen.getByText('ICI-301')).toBeInTheDocument()
    })

    it('la pestaña Estudiantes muestra a los estudiantes de sus cursos en modo solo lectura', async () => {
        mockFetchProfesor()
        render(<ProfesorPage />)

        fireEvent.click(screen.getByText('Estudiantes'))

        await waitFor(() => expect(screen.getByText('Ana Pérez')).toBeInTheDocument())
        expect(screen.queryByText('Editar')).not.toBeInTheDocument()
        expect(screen.getByText('Asignar grupo')).toBeInTheDocument()
    })

    it('la pestaña Grupos permite ver y crear grupos del curso seleccionado', async () => {
        mockFetchProfesor()
        const { container } = render(<ProfesorPage />)

        await waitFor(() => expect(screen.getByText('Construcción de Software')).toBeInTheDocument())
        fireEvent.click(screen.getByText('Grupos'))

        const cursoSelect = container.querySelector('select') as HTMLSelectElement
        fireEvent.change(cursoSelect, { target: { value: 'c1' } })

        await waitFor(() => expect(screen.getByText('Grupo A')).toBeInTheDocument())

        fireEvent.click(screen.getByText('+ Nuevo Grupo'))
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Grupo B' } })
        fireEvent.click(screen.getByText('Crear Grupo'))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/grupos',
                expect.objectContaining({
                    method: 'POST',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    body: JSON.stringify({ nombre: 'Grupo B', curso_id: 'c1' }),
                })
            )
        })
        await waitFor(() => expect(screen.getByText('Grupo B')).toBeInTheDocument())
    })

    it('la pestaña Solicitudes muestra las solicitudes de sus estudiantes', async () => {
        mockFetchProfesor()
        render(<ProfesorPage />)

        fireEvent.click(screen.getByText('Solicitudes'))

        await waitFor(() => expect(screen.getByText('Pieza para el proyecto final')).toBeInTheDocument())
        expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
    })

})
