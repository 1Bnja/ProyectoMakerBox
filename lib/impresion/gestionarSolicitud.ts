export type EstadoSolicitudImpresion =
  | 'PENDIENTE'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'EN_PROGRESO'
  | 'IMPRESA'

const MENSAJE_ERROR_ESTADO = 'La solicitud no puede cambiar de estado desde su estado actual'

export function puedeGestionarSolicitud(estadoActual: EstadoSolicitudImpresion): boolean {
  return estadoActual === 'PENDIENTE'
}

export function aprobarSolicitud(estadoActual: EstadoSolicitudImpresion): EstadoSolicitudImpresion {
  if (!puedeGestionarSolicitud(estadoActual)) {
    throw new Error(MENSAJE_ERROR_ESTADO)
  }

  return 'APROBADA'
}

export function rechazarSolicitud(estadoActual: EstadoSolicitudImpresion): EstadoSolicitudImpresion {
  if (!puedeGestionarSolicitud(estadoActual)) {
    throw new Error(MENSAJE_ERROR_ESTADO)
  }

  return 'RECHAZADA'
}