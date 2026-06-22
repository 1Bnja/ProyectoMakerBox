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

function mockFetchAyudante() {
    global.fetch = vi.fn((url: string | Request | URL, init?: RequestInit) => {
        const u = url.toString()

        if (u.includes('/api/solicitudes/')) {
            const body = JSON.parse((init?.body as string) ?? '{}')
            return Promise.resolve({
                ok: true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                json: () => Promise.resolve({ id: 's1', estado: body.estado, motivo_rechazo: body.motivo_rechazo ?? null }),
            })
        }

        if (u.includes('/api/solicitudes')) {
            const params = new URL(u, 'http://localhost').searchParams
            const estado = params.get('estado')
            const data = estado ? solicitudesFixture.filter((s) => s.estado === estado) : solicitudesFixture
            return Promise.resolve({ ok: true, json: () => Promise.resolve(data) })
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

describe('IMP-03/IMP-04: Dashboard Ayudante - Solicitudes reales', () => {
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

    it('aprueba una solicitud pendiente con PATCH', async () => {
        mockFetchAyudante()
        render(<AyudantePage />)

        await waitFor(() => expect(screen.getByText('Benjamín Silva')).toBeInTheDocument())

        fireEvent.click(screen.getByRole('button', { name: /aprobar/i }))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/solicitudes/s1',
                expect.objectContaining({ method: 'PATCH' })
            )
        })
    })

    it('exige un motivo antes de rechazar', async () => {
        mockFetchAyudante()
        const alertaMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
        render(<AyudantePage />)

        await waitFor(() => expect(screen.getByText('Benjamín Silva')).toBeInTheDocument())

        fireEvent.click(screen.getByRole('button', { name: /rechazar/i }))

        expect(alertaMock).toHaveBeenCalledWith('Debe ingresar un motivo para rechazar la solicitud')
        alertaMock.mockRestore()
    })

    it('rechaza una solicitud con motivo y dispara el PATCH correspondiente', async () => {
        mockFetchAyudante()
        render(<AyudantePage />)

        await waitFor(() => expect(screen.getByText('Benjamín Silva')).toBeInTheDocument())

        fireEvent.change(screen.getByPlaceholderText('Motivo de rechazo'), {
            target: { value: 'El modelo tiene errores estructurales' },
        })
        fireEvent.click(screen.getByRole('button', { name: /rechazar/i }))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/solicitudes/s1',
                expect.objectContaining({ method: 'PATCH' })
            )
        })
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
        expect(screen.getByText('Disponibilidad de la sala para la semana.')).toBeInTheDocument()

        fireEvent.click(screen.getByText(/filamento/i))
        expect(screen.getByText('Registro de uso de filamento.')).toBeInTheDocument()
    })
})
