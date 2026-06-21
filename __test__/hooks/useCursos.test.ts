import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCursos } from '@/app/hooks/useCursos'

function mockFetchSecuencia(respuestas: Array<{ ok: boolean; data: unknown }>) {
    let i = 0
    global.fetch = vi.fn(() => {
        const r = respuestas[Math.min(i, respuestas.length - 1)]
        i++
        return Promise.resolve({
            ok: r.ok,
            json: () => Promise.resolve(r.data),
        })
    }) as unknown as typeof fetch
}

describe('useCursos', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('carga cursos y ayudantes al montar', async () => {
        mockFetchSecuencia([
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { ok: true, data: [{ id: 'c1', nombre: 'Curso 1', sigla: 'ING-101', activo: true, ayudante_id: null, ayudante: null, estudiantes: 0 }] },
            { ok: true, data: [{ id: 'a1', nombre: 'Lukas', apellido: 'Avello', rol: 'AYUDANTE' }, { id: 'p1', nombre: 'Ana', apellido: 'Soto', rol: 'PROFESOR' }] },
        ])

        const { result } = renderHook(() => useCursos())

        expect(result.current.loading).toBe(true)

        await waitFor(() => expect(result.current.loading).toBe(false))

        expect(result.current.cursos).toHaveLength(1)
        expect(result.current.ayudantes).toHaveLength(1)
        expect(result.current.ayudantes[0].nombre).toBe('Lukas')
    })

    it('abrirModalCrear limpia el formulario y abre el modal en modo creación', async () => {
        mockFetchSecuencia([
            { ok: true, data: [] },
            { ok: true, data: [] },
        ])

        const { result } = renderHook(() => useCursos())
        await waitFor(() => expect(result.current.loading).toBe(false))

        act(() => {
            result.current.abrirModalCrear()
        })

        expect(result.current.modalAbierto).toBe(true)
        expect(result.current.editando).toBe(false)
        expect(result.current.form.nombre).toBe('')
    })

    it('abrirModalEditar precarga el formulario con los datos del curso', async () => {
        mockFetchSecuencia([
            { ok: true, data: [] },
            { ok: true, data: [] },
        ])

        const { result } = renderHook(() => useCursos())
        await waitFor(() => expect(result.current.loading).toBe(false))

        act(() => {
            result.current.abrirModalEditar({
                id: 'c1',
                nombre: 'Curso 1',
                sigla: 'ING-101',
                activo: true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                ayudante_id: 'a1',
                ayudante: null,
                estudiantes: 0,
            })
        })

        expect(result.current.modalAbierto).toBe(true)
        expect(result.current.editando).toBe(true)
        expect(result.current.form.nombre).toBe('Curso 1')
        expect(result.current.form.sigla).toBe('ING-101')
        expect(result.current.form.ayudanteId).toBe('a1')
    })

    it('handleGuardarCurso crea un curso con POST cuando no se está editando', async () => {
        mockFetchSecuencia([
            { ok: true, data: [] },
            { ok: true, data: [] },
        ])

        const { result } = renderHook(() => useCursos())
        await waitFor(() => expect(result.current.loading).toBe(false))

        act(() => {
            result.current.abrirModalCrear()
            result.current.form.setNombre('Curso Nuevo')
        })

        mockFetchSecuencia([{ ok: true, data: { id: 'c2' } }, { ok: true, data: [] }])

        await act(async () => {
            await result.current.handleGuardarCurso({
                preventDefault: vi.fn(),
            } as unknown as React.FormEvent)
        })

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/cursos',
            expect.objectContaining({ method: 'POST' })
        )
        expect(result.current.modalAbierto).toBe(false)
    })

    it('handleGuardarCurso edita un curso con PATCH cuando se está editando', async () => {
        mockFetchSecuencia([
            { ok: true, data: [] },
            { ok: true, data: [] },
        ])

        const { result } = renderHook(() => useCursos())
        await waitFor(() => expect(result.current.loading).toBe(false))

        act(() => {
            result.current.abrirModalEditar({
                id: 'c1',
                nombre: 'Curso 1',
                sigla: null,
                activo: true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                ayudante_id: null,
                ayudante: null,
                estudiantes: 0,
            })
        })

        mockFetchSecuencia([{ ok: true, data: { id: 'c1' } }, { ok: true, data: [] }])

        await act(async () => {
            await result.current.handleGuardarCurso({
                preventDefault: vi.fn(),
            } as unknown as React.FormEvent)
        })

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/cursos/c1',
            expect.objectContaining({ method: 'PATCH' })
        )
    })

    it('handleGuardarCurso muestra el error cuando la petición falla', async () => {
        mockFetchSecuencia([
            { ok: true, data: [] },
            { ok: true, data: [] },
        ])

        const { result } = renderHook(() => useCursos())
        await waitFor(() => expect(result.current.loading).toBe(false))

        act(() => {
            result.current.abrirModalCrear()
        })

        mockFetchSecuencia([{ ok: false, data: { error: 'El nombre del curso es requerido' } }])

        await act(async () => {
            await result.current.handleGuardarCurso({
                preventDefault: vi.fn(),
            } as unknown as React.FormEvent)
        })

        expect(result.current.form.error).toBe('El nombre del curso es requerido')
        expect(result.current.form.submitting).toBe(false)
        expect(result.current.modalAbierto).toBe(true)
    })

    it('handleToggleActivo envía PATCH con el estado invertido', async () => {
        const curso = {
            id: 'c1',
            nombre: 'Curso 1',
            sigla: null,
            activo: true,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            ayudante_id: null,
            ayudante: null,
            estudiantes: 0,
        }

        mockFetchSecuencia([
            { ok: true, data: [curso] },
            { ok: true, data: [] },
        ])

        const { result } = renderHook(() => useCursos())
        await waitFor(() => expect(result.current.loading).toBe(false))

        mockFetchSecuencia([{ ok: true, data: {} }, { ok: true, data: [] }])

        await act(async () => {
            await result.current.handleToggleActivo(result.current.cursos[0])
        })

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/cursos/c1',
            expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ activo: false }) })
        )
    })
})
