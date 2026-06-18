import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge } from '@/app/components/StatusBadge'

describe('StatusBadge', () => {
    it('muestra el estado PENDIENTE con su estilo', () => {
        render(<StatusBadge status="PENDIENTE" />)
        expect(screen.getByText('PENDIENTE')).toHaveClass('bg-amber-50')
    })

    it('muestra el estado Activo con su estilo', () => {
        render(<StatusBadge status="Activo" />)
        expect(screen.getByText('Activo')).toHaveClass('bg-emerald-50')
    })

    it('usa el estilo por defecto para un estado desconocido', () => {
        render(<StatusBadge status="DESCONOCIDO" />)
        expect(screen.getByText('DESCONOCIDO')).toHaveClass('bg-slate-100')
    })
})
