import { describe, it, expect } from 'vitest'
import { descontarStock } from '@/lib/inventario/stock'

describe('F5 - Descuento de stock de inventario', () => {
  it('descuenta la cantidad solicitada del stock disponible', () => {
    const resultado = descontarStock(10, 3)
    expect(resultado).toBe(7)
  })

  it('permite descontar hasta dejar el stock en 0', () => {
    const resultado = descontarStock(5, 5)
    expect(resultado).toBe(0)
  })

  it('lanza un error si la cantidad a descontar deja el stock negativo', () => {
    expect(() => descontarStock(2, 5)).toThrow('Stock insuficiente')
  })

  it('lanza un error si la cantidad a descontar es negativa', () => {
    expect(() => descontarStock(10, -1)).toThrow('La cantidad debe ser positiva')
  })

  it('lanza un error si el stock actual es negativo', () => {
    expect(() => descontarStock(-5, 1)).toThrow('El stock actual no puede ser negativo')
  })
})
