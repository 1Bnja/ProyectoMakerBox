export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'imprimiendo' | 'finalizada' | 'rechazada'

const transicionesValidas: Record<EstadoSolicitud, EstadoSolicitud[]> = {
  pendiente: ['aprobada', 'rechazada'],
  aprobada: ['imprimiendo', 'rechazada'],
  imprimiendo: ['finalizada'],
  finalizada: [],
  rechazada: [],
}

export function puedeTransicionar(desde: EstadoSolicitud, hacia: EstadoSolicitud): boolean {
  return transicionesValidas[desde].includes(hacia)
}

export function cambiarEstado(desde: EstadoSolicitud, hacia: EstadoSolicitud): EstadoSolicitud {
  if (!puedeTransicionar(desde, hacia)) {
    throw new Error('Transición de estado no permitida')
  }

  return hacia
}