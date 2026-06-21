import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EstudiantesSection } from '@/app/components/EstudiantesSection'

function mockFetchEstudiantesCursos() {
    global.fetch = vi.fn((url: string | Request | URL) => {
        const u = url.toString()
        if (u.includes('/api/estudiantes')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    { id: '1', nombre: 'Ana', apellido: 'Pérez', email: 'ana@test.com', activo: true, curso_id: null, cursos: { nombre: 'Construcción de Software' } },
                ]),
            })
        }
        if (u.includes('/api/cursos')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 'c1', nombre: 'Curso 1' }]) })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    }) as unknown as typeof fetch
}

describe('EstudiantesSection', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('muestra el estado de carga inicialmente', () => {
        mockFetchEstudiantesCursos()
        render(
            <EstudiantesSection
                accent="purple"
                descripcion="Gestión de estudiantes"
                botonLabel="Agregar Estudiante"
                modalTitle="Crear Estudiante"
            />
        )
        expect(screen.getByText('Cargando estudiantes...')).toBeInTheDocument()
    })

    it('muestra la tabla de estudiantes una vez cargados', async () => {
        mockFetchEstudiantesCursos()
        render(
            <EstudiantesSection
                accent="purple"
                descripcion="Gestión de estudiantes"
                botonLabel="Agregar Estudiante"
                modalTitle="Crear Estudiante"
            />
        )

        await waitFor(() => {
            expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
        })
        expect(screen.getByText('Construcción de Software')).toBeInTheDocument()
    })

    it('abre el modal de creación al hacer clic en el botón', async () => {
        mockFetchEstudiantesCursos()
        render(
            <EstudiantesSection
                accent="purple"
                descripcion="Gestión de estudiantes"
                botonLabel="Agregar Estudiante"
                modalTitle="Crear Estudiante"
            />
        )

        await waitFor(() => expect(screen.getByText('Ana Pérez')).toBeInTheDocument())

        fireEvent.click(screen.getByText('Agregar Estudiante'))

        expect(screen.getByRole('heading', { name: 'Crear Estudiante' })).toBeInTheDocument()
    })

    it('cierra el modal al hacer clic en Cancelar', async () => {
        mockFetchEstudiantesCursos()
        render(
            <EstudiantesSection
                accent="purple"
                descripcion="Gestión de estudiantes"
                botonLabel="Agregar Estudiante"
                modalTitle="Crear Estudiante"
            />
        )

        await waitFor(() => expect(screen.getByText('Ana Pérez')).toBeInTheDocument())
        fireEvent.click(screen.getByText('Agregar Estudiante'))
        expect(screen.getByRole('heading', { name: 'Crear Estudiante' })).toBeInTheDocument()

        fireEvent.click(screen.getByText('Cancelar'))

        expect(screen.queryByRole('heading', { name: 'Crear Estudiante' })).not.toBeInTheDocument()
    })

    it('renderiza el contenido children bajo la tabla', async () => {
        mockFetchEstudiantesCursos()
        render(
            <EstudiantesSection
                accent="purple"
                descripcion="Gestión de estudiantes"
                botonLabel="Agregar Estudiante"
                modalTitle="Crear Estudiante"
            >
                <p>Tarjeta informativa</p>
            </EstudiantesSection>
        )

        await waitFor(() => expect(screen.getByText('Ana Pérez')).toBeInTheDocument())
        expect(screen.getByText('Tarjeta informativa')).toBeInTheDocument()
    })

    it('llama a handleToggleActivo al hacer clic en el toggle de la fila', async () => {
        mockFetchEstudiantesCursos()
        render(
            <EstudiantesSection
                accent="purple"
                descripcion="Gestión de estudiantes"
                botonLabel="Agregar Estudiante"
                modalTitle="Crear Estudiante"
            />
        )

        await waitFor(() => expect(screen.getByText('Ana Pérez')).toBeInTheDocument())

        fireEvent.click(screen.getByText('Retirar'))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/estudiantes/1',
                expect.objectContaining({ method: 'PATCH' })
            )
        })
    })

    it('abre el modal de edición con los datos precargados y sin campos de email/contraseña', async () => {
        mockFetchEstudiantesCursos()
        const { container } = render(
            <EstudiantesSection
                accent="purple"
                descripcion="Gestión de estudiantes"
                botonLabel="Agregar Estudiante"
                modalTitle="Crear Estudiante"
            />
        )

        await waitFor(() => expect(screen.getByText('Ana Pérez')).toBeInTheDocument())

        fireEvent.click(screen.getByText('Editar'))

        expect(screen.getByRole('heading', { name: 'Editar estudiante' })).toBeInTheDocument()
        const nombreInput = container.querySelector('input[type="text"]') as HTMLInputElement
        expect(nombreInput).toHaveValue('Ana')
        expect(container.querySelector('input[type="email"]')).not.toBeInTheDocument()
        expect(container.querySelector('input[type="password"]')).not.toBeInTheDocument()
    })

    it('envía PATCH con el nuevo curso al guardar la edición', async () => {
        mockFetchEstudiantesCursos()
        render(
            <EstudiantesSection
                accent="purple"
                descripcion="Gestión de estudiantes"
                botonLabel="Agregar Estudiante"
                modalTitle="Crear Estudiante"
            />
        )

        await waitFor(() => expect(screen.getByText('Ana Pérez')).toBeInTheDocument())
        fireEvent.click(screen.getByText('Editar'))

        fireEvent.click(screen.getByText('Guardar Cambios'))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/estudiantes/1',
                expect.objectContaining({ method: 'PATCH' })
            )
        })
    })

    it('completa todos los campos del formulario de creación', async () => {
        mockFetchEstudiantesCursos()
        const { container } = render(
            <EstudiantesSection
                accent="purple"
                descripcion="Gestión de estudiantes"
                botonLabel="Agregar Estudiante"
                modalTitle="Crear Estudiante"
            />
        )

        await waitFor(() => expect(screen.getByText('Ana Pérez')).toBeInTheDocument())
        fireEvent.click(screen.getByText('Agregar Estudiante'))

        const [, apellidoInput] = container.querySelectorAll('input[type="text"]')
        const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement
        const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement
        const cursoSelect = container.querySelector('select') as HTMLSelectElement

        fireEvent.change(apellidoInput, { target: { value: 'González' } })
        fireEvent.change(emailInput, { target: { value: 'nueva@test.com' } })
        fireEvent.change(passwordInput, { target: { value: '123456' } })
        fireEvent.change(cursoSelect, { target: { value: 'c1' } })

        expect(apellidoInput).toHaveValue('González')
        expect(emailInput).toHaveValue('nueva@test.com')
        expect(cursoSelect).toHaveValue('c1')
    })
})
