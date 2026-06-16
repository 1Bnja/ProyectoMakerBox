import { describe, it, expect } from 'vitest'
import {
  cambiarEstado,
  puedeTransicionar,
} from '@/lib/flujo/estadoSolicitud'

describe('F3 - Máquina de estados del flujo de impresión', () => {
  it('permite pasar de pendiente a aprobada', () => {
    expect(puedeTransicionar('pendiente', 'aprobada')).toBe(true)
  })

  it('permite pasar de pendiente a rechazada', () => {
    expect(puedeTransicionar('pendiente', 'rechazada')).toBe(true)
  })

  it('permite pasar de aprobada a imprimiendo', () => {
    expect(puedeTransicionar('aprobada', 'imprimiendo')).toBe(true)
  })

  it('permite pasar de aprobada a rechazada', () => {
    expect(puedeTransicionar('aprobada', 'rechazada')).toBe(true)
  })

  it('permite pasar de imprimiendo a finalizada', () => {
    expect(puedeTransicionar('imprimiendo', 'finalizada')).toBe(true)
  })

  it('no permite pasar de pendiente a finalizada', () => {
    expect(puedeTransicionar('pendiente', 'finalizada')).toBe(false)
  })

  it('no permite cambiar desde rechazada a aprobada', () => {
    expect(puedeTransicionar('rechazada', 'aprobada')).toBe(false)
  })

  it('no permite cambiar desde finalizada a imprimiendo', () => {
    expect(puedeTransicionar('finalizada', 'imprimiendo')).toBe(false)
  })

  it('cambiarEstado retorna el nuevo estado cuando la transición es válida', () => {
    const resultado = cambiarEstado('pendiente', 'aprobada')
    expect(resultado).toBe('aprobada')
  })

  it('cambiarEstado lanza error cuando la transición es inválida', () => {
    expect(() => cambiarEstado('rechazada', 'aprobada')).toThrow('Transición de estado no permitida')
  })
})

