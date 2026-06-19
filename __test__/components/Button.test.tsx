import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '@/app/components/Button'

describe('Button', () => {
    it('renderiza el texto recibido', () => {
        render(<Button>Guardar</Button>)
        expect(screen.getByText('Guardar')).toBeInTheDocument()
    })

    it('ejecuta onClick al hacer clic', () => {
        const onClick = vi.fn()
        render(<Button onClick={onClick}>Enviar</Button>)

        fireEvent.click(screen.getByText('Enviar'))

        expect(onClick).toHaveBeenCalledOnce()
    })

    it('aplica la variante outline', () => {
        render(<Button variant="outline">Quitar</Button>)
        expect(screen.getByText('Quitar')).toHaveClass('border')
    })

    it('aplica la variante secondary', () => {
        render(<Button variant="secondary">Cancelar</Button>)
        expect(screen.getByText('Cancelar')).toHaveClass('text-slate-600')
    })

    it('se deshabilita cuando disabled es true', () => {
        render(<Button disabled>Cargando</Button>)
        expect(screen.getByText('Cargando')).toBeDisabled()
    })

    it('aplica ancho completo cuando fullWidth es true', () => {
        render(<Button fullWidth>Continuar</Button>)
        expect(screen.getByText('Continuar')).toHaveClass('w-full')
    })
})
