export type Rol = 'ADMIN' | 'AYUDANTE' | 'PROFESOR' | 'ESTUDIANTE' | 'SOLICITANTE'

const RUTAS_POR_ROL: Record<Rol, string> = {
  ADMIN: '/admin',
  AYUDANTE: '/ayudante',
  PROFESOR: '/profesor',
  ESTUDIANTE: '/estudiante',
  SOLICITANTE: '/solicitante',
}

export function getHomeRouteByRole(rol: Rol): string {
    const ruta = RUTAS_POR_ROL[rol]

    if (!ruta) {
        throw new Error(`Rol no valido: ${rol}`)
    }
    return ruta
}