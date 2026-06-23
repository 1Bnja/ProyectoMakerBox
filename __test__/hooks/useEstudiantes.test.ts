import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useEstudiantes } from '@/app/hooks/useEstudiantes'

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

describe('useEstudiantes', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('carga estudiantes y cursos al montar', async () => {
        mockFetchSecuencia([
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { ok: true, data: [{ id: '1', nombre: 'Ana', apellido: 'Pérez', email: 'a@a.com', activo: true, curso_id: null, cursos: null }] },
            { ok: true, data: [{ id: 'c1', nombre: 'Curso 1' }] },
        ])

        const { result } = renderHook(() => useEstudiantes())

        expect(result.current.loading).toBe(true)

        await waitFor(() => expect(result.current.loading).toBe(false))

        expect(result.current.estudiantes).toHaveLength(1)
        expect(result.current.cursos).toHaveLength(1)
    })

    it('handleGuardarEstudiante limpia el formulario y recarga la lista cuando la creación es exitosa', async () => {
        mockFetchSecuencia([
            { ok: true, data: [] },
            { ok: true, data: [] },
        ])

        const { result } = renderHook(() => useEstudiantes())
        await waitFor(() => expect(result.current.loading).toBe(false))

        act(() => {
            result.current.form.setNombre('Juan')
            result.current.form.setEmail('juan@test.com')
        })

        mockFetchSecuencia([{ ok: true, data: { success: true } }, { ok: true, data: [] }])

        await act(async () => {
            await result.current.handleGuardarEstudiante({
                preventDefault: vi.fn(),
            } as unknown as React.FormEvent)
        })

        expect(result.current.form.nombre).toBe('')
        expect(result.current.form.submitting).toBe(false)
        expect(result.current.modalAbierto).toBe(false)
    })

    it('handleGuardarEstudiante muestra el error cuando la creación falla', async () => {
        mockFetchSecuencia([
            { ok: true, data: [] },
            { ok: true, data: [] },
        ])

        const { result } = renderHook(() => useEstudiantes())
        await waitFor(() => expect(result.current.loading).toBe(false))

        mockFetchSecuencia([{ ok: false, data: { error: 'Email ya registrado' } }])

        await act(async () => {
            await result.current.handleGuardarEstudiante({
                preventDefault: vi.fn(),
            } as unknown as React.FormEvent)
        })

        expect(result.current.form.error).toBe('Email ya registrado')
        expect(result.current.form.submitting).toBe(false)
    })

    it('abrirModalEditar precarga el formulario con los datos del estudiante', async () => {
        mockFetchSecuencia([
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { ok: true, data: [{ id: '1', nombre: 'Ana', apellido: 'Pérez', email: 'a@a.com', activo: true, curso_id: 'c1', cursos: { nombre: 'Curso 1' } }] },
            { ok: true, data: [{ id: 'c1', nombre: 'Curso 1' }] },
        ])

        const { result } = renderHook(() => useEstudiantes())
        await waitFor(() => expect(result.current.loading).toBe(false))

        act(() => {
            result.current.abrirModalEditar(result.current.estudiantes[0])
        })

        expect(result.current.editando).toBe(true)
        expect(result.current.modalAbierto).toBe(true)
        expect(result.current.form.nombre).toBe('Ana')
        expect(result.current.form.apellido).toBe('Pérez')
        expect(result.current.form.cursoId).toBe('c1')
    })

    it('handleGuardarEstudiante envía PATCH con nombre/apellido/curso_id cuando se está editando', async () => {
        mockFetchSecuencia([
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { ok: true, data: [{ id: '1', nombre: 'Ana', apellido: 'Pérez', email: 'a@a.com', activo: true, curso_id: null, cursos: null }] },
            { ok: true, data: [] },
        ])

        const { result } = renderHook(() => useEstudiantes())
        await waitFor(() => expect(result.current.loading).toBe(false))

        act(() => {
            result.current.abrirModalEditar(result.current.estudiantes[0])
            result.current.form.setCursoId('c1')
        })

        mockFetchSecuencia([{ ok: true, data: {} }, { ok: true, data: [] }])

        await act(async () => {
            await result.current.handleGuardarEstudiante({
                preventDefault: vi.fn(),
            } as unknown as React.FormEvent)
        })

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/estudiantes/1',
            expect.objectContaining({ method: 'PATCH' })
        )
        expect(result.current.modalAbierto).toBe(false)
    })

    it('handleToggleActivo recarga la lista cuando el PATCH es exitoso', async () => {
        mockFetchSecuencia([
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { ok: true, data: [{ id: '1', nombre: 'Ana', apellido: 'Pérez', email: 'a@a.com', activo: true, curso_id: null, cursos: null }] },
            { ok: true, data: [] },
        ])

        const { result } = renderHook(() => useEstudiantes())
        await waitFor(() => expect(result.current.loading).toBe(false))

        mockFetchSecuencia([{ ok: true, data: {} }, { ok: true, data: [] }])

        await act(async () => {
            await result.current.handleToggleActivo(result.current.estudiantes[0])
        })

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/estudiantes/1',
            expect.objectContaining({ method: 'PATCH' })
        )
    })

    it('no actualiza la lista de estudiantes ni cursos cuando las peticiones iniciales fallan', async () => {
        mockFetchSecuencia([
            { ok: false, data: {} },
            { ok: false, data: {} },
        ])

        const { result } = renderHook(() => useEstudiantes())
        await waitFor(() => expect(result.current.loading).toBe(false))

        expect(result.current.estudiantes).toEqual([])
        expect(result.current.cursos).toEqual([])
    })

    it('no recarga la lista cuando el PATCH de handleToggleActivo falla', async () => {
        mockFetchSecuencia([
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { ok: true, data: [{ id: '1', nombre: 'Ana', apellido: 'Pérez', email: 'a@a.com', activo: true, curso_id: null, cursos: null }] },
            { ok: true, data: [] },
        ])

        const { result } = renderHook(() => useEstudiantes())
        await waitFor(() => expect(result.current.loading).toBe(false))

        mockFetchSecuencia([{ ok: false, data: {} }])

        await act(async () => {
            await result.current.handleToggleActivo(result.current.estudiantes[0])
        })

        expect(global.fetch).toHaveBeenCalledTimes(1)
    })
})
