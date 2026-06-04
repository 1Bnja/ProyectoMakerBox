/**
 * Descuenta una cantidad del stock disponible de un artículo del inventario.
 *
 * @param stockActual - Unidades disponibles actualmente (>= 0).
 * @param cantidad - Unidades a descontar (> 0).
 * @returns El nuevo stock luego del descuento.
 * @throws Error si las entradas son inválidas o si no hay stock suficiente.
 */
export function descontarStock(stockActual: number, cantidad: number): number {
  validarStockActual(stockActual)
  validarCantidad(cantidad)
  if (cantidad > stockActual) {
    throw new Error('Stock insuficiente')
  }
  return stockActual - cantidad
}

/**
 * Repone una cantidad al stock disponible de un artículo del inventario.
 *
 * @param stockActual - Unidades disponibles actualmente (>= 0).
 * @param cantidad - Unidades a reponer (> 0).
 * @returns El nuevo stock luego de la reposición.
 * @throws Error si las entradas son inválidas.
 */
export function reponerStock(stockActual: number, cantidad: number): number {
  validarStockActual(stockActual)
  validarCantidad(cantidad)
  return stockActual + cantidad
}

function validarStockActual(stockActual: number): void {
  if (stockActual < 0) {
    throw new Error('El stock actual no puede ser negativo')
  }
}

function validarCantidad(cantidad: number): void {
  if (cantidad <= 0) {
    throw new Error('La cantidad debe ser positiva')
  }
}
