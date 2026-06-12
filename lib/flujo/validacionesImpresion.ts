export interface DatosSolicitud {
  nombreArchivo: string;
  material: string;
  volumenCm3: number;
}

export function validarDatosImpresion(solicitud: DatosSolicitud) {
  const extValidas = ['.stl', '.obj'];
  const nombreEnMinuscula = solicitud.nombreArchivo.toLowerCase();

  // 1. Validar la extensión del modelo 3D
  const tieneExtValida = extValidas.some(ext => nombreEnMinuscula.endsWith(ext));
  if (!tieneExtValida) {
    return { valido: false, error: 'El archivo debe tener extensión .stl o .obj' };
  }

  // 2. Validar que el volumen sea real
  if (solicitud.volumenCm3 <= 0) {
    return { valido: false, error: 'El volumen debe ser mayor a 0 cm³' };
  }

  return { valido: true, error: null };
}