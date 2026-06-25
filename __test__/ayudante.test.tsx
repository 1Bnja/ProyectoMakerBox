import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AyudantePage from '@/app/(dashboard)/ayudante/page'

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => '/ayudante',
    useSearchParams: () => new URLSearchParams(),
}))

const solicitudesFixture = [
    {
        id: 's1',
        tipo: 'PERSONAL',
        estado: 'PENDIENTE',
        comentario: null,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        motivo_rechazo: null,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        created_at: '2026-06-14T00:00:00Z',
        solicitante: { nombre: 'Benjamín', apellido: 'Silva' },
    },
    {
        id: 's2',
        tipo: 'ACADEMICA',
        estado: 'APROBADA',
        comentario: null,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        motivo_rechazo: null,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        created_at: '2026-06-13T00:00:00Z',
        solicitante: { nombre: 'Ana', apellido: 'Torres' },
    },
]

const detalleFixture = {
    id: 's1',
    tipo: 'PERSONAL',
    estado: 'PENDIENTE',
    comentario: 'Pieza de prueba para el detalle',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    motivo_rechazo: null,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    created_at: '2026-06-14T00:00:00Z',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    diseno_path: null,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    diseno_url: null,
    colores: null,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    tiempo_estimado: null,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    observacion_ayudante: null,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    archivo_url: 'https://example.com/signed/a.stl',
    solicitante: { nombre: 'Benjamín', apellido: 'Silva' },
}

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
        profesor_id: null,
        profesor: null,
        estudiantes: 5,
    },
]

const bloquesFixture = [
    // eslint-disable-next-line @typescript-eslint/naming-convention
    { id: 'b1', dia: 'LUNES', hora_inicio: '09:00:00', hora_fin: '10:00:00', disponible: true },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    { id: 'b2', dia: 'LUNES', hora_inicio: '10:00:00', hora_fin: '11:00:00', disponible: false },
]

const reservasFixture = [
    {
        id: 'r1',
        fecha: '2026-06-22',
        actividad: 'Reunión de grupo',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        created_at: '2026-06-14T00:00:00Z',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        bloque: { dia: 'LUNES', hora_inicio: '09:00:00', hora_fin: '10:00:00' },
        solicitante: { nombre: 'Pedro', apellido: 'Pérez' },
    },
]

const gestionFixture = [
    // eslint-disable-next-line @typescript-eslint/naming-convention
    { id: 'b1', dia: 'LUNES', hora_inicio: '09:00:00', hora_fin: '10:00:00', disponible: true, reservaId: 'r1' },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    { id: 'b3', dia: 'LUNES', hora_inicio: '11:00:00', hora_fin: '12:00:00', disponible: true, reservaId: null },
]

function mockFetchAyudante() {
    global.fetch = vi.fn((url: string | Request | URL, init?: RequestInit) => {
        const u = url.toString()

        if (u.includes('/api/disponibilidad-sala/') && init?.method === 'PATCH') {
            const body = JSON.parse((init.body as string) ?? '{}')
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ ...bloquesFixture[0], id: 'b1', disponible: body.disponible }),
            })
        }
        if (u.includes('vista=gestion')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(gestionFixture) })
        }
        if (u.includes('/api/disponibilidad-sala')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(bloquesFixture) })
        }
        if (u.includes('/api/reservas-sala/') && init?.method === 'DELETE') {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) })
        }
        if (u.includes('/api/reservas-sala') && init?.method === 'POST') {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'r2', fecha: '2026-06-22', actividad: null }) })
        }
        if (u.includes('/api/reservas-sala')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(reservasFixture) })
        }

        if (u.includes('/api/grupos?curso_id=c1')) {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 'g1', nombre: 'Grupo A', curso_id: 'c1' }]) })
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

        if (u.includes('/api/solicitudes/')) {
            if (init?.method === 'PATCH') {
                const body = JSON.parse((init.body as string) ?? '{}')
                return Promise.resolve({
                    ok: true,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    json: () => Promise.resolve({ id: 's1', estado: body.estado, motivo_rechazo: body.motivo_rechazo ?? null }),
                })
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve(detalleFixture) })
        }

        if (u.includes('/api/solicitudes')) {
            const params = new URL(u, 'http://localhost').searchParams
            const estado = params.get('estado')
            const data = estado ? solicitudesFixture.filter((s) => s.estado === estado) : solicitudesFixture
            return Promise.resolve({ ok: true, json: () => Promise.resolve(data) })
        }

        if (u.includes('/api/articulos')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
        }

        if (u.includes('/api/auth/me')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ nombre: 'Ayudante', apellido: 'Test', rol: 'AYUDANTE' }),
            })
        }

        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    }) as unknown as typeof fetch
}

