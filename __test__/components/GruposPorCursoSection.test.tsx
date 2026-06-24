import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GruposPorCursoSection } from '@/app/components/GruposPorCursoSection'

const cursos = [
    { id: 'c1', nombre: 'Curso 1' },
    { id: 'c2', nombre: 'Curso 2' },
]

describe('GruposPorCursoSection', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('muestra el mensaje inicial sin curso seleccionado', () => {
        render(<GruposPorCursoSection accent="purple" cursos={cursos} />)
        expect(screen.getByText('Selecciona un curso para ver sus grupos.')).toBeInTheDocument()
    })

    it('si la petición de grupos falla, muestra la tabla vacía sin romper', async () => {
        global.fetch = vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({}) })) as unknown as typeof fetch

        render(<GruposPorCursoSection accent="purple" cursos={cursos} />)
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'c1' } })

        await waitFor(() => expect(screen.getByText('No hay registros disponibles')).toBeInTheDocument())
    })

    it('cierra el modal de creación al hacer clic en Cancelar', async () => {
        global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) })) as unknown as typeof fetch

        render(<GruposPorCursoSection accent="purple" cursos={cursos} />)
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'c1' } })
        await waitFor(() => expect(screen.getByText('No hay registros disponibles')).toBeInTheDocument())

        fireEvent.click(screen.getByText('+ Nuevo Grupo'))
        expect(screen.getByRole('heading', { name: 'Crear nuevo grupo' })).toBeInTheDocument()

        fireEvent.click(screen.getByText('Cancelar'))
        expect(screen.queryByRole('heading', { name: 'Crear nuevo grupo' })).not.toBeInTheDocument()
    })

    it('no envía el formulario si el nombre está vacío', async () => {
        const fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }))
        global.fetch = fetchMock as unknown as typeof fetch

        render(<GruposPorCursoSection accent="purple" cursos={cursos} />)
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'c1' } })
        await waitFor(() => expect(screen.getByText('No hay registros disponibles')).toBeInTheDocument())

        fireEvent.click(screen.getByText('+ Nuevo Grupo'))

        fetchMock.mockClear()
        fireEvent.click(screen.getByText('Crear Grupo'))
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it('muestra un error si la creación del grupo falla', async () => {
        global.fetch = vi.fn((url: string | Request | URL, init?: RequestInit) => {
            const u = url.toString()
            if (u.endsWith('/api/grupos') && init?.method === 'POST') {
                return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'No se pudo crear el grupo' }) })
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
        }) as unknown as typeof fetch

        render(<GruposPorCursoSection accent="purple" cursos={cursos} />)
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'c1' } })
        await waitFor(() => expect(screen.getByText('No hay registros disponibles')).toBeInTheDocument())

        fireEvent.click(screen.getByText('+ Nuevo Grupo'))
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Grupo X' } })
        fireEvent.click(screen.getByText('Crear Grupo'))

        await waitFor(() => expect(screen.getByText('No se pudo crear el grupo')).toBeInTheDocument())
        expect(screen.getByRole('heading', { name: 'Crear nuevo grupo' })).toBeInTheDocument()
    })
})
