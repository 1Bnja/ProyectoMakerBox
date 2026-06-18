import { describe, it, expect } from 'vitest'
import { calcularVolumenSTL } from '@/lib/flujo/validacionesImpresion'

function crearBufferSTL(triangulos: number[][][]) {
    const numTriangulos = triangulos.length
    const buffer = new ArrayBuffer(84 + numTriangulos * 50)
    const view = new DataView(buffer)

    view.setUint32(80, numTriangulos, true)

    let offset = 84
    for (const [normal, v1, v2, v3] of triangulos) {
        view.setFloat32(offset, normal[0], true)
        view.setFloat32(offset + 4, normal[1], true)
        view.setFloat32(offset + 8, normal[2], true)

        view.setFloat32(offset + 12, v1[0], true)
        view.setFloat32(offset + 16, v1[1], true)
        view.setFloat32(offset + 20, v1[2], true)

        view.setFloat32(offset + 24, v2[0], true)
        view.setFloat32(offset + 28, v2[1], true)
        view.setFloat32(offset + 32, v2[2], true)

        view.setFloat32(offset + 36, v3[0], true)
        view.setFloat32(offset + 40, v3[1], true)
        view.setFloat32(offset + 44, v3[2], true)

        offset += 50
    }

    return buffer
}

describe('calcularVolumenSTL', () => {
    it('retorna 0 si el buffer no tiene un header válido (menor a 84 bytes)', () => {
        const buffer = new ArrayBuffer(50)
        expect(calcularVolumenSTL(buffer)).toBe(0)
    })

    it('retorna 0 si no hay triángulos', () => {
        const buffer = crearBufferSTL([])
        expect(calcularVolumenSTL(buffer)).toBe(0)
    })

    it('calcula el volumen correcto para un triángulo conocido', () => {
        const buffer = crearBufferSTL([
            [[0, 0, 0], [10, 0, 0], [0, 10, 0], [0, 0, 10]],
        ])
        // Tetraedro formado por el origen y los vértices (10,0,0),(0,10,0),(0,0,10)
        // Volumen = (10*10*10)/6 mm³ = 166.67 mm³ = 0.17 cm³
        expect(calcularVolumenSTL(buffer)).toBeCloseTo(0.17, 2)
    })

    it('ignora triángulos truncados al final del buffer', () => {
        const buffer = crearBufferSTL([
            [[0, 0, 0], [10, 0, 0], [0, 10, 0], [0, 0, 10]],
        ])
        const truncado = buffer.slice(0, 84 + 30)
        expect(calcularVolumenSTL(truncado)).toBe(0)
    })

    it('suma el volumen de múltiples triángulos', () => {
        const triangulo = [[0, 0, 0], [10, 0, 0], [0, 10, 0], [0, 0, 10]] as number[][]
        const buffer = crearBufferSTL([triangulo, triangulo])
        // Dos triángulos iguales → el doble del volumen individual
        expect(calcularVolumenSTL(buffer)).toBeCloseTo(0.33, 2)
    })
})
