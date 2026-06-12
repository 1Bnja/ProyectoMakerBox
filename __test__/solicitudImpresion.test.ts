import { describe, it, expect } from 'vitest'
import { validarDatosImpresion } from '@/lib/flujo/validacionesImpresion'

describe('Funcionalidad Pris - Validar Datos de Solicitud de Impresión (TDD)', () => {
  it('Debería fallar si el archivo no es .stl o .obj', () => {
    const datosInvalidadas = {
      nombreArchivo: 'pieza_mecanica.png',
      material: 'PLA',
      volumenCm3: 10
    };
    
    const resultado = validarDatosImpresion(datosInvalidadas);
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBe('El archivo debe tener extensión .stl o .obj');
  });

  it('Debería fallar si el volumen es menor o igual a cero', () => {
    const datosInvalidadas = {
      nombreArchivo: 'soporte.stl',
      material: 'ABS',
      volumenCm3: -5
    };
    
    const resultado = validarDatosImpresion(datosInvalidadas);
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBe('El volumen debe ser mayor a 0 cm³');
  });

  it('Debería retornar valido si los datos son correctos', () => {
    const datosValidos = {
      nombreArchivo: 'engranaje.stl',
      material: 'PLA',
      volumenCm3: 15
    };
    
    const resultado = validarDatosImpresion(datosValidos);
    expect(resultado.valido).toBe(true);
    expect(resultado.error).toBeNull();
  });
});