describe('IMP-03/IMP-04/IMP-05: Dashboard Ayudante - Solicitudes reales', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('carga y muestra las solicitudes desde la API', async () => {
        mockFetchAyudante()
        render(<AyudantePage />)

        await waitFor(() => expect(screen.getByText('Benjamín Silva')).toBeInTheDocument())
        expect(screen.getByText('Ana Torres')).toBeInTheDocument()
    })

    it('al filtrar por estado, vuelve a pedir la lista con el query param', async () => {
        mockFetchAyudante()
        render(<AyudantePage />)

        await waitFor(() => expect(screen.getByText('Benjamín Silva')).toBeInTheDocument())

        fireEvent.click(screen.getAllByText('APROBADA')[0])

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/solicitudes?estado=APROBADA')
        })
    })

    it('vuelve a pedir todas las solicitudes al hacer clic en "Todos"', async () => {
        mockFetchAyudante()
        render(<AyudantePage />)

        await waitFor(() => expect(screen.getByText('Benjamín Silva')).toBeInTheDocument())

        fireEvent.click(screen.getAllByText('APROBADA')[0])
        await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/solicitudes?estado=APROBADA'))

        fireEvent.click(screen.getByText('Todos'))
        await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/solicitudes'))
    })

    it('abre el modal de detalle al hacer clic en "Ver detalle" y muestra el comentario completo', async () => {
        mockFetchAyudante()
        render(<AyudantePage />)

        await waitFor(() => expect(screen.getByText('Benjamín Silva')).toBeInTheDocument())

        fireEvent.click(screen.getAllByText('Ver detalle')[0])

        await waitFor(() => expect(screen.getByText('Pieza de prueba para el detalle')).toBeInTheDocument())
        expect(screen.getByText('Ver archivo STL')).toBeInTheDocument()
    })

    it('aprueba desde el modal y refresca la lista', async () => {
        mockFetchAyudante()
        render(<AyudantePage />)

        await waitFor(() => expect(screen.getByText('Benjamín Silva')).toBeInTheDocument())
        fireEvent.click(screen.getAllByText('Ver detalle')[0])
        await waitFor(() => expect(screen.getByText('Pieza de prueba para el detalle')).toBeInTheDocument())

        fireEvent.click(screen.getByRole('button', { name: /aprobar/i }))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/solicitudes/s1',
                expect.objectContaining({ method: 'PATCH' })
            )
        })
        await waitFor(() => expect(screen.queryByText('Pieza de prueba para el detalle')).not.toBeInTheDocument())
    })

    it('cambia a todas las pestañas correctamente', async () => {
        mockFetchAyudante()
        render(<AyudantePage />)

        await waitFor(() => expect(screen.getByText('Benjamín Silva')).toBeInTheDocument())

        fireEvent.click(screen.getByText(/estudiantes/i))
        expect(screen.getByText('Estudiantes registrados en el sistema.')).toBeInTheDocument()

        fireEvent.click(screen.getByText(/inventario/i))
        expect(screen.getByText('Artículos disponibles en inventario.')).toBeInTheDocument()

        fireEvent.click(screen.getByText(/sala/i))
        await waitFor(() =>
            expect(screen.getByText('Gestiona las reservas y la disponibilidad de la sala interactiva.')).toBeInTheDocument()
        )

        fireEvent.click(screen.getByText(/filamento/i))
        expect(screen.getByText('Registro de uso de filamento.')).toBeInTheDocument()
    })

    it('en la pestaña Sala, la sección Horarios disponibles permite alternar disponibilidad y se muestran las reservas', async () => {
        mockFetchAyudante()
        render(<AyudantePage />)

        await waitFor(() => expect(screen.getByText('Benjamín Silva')).toBeInTheDocument())

        fireEvent.click(screen.getByText(/sala/i))
        await waitFor(() => expect(screen.getByText('09:00-10:00')).toBeInTheDocument())

        expect(screen.getByText('Pedro Pérez')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Deshabilitar'))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/disponibilidad-sala/b1',
                expect.objectContaining({
                    method: 'PATCH',
                    body: JSON.stringify({ disponible: false }),
                })
            )
        })
    })

    it('en la pestaña Sala, la vista Mes muestra un indicador de reservas y al hacer clic navega a la vista Día', async () => {
        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(new Date('2026-06-01T12:00:00Z'))
        mockFetchAyudante()
        render(<AyudantePage />)

        await waitFor(() => expect(screen.getByText('Benjamín Silva')).toBeInTheDocument())

        fireEvent.click(screen.getByText(/sala/i))
        await waitFor(() => expect(screen.getByText('09:00-10:00')).toBeInTheDocument())

        // reservasFixture tiene una reserva el 2026-06-22 -> el día 22 debe mostrar el badge "1"
        const dia22 = screen.getByText('22').closest('button') as HTMLButtonElement
        expect(dia22).toBeInTheDocument()

        fireEvent.click(dia22)

        await waitFor(() => expect(screen.getByText('11:00-12:00')).toBeInTheDocument())
        vi.useRealTimers()
    })

    it('en la pestaña Sala, la vista Día permite bloquear un horario libre y liberar uno reservado', async () => {
        mockFetchAyudante()
        render(<AyudantePage />)

        await waitFor(() => expect(screen.getByText('Benjamín Silva')).toBeInTheDocument())

        fireEvent.click(screen.getByText(/sala/i))
        await waitFor(() => expect(screen.getByText('09:00-10:00')).toBeInTheDocument())

        fireEvent.click(screen.getByText('Día'))

        const inputFecha = document.getElementById('fechaGestion') as HTMLInputElement
        fireEvent.change(inputFecha, { target: { value: '2026-06-22' } })

        await waitFor(() => expect(screen.getByText('11:00-12:00')).toBeInTheDocument())

        const liberarBtn = screen.getByText('Liberar')
        fireEvent.click(liberarBtn)

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/reservas-sala/r1',
                expect.objectContaining({ method: 'DELETE' })
            )
        })

        const bloquearBtns = screen.getAllByText('Bloquear')
        fireEvent.click(bloquearBtns[0])

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/reservas-sala',
                expect.objectContaining({ method: 'POST' })
            )
        })
    })

    it('en la pestaña Sala, la vista Día avisa si la fecha elegida es fin de semana', async () => {
        mockFetchAyudante()
        render(<AyudantePage />)

        await waitFor(() => expect(screen.getByText('Benjamín Silva')).toBeInTheDocument())

        fireEvent.click(screen.getByText(/sala/i))
        await waitFor(() => expect(screen.getByText('09:00-10:00')).toBeInTheDocument())

        fireEvent.click(screen.getByText('Día'))

        const inputFecha = document.getElementById('fechaGestion') as HTMLInputElement
        // 2026-06-28 es domingo
        fireEvent.change(inputFecha, { target: { value: '2026-06-28' } })

        await waitFor(() =>
            expect(screen.getByText('La sala no opera ese día (solo de lunes a viernes).')).toBeInTheDocument()
        )
        expect(global.fetch).not.toHaveBeenCalledWith(expect.stringContaining('vista=gestion'))
    })

    it('en la pestaña Sala, la vista Semana muestra los bloques de los 5 días y permite bloquear uno', async () => {
        mockFetchAyudante()
        render(<AyudantePage />)

        await waitFor(() => expect(screen.getByText('Benjamín Silva')).toBeInTheDocument())

        fireEvent.click(screen.getByText(/sala/i))
        await waitFor(() => expect(screen.getByText('09:00-10:00')).toBeInTheDocument())

        fireEvent.click(screen.getByText('Semana'))

        await waitFor(() => expect(screen.getAllByText('09:00-10:00').length).toBeGreaterThan(1))

        const bloquearBtns = screen.getAllByText('Bloquear')
        fireEvent.click(bloquearBtns[0])

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/reservas-sala',
                expect.objectContaining({ method: 'POST' })
            )
        })
    })

    it('la pestaña Grupos permite ver y crear grupos de cualquier curso', async () => {
        mockFetchAyudante()
        const { container } = render(<AyudantePage />)

        await waitFor(() => expect(screen.getByText('Benjamín Silva')).toBeInTheDocument())
        fireEvent.click(screen.getByText('Grupos'))

        await waitFor(() => expect(screen.getByText('Construcción de Software')).toBeInTheDocument())
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
})
