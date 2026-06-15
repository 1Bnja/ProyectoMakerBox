export type NivelAlertaStock = 'normal' | 'bajo' | 'agotado'

export type ResultadoAlertaStock = {
  requiereAlerta: boolean
  nivel: NivelAlertaStock
  mensaje: string | null
}

export function evaluarAlertaStock(
  stockActual: number,
  umbralMinimo: number,
): ResultadoAlertaStock {
  validarStockActual(stockActual)
  validarUmbralMinimo(umbralMinimo)

  if (stockActual === 0) {
    return {
      requiereAlerta: true,
      nivel: 'agotado',
      mensaje: 'Stock agotado',
    }
  }

  if (stockActual <= umbralMinimo) {
    return {
      requiereAlerta: true,
      nivel: 'bajo',
      mensaje: 'Stock bajo',
    }
  }

  return {
    requiereAlerta: false,
    nivel: 'normal',
    mensaje: null,
  }
}

function validarStockActual(stockActual: number): void {
  if (stockActual < 0) {
    throw new Error('El stock actual no puede ser negativo')
  }
}

function validarUmbralMinimo(umbralMinimo: number): void {
  if (umbralMinimo < 0) {
    throw new Error('El umbral mínimo no puede ser negativo')
  }
}