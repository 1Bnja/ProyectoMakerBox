import { describe, expect, it } from 'vitest'
import {
  aprobarSolicitud,
  puedeGestionarSolicitud,
  rechazarSolicitud,
} from '@/lib/impresion/gestionarSolicitud'

describe('IMP-04 - Gestionar solicitud de impresión', () => {
  it('puedeGestionarSolicitud retorna true si el estado es PENDIENTE', () => {
    expect(puedeGestionarSolicitud('PENDIENTE')).toBe(true)
  })

  it('puedeGestionarSolicitud retorna false si el estado es APROBADA', () => {
    expect(puedeGestionarSolicitud('APROBADA')).toBe(false)
  })

  it('aprobarSolicitud cambia PENDIENTE a APROBADA', () => {
    expect(aprobarSolicitud('PENDIENTE')).toBe('APROBADA')
  })

  it('rechazarSolicitud cambia PENDIENTE a RECHAZADA y guarda comentario', () => {
    expect(rechazarSolicitud('PENDIENTE', 'Falta información')).toEqual({
      estado: 'RECHAZADA',
      comentarioRetroalimentacion: 'Falta información',
    })
  })

  it('rechazarSolicitud elimina espacios al inicio y final del comentario', () => {
    expect(rechazarSolicitud('PENDIENTE', '  Revisa el archivo adjunto  ')).toEqual({
      estado: 'RECHAZADA',
      comentarioRetroalimentacion: 'Revisa el archivo adjunto',
    })
  })

  it('rechazarSolicitud lanza error si el comentario está vacío', () => {
    expect(() => rechazarSolicitud('PENDIENTE', '')).toThrowError(
      'Debe ingresar una retroalimentación para rechazar la solicitud',
    )
  })

  it('rechazarSolicitud lanza error si el comentario tiene solo espacios', () => {
    expect(() => rechazarSolicitud('PENDIENTE', '   ')).toThrowError(
      'Debe ingresar una retroalimentación para rechazar la solicitud',
    )
  })

  it('aprobarSolicitud lanza error si la solicitud ya está APROBADA', () => {
    expect(() => aprobarSolicitud('APROBADA')).toThrowError(
      'La solicitud no puede cambiar de estado desde su estado actual',
    )
  })

  it('aprobarSolicitud lanza error si la solicitud está RECHAZADA', () => {
    expect(() => aprobarSolicitud('RECHAZADA')).toThrowError(
      'La solicitud no puede cambiar de estado desde su estado actual',
    )
  })

  it('rechazarSolicitud lanza error si la solicitud está EN_PROGRESO', () => {
    expect(() => rechazarSolicitud('EN_PROGRESO', 'No cumple')).toThrowError(
      'La solicitud no puede cambiar de estado desde su estado actual',
    )
  })

  it('rechazarSolicitud lanza error si la solicitud está IMPRESA', () => {
    expect(() => rechazarSolicitud('IMPRESA', 'No cumple')).toThrowError(
      'La solicitud no puede cambiar de estado desde su estado actual',
    )
  })
})