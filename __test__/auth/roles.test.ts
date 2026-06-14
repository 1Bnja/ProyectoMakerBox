import { describe, it, expect } from 'vitest'
import { getHomeRouteByRole } from '@/lib/auth/roles'

describe('AUTH-01 - Redirección según rol', () => {
  it('redirige a /admin para el rol ADMIN', () => {
    expect(getHomeRouteByRole('ADMIN')).toBe('/admin')
  })

  it('redirige a /ayudante para el rol AYUDANTE', () => {
    expect(getHomeRouteByRole('AYUDANTE')).toBe('/ayudante')
  })

  it('redirige a /profesor para el rol PROFESOR', () => {
    expect(getHomeRouteByRole('PROFESOR')).toBe('/profesor')
  })

  it('redirige a /estudiante para el rol ESTUDIANTE', () => {
    expect(getHomeRouteByRole('ESTUDIANTE')).toBe('/estudiante')
  })

  it('redirige a /solicitante para el rol SOLICITANTE', () => {
    expect(getHomeRouteByRole('SOLICITANTE')).toBe('/solicitante')
  })

  it('lanza un error si el rol no es valido', () => {
    // @ts-expect-error - probamos un valor inválido a propósito
    expect(() => getHomeRouteByRole('ROL_INEXISTENTE')).toThrow('Rol no valido')
  })
})

