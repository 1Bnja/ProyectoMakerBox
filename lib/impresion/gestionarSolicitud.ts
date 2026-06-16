export type EstadoSolicitudImpresion =
  | 'PENDIENTE'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'EN_PROGRESO'
  | 'IMPRESA'

export type ResultadoRechazoSolicitud = {
  estado: 'RECHAZADA'
  comentarioRetroalimentacion: string
}

const mensajeErrorEstado = 'La solicitud no puede cambiar de estado desde su estado actual'
const mensajeErrorComentario = 'Debe ingresar una retroalimentación para rechazar la solicitud'

export function puedeGestionarSolicitud(estadoActual: EstadoSolicitudImpresion): boolean {
  return estadoActual === 'PENDIENTE'
}

export function aprobarSolicitud(estadoActual: EstadoSolicitudImpresion): EstadoSolicitudImpresion {
  if (!puedeGestionarSolicitud(estadoActual)) {
    throw new Error(mensajeErrorEstado)
  }

  return 'APROBADA'
}

export function rechazarSolicitud(
  estadoActual: EstadoSolicitudImpresion,
  comentarioRetroalimentacion: string,
): ResultadoRechazoSolicitud {
  if (!puedeGestionarSolicitud(estadoActual)) {
    throw new Error(mensajeErrorEstado)
  }

  const comentario = comentarioRetroalimentacion.trim()

  if (!comentario) {
    throw new Error(mensajeErrorComentario)
  }

  return {
    estado: 'RECHAZADA',
    comentarioRetroalimentacion: comentario,
  }
}