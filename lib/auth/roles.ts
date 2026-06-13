export type Rol = 'ADMIN' | 'AYUDANTE' | 'PROFESOR' | 'ESTUDIANTE' | 'SOLICITANTE'
/* eslint-disable @typescript-eslint/naming-convention */
const rutasPorRol: Record<Rol, string> = {
  ADMIN: '/admin',
  AYUDANTE: '/ayudante',
  PROFESOR: '/profesor',
  ESTUDIANTE: '/estudiante',
  SOLICITANTE: '/solicitante',
}
/* eslint-enable @typescript-eslint/naming-convention */
export function getHomeRouteByRole(rol: Rol): string {
    const ruta = rutasPorRol[rol]

    if (!ruta) {
        throw new Error(`Rol no valido: ${rol}`)
    }
    return ruta
}