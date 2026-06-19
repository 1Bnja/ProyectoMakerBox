import { describe, it, expect } from 'vitest'
import { descontarStock, reponerStock } from '@/lib/inventario/stock'

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

describe('F5 - Reposición de stock de inventario', () => {
  it('suma la cantidad solicitada al stock disponible', () => {
    const resultado = reponerStock(10, 5)
    expect(resultado).toBe(15)
  })

  it('permite reponer stock cuando el stock actual es 0', () => {
    const resultado = reponerStock(0, 8)
    expect(resultado).toBe(8)
  })

  it('lanza un error si la cantidad a reponer es cero o negativa', () => {
    expect(() => reponerStock(10, 0)).toThrow('La cantidad debe ser positiva')
    expect(() => reponerStock(10, -2)).toThrow('La cantidad debe ser positiva')
  })

  it('lanza un error si el stock actual es negativo', () => {
    expect(() => reponerStock(-5, 1)).toThrow('El stock actual no puede ser negativo')
  })
})
