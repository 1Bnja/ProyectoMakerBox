import { describe, it, expect } from 'vitest'
import { evaluarAlertaStock } from '@/lib/inventario/alertaStock'

describe('INV-03 - Alerta de bajo stock', () => {
  it('retorna nivel normal cuando el stock está sobre el umbral', () => {
    expect(evaluarAlertaStock(11, 10)).toEqual({
      requiereAlerta: false,
      nivel: 'normal',
      mensaje: null,
    })
  })

  it('retorna alerta de stock bajo cuando el stock es igual al umbral', () => {
    expect(evaluarAlertaStock(10, 10)).toEqual({
      requiereAlerta: true,
      nivel: 'bajo',
      mensaje: 'Stock bajo',
    })
  })

  it('retorna alerta de stock bajo cuando el stock es menor que el umbral pero mayor que 0', () => {
    expect(evaluarAlertaStock(3, 10)).toEqual({
      requiereAlerta: true,
      nivel: 'bajo',
      mensaje: 'Stock bajo',
    })
  })

  it('retorna alerta de stock agotado cuando el stock es 0', () => {
    expect(evaluarAlertaStock(0, 10)).toEqual({
      requiereAlerta: true,
      nivel: 'agotado',
      mensaje: 'Stock agotado',
    })
  })

  it('lanza error si el stock actual es negativo', () => {
    expect(() => evaluarAlertaStock(-1, 10)).toThrow(
      'El stock actual no puede ser negativo',
    )
  })

  it('lanza error si el umbral mínimo es negativo', () => {
    expect(() => evaluarAlertaStock(1, -10)).toThrow(
      'El umbral mínimo no puede ser negativo',
    )
  })
})