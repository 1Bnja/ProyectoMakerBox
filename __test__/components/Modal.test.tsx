import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Modal } from '@/app/components/Modal'

describe('Modal', () => {
    it('muestra el título recibido', () => {
        render(<Modal title="Crear Estudiante"><p>contenido</p></Modal>)
        expect(screen.getByText('Crear Estudiante')).toBeInTheDocument()
    })

    it('renderiza el contenido hijo', () => {
        render(
            <Modal title="Detalle">
                <p>Información del registro</p>
            </Modal>
        )
        expect(screen.getByText('Información del registro')).toBeInTheDocument()
    })
})
