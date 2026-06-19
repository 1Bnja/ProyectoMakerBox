import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FormField, FormSelect } from '@/app/components/FormField'

describe('FormField', () => {
    it('muestra la etiqueta recibida', () => {
        render(<FormField label="Nombre" value="" onChange={vi.fn()} />)
        expect(screen.getByText('Nombre')).toBeInTheDocument()
    })

    it('ejecuta onChange al escribir', () => {
        const onChange = vi.fn()
        render(<FormField label="Email" value="" onChange={onChange} />)

        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'test@test.com' },
        })

        expect(onChange).toHaveBeenCalled()
    })
})

describe('FormSelect', () => {
    it('muestra la etiqueta y las opciones recibidas', () => {
        render(
            <FormSelect label="Curso" value="" onChange={vi.fn()}>
                <option value="1">Curso 1</option>
            </FormSelect>
        )
        expect(screen.getByText('Curso')).toBeInTheDocument()
        expect(screen.getByText('Curso 1')).toBeInTheDocument()
    })

    it('ejecuta onChange al seleccionar una opción', () => {
        const onChange = vi.fn()
        render(
            <FormSelect label="Curso" value="" onChange={onChange}>
                <option value="1">Curso 1</option>
            </FormSelect>
        )

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } })

        expect(onChange).toHaveBeenCalled()
    })
})
