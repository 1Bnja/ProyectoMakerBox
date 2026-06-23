import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SolicitudDetalleModal } from '@/app/components/SolicitudDetalleModal'

const detalleFixture = {
    id: 's1',
    tipo: 'PERSONAL',
    estado: 'PENDIENTE',
    comentario: 'Pieza de prueba',
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
    archivo_url: 'https://example.com/signed/a.stl' as string | null,
    solicitante: { nombre: 'Benjamín', apellido: 'Silva' },
}

function mockFetchDetalle(
    overrides: Partial<typeof detalleFixture> = {},
    ok = true,
    patchOk = true
) {
    global.fetch = vi.fn((url: string | Request | URL, init?: RequestInit) => {
        const u = url.toString()
        if (init?.method === 'PATCH') {
            const body = JSON.parse((init.body as string) ?? '{}')
            return Promise.resolve({
                ok: patchOk,
                json: () =>
                    Promise.resolve(
                        patchOk
                            ? { id: 's1', estado: body.estado }
                            : { error: 'No se pudo actualizar la solicitud' }
                    ),
            })
        }
        if (u.includes('/api/solicitudes/')) {
            return Promise.resolve({
                ok,
                json: () => Promise.resolve(ok ? { ...detalleFixture, ...overrides } : { error: 'Solicitud no encontrada' }),
            })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    }) as unknown as typeof fetch
}

describe('SolicitudDetalleModal', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('muestra "Cargando..." mientras llega el detalle', () => {
        mockFetchDetalle()
        render(<SolicitudDetalleModal id="s1" onClose={vi.fn()} onCambioEstado={vi.fn()} />)
        expect(screen.getByText('Cargando...')).toBeInTheDocument()
    })

    it('muestra el detalle completo una vez cargado', async () => {
        mockFetchDetalle()
        render(<SolicitudDetalleModal id="s1" onClose={vi.fn()} onCambioEstado={vi.fn()} />)

        await waitFor(() => expect(screen.getByText('Pieza de prueba')).toBeInTheDocument())
        expect(screen.getByText('Benjamín Silva')).toBeInTheDocument()
        expect(screen.getByText('Ver archivo STL')).toBeInTheDocument()
    })

    it('muestra "Archivo no disponible" cuando archivo_url es null', async () => {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        mockFetchDetalle({ archivo_url: null })
        render(<SolicitudDetalleModal id="s1" onClose={vi.fn()} onCambioEstado={vi.fn()} />)

        await waitFor(() => expect(screen.getByText('Archivo no disponible')).toBeInTheDocument())
    })

    it('muestra un mensaje de error si la petición falla', async () => {
        mockFetchDetalle({}, false)
        render(<SolicitudDetalleModal id="s1" onClose={vi.fn()} onCambioEstado={vi.fn()} />)

        await waitFor(() => expect(screen.getByText('Solicitud no encontrada')).toBeInTheDocument())
    })

    it('exige un motivo antes de rechazar', async () => {
        mockFetchDetalle()
        const alertaMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
        render(<SolicitudDetalleModal id="s1" onClose={vi.fn()} onCambioEstado={vi.fn()} />)

        await waitFor(() => expect(screen.getByText('Pieza de prueba')).toBeInTheDocument())
        fireEvent.click(screen.getByRole('button', { name: /rechazar/i }))

        expect(alertaMock).toHaveBeenCalledWith('Debe ingresar un motivo para rechazar la solicitud')
        alertaMock.mockRestore()
    })

    it('aprueba la solicitud y llama a onCambioEstado y onClose', async () => {
        mockFetchDetalle()
        const onCambioEstado = vi.fn()
        const onClose = vi.fn()
        render(<SolicitudDetalleModal id="s1" onClose={onClose} onCambioEstado={onCambioEstado} />)

        await waitFor(() => expect(screen.getByText('Pieza de prueba')).toBeInTheDocument())
        fireEvent.click(screen.getByRole('button', { name: /aprobar/i }))

        await waitFor(() => expect(onCambioEstado).toHaveBeenCalled())
        expect(onClose).toHaveBeenCalled()
    })

    it('rechaza con motivo y llama a onCambioEstado y onClose', async () => {
        mockFetchDetalle()
        const onCambioEstado = vi.fn()
        const onClose = vi.fn()
        render(<SolicitudDetalleModal id="s1" onClose={onClose} onCambioEstado={onCambioEstado} />)

        await waitFor(() => expect(screen.getByText('Pieza de prueba')).toBeInTheDocument())
        fireEvent.change(screen.getByPlaceholderText('Motivo de rechazo'), {
            target: { value: 'No cumple normas' },
        })
        fireEvent.click(screen.getByRole('button', { name: /rechazar/i }))

        await waitFor(() => expect(onCambioEstado).toHaveBeenCalled())
        expect(onClose).toHaveBeenCalled()
    })

    it('muestra un error y NO cierra el modal si el PATCH falla', async () => {
        mockFetchDetalle({}, true, false)
        const onCambioEstado = vi.fn()
        const onClose = vi.fn()
        render(<SolicitudDetalleModal id="s1" onClose={onClose} onCambioEstado={onCambioEstado} />)

        await waitFor(() => expect(screen.getByText('Pieza de prueba')).toBeInTheDocument())
        fireEvent.click(screen.getByRole('button', { name: /aprobar/i }))

        await waitFor(() => expect(screen.getByText('No se pudo actualizar la solicitud')).toBeInTheDocument())
        expect(onCambioEstado).not.toHaveBeenCalled()
        expect(onClose).not.toHaveBeenCalled()
    })

    it('llama a onClose al hacer clic en "Cerrar"', async () => {
        mockFetchDetalle()
        const onClose = vi.fn()
        render(<SolicitudDetalleModal id="s1" onClose={onClose} onCambioEstado={vi.fn()} />)

        await waitFor(() => expect(screen.getByText('Pieza de prueba')).toBeInTheDocument())
        fireEvent.click(screen.getByText('Cerrar'))

        expect(onClose).toHaveBeenCalled()
    })
})
