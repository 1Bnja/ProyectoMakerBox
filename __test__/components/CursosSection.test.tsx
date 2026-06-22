import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CursosSection } from '@/app/components/CursosSection'

function mockFetchCursosUsuarios() {
    global.fetch = vi.fn((url: string | Request | URL) => {
        const u = url.toString()
        if (u.includes('/api/cursos')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
                    /* eslint-disable @typescript-eslint/naming-convention */
                    {
                        id: 'c1',
                        nombre: 'Diseño 3D Avanzado',
                        sigla: 'ING-301',
                        activo: true,
                        ayudante_id: 'a1',
                        ayudante: { nombre: 'Lukas', apellido: 'Avello' },
                        profesor_id: 'p1',
                        profesor: { nombre: 'Marta', apellido: 'Reyes' },
                        estudiantes: 24,
                    },
                    /* eslint-enable @typescript-eslint/naming-convention */
                ]),
            })
        }
        if (u.includes('/api/usuarios')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
                    { id: 'a1', nombre: 'Lukas', apellido: 'Avello', email: 'lukas@utalca.cl', rol: 'AYUDANTE', activo: true },
                    { id: 'p1', nombre: 'Marta', apellido: 'Reyes', email: 'marta@utalca.cl', rol: 'PROFESOR', activo: true },
                ]),
            })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    }) as unknown as typeof fetch
}

describe('CursosSection', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('muestra el estado de carga inicialmente', () => {
        mockFetchCursosUsuarios()
        render(<CursosSection />)
        expect(screen.getByText('Cargando cursos...')).toBeInTheDocument()
    })

    it('muestra la tabla de cursos una vez cargados', async () => {
        mockFetchCursosUsuarios()
        render(<CursosSection />)

        await waitFor(() => {
            expect(screen.getByText('Diseño 3D Avanzado')).toBeInTheDocument()
        })
        expect(screen.getByText('ING-301')).toBeInTheDocument()
        expect(screen.getByText('Lukas Avello')).toBeInTheDocument()
        expect(screen.getByText('Marta Reyes')).toBeInTheDocument()
    })

    it('abre el modal de creación al hacer clic en "+ Nuevo Curso"', async () => {
        mockFetchCursosUsuarios()
        render(<CursosSection />)

        await waitFor(() => expect(screen.getByText('Diseño 3D Avanzado')).toBeInTheDocument())

        fireEvent.click(screen.getByText('+ Nuevo Curso'))

        expect(screen.getByRole('heading', { name: 'Crear nuevo curso' })).toBeInTheDocument()
    })

    it('abre el modal de edición con los datos precargados al hacer clic en "Editar"', async () => {
        mockFetchCursosUsuarios()
        const { container } = render(<CursosSection />)

        await waitFor(() => expect(screen.getByText('Diseño 3D Avanzado')).toBeInTheDocument())

        fireEvent.click(screen.getByText('Editar'))

        expect(screen.getByRole('heading', { name: 'Editar curso' })).toBeInTheDocument()
        const nombreInput = container.querySelector('input[type="text"]') as HTMLInputElement
        expect(nombreInput).toHaveValue('Diseño 3D Avanzado')

        const selects = container.querySelectorAll('select')
        const profesorSelect = selects[1] as HTMLSelectElement
        expect(profesorSelect).toHaveValue('p1')
    })

    it('lista las opciones de profesor disponibles en el formulario de creación', async () => {
        mockFetchCursosUsuarios()
        const { container } = render(<CursosSection />)

        await waitFor(() => expect(screen.getByText('Diseño 3D Avanzado')).toBeInTheDocument())
        fireEvent.click(screen.getByText('+ Nuevo Curso'))

        const selects = container.querySelectorAll('select')
        const profesorSelect = selects[1] as HTMLSelectElement
        expect(profesorSelect).toHaveValue('')
        expect(screen.getByRole('option', { name: 'Marta Reyes' })).toBeInTheDocument()

        fireEvent.change(profesorSelect, { target: { value: 'p1' } })
        expect(profesorSelect).toHaveValue('p1')
    })

    it('permite escribir nombre y sigla y enviar el formulario de creación', async () => {
        mockFetchCursosUsuarios()
        const { container } = render(<CursosSection />)

        await waitFor(() => expect(screen.getByText('Diseño 3D Avanzado')).toBeInTheDocument())
        fireEvent.click(screen.getByText('+ Nuevo Curso'))

        const nombreInput = container.querySelector('input[type="text"]') as HTMLInputElement
        const siglaInput = container.querySelectorAll('input[type="text"]')[1] as HTMLInputElement

        fireEvent.change(nombreInput, { target: { value: 'Curso Nuevo' } })
        fireEvent.change(siglaInput, { target: { value: 'ING-999' } })

        expect(nombreInput).toHaveValue('Curso Nuevo')
        expect(siglaInput).toHaveValue('ING-999')

        fireEvent.click(screen.getByText('Crear Curso'))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/cursos',
                expect.objectContaining({ method: 'POST' })
            )
        })
    })

    it('cierra el modal al hacer clic en Cancelar', async () => {
        mockFetchCursosUsuarios()
        render(<CursosSection />)

        await waitFor(() => expect(screen.getByText('Diseño 3D Avanzado')).toBeInTheDocument())
        fireEvent.click(screen.getByText('+ Nuevo Curso'))
        expect(screen.getByRole('heading', { name: 'Crear nuevo curso' })).toBeInTheDocument()

        fireEvent.click(screen.getByText('Cancelar'))

        expect(screen.queryByRole('heading', { name: 'Crear nuevo curso' })).not.toBeInTheDocument()
    })

    it('llama a handleToggleActivo al hacer clic en el toggle de la fila', async () => {
        mockFetchCursosUsuarios()
        render(<CursosSection />)

        await waitFor(() => expect(screen.getByText('Diseño 3D Avanzado')).toBeInTheDocument())

        fireEvent.click(screen.getByText('Desactivar'))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/cursos/c1',
                expect.objectContaining({ method: 'PATCH' })
            )
        })
    })
})
