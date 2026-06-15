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

// Al final de lib/flujo/validacionesImpresion.ts

/**
 * Lee el Buffer de un archivo STL binario y calcula su volumen aproximado en cm³
 */
export function calcularVolumenSTL(buffer: ArrayBuffer): number {
  const view = new DataView(buffer);
  
  // Los archivos STL binarios tienen un encabezado de 80 bytes.
  // Los siguientes 4 bytes (offset 80) indican el número total de triángulos.
  if (buffer.byteLength < 84) return 0;
  
  const numTriangulos = view.getUint32(80, true); // true para leer en Little Endian
  
  let volumenTotal = 0;
  let offset = 84; // El primer triángulo empieza en el byte 84

  // Cada triángulo ocupa exactamente 50 bytes:
  // - 12 bytes: Vector normal (3 floats)
  // - 12 bytes: Vértice 1 (3 floats)
  // - 12 bytes: Vértice 2 (3 floats)
  // - 12 bytes: Vértice 3 (3 floats)
  // - 2 bytes: Atributo de control
  for (let i = 0; i < numTriangulos; i++) {
    if (offset + 50 > buffer.byteLength) break;

    // Saltamos la normal (12 bytes) e ir directo a los vértices
    const v1x = view.getFloat32(offset + 12, true);
    const v1y = view.getFloat32(offset + 16, true);
    const v1z = view.getFloat32(offset + 20, true);

    const v2x = view.getFloat32(offset + 24, true);
    const v2y = view.getFloat32(offset + 28, true);
    const v2z = view.getFloat32(offset + 32, true);

    const v3x = view.getFloat32(offset + 36, true);
    const v3y = view.getFloat32(offset + 40, true);
    const v3z = view.getFloat32(offset + 44, true);

    // Fórmula del volumen del tetraedro formado por el origen (0,0,0) y el triángulo
    const v310 = v1x * v2y * v3z;
    const v210 = v1y * v2z * v3x;
    const v120 = v1z * v2x * v3y;
    
    const v110 = -v1z * v2y * v3x;
    const v220 = -v1y * v2x * v3z;
    const v330 = -v1x * v2z * v3y;

    const volumenTetraedro = (v310 + v210 + v120 + v110 + v220 + v330) / 6.0;
    volumenTotal += volumenTetraedro;

    offset += 50; // Avanzamos al siguiente triángulo
  }

  // El volumen calculado está en mm³ (unidad estándar de diseño 3D).
  // Dividimos por 1000 para transformarlo a cm³ reales.
  const volumenCm3 = Math.abs(volumenTotal) / 1000.0;
  return parseFloat(volumenCm3.toFixed(2));
}