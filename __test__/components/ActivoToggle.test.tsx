import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ActivoToggle } from '@/app/components/ActivoToggle'

describe('ActivoToggle', () => {
    it('muestra la primera etiqueta cuando está activo', () => {
        render(<ActivoToggle activo={true} labels={['Retirar', 'Reactivar']} onClick={vi.fn()} />)
        expect(screen.getByText('Retirar')).toBeInTheDocument()
    })

    it('muestra la segunda etiqueta cuando está inactivo', () => {
        render(<ActivoToggle activo={false} labels={['Retirar', 'Reactivar']} onClick={vi.fn()} />)
        expect(screen.getByText('Reactivar')).toBeInTheDocument()
    })

    it('ejecuta onClick al hacer clic', () => {
        const onClick = vi.fn()
        render(<ActivoToggle activo={true} labels={['Retirar', 'Reactivar']} onClick={onClick} />)

        fireEvent.click(screen.getByText('Retirar'))

        expect(onClick).toHaveBeenCalledOnce()
    })
})
