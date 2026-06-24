import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useInventario } from "@/app/hooks/useInventario"

/* eslint-disable @typescript-eslint/naming-convention */

const mockArticulos = [
    { id: "1", nombre: "Art 1", cantidad_actual: 5, stock_minimo: 2, unidad_medida: "u", notificar_stock: true }
]

describe("INV-01 - useInventario Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("1. carga artículos", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockArticulos,
        })

        const { result } = renderHook(() => useInventario())

        act(() => {
            result.current.cargarArticulos()
        })

        await waitFor(() => {
            expect(result.current.articulos).toHaveLength(1)
            expect(result.current.cargando).toBe(false)
        })
    })

    it("4. maneja errores de la API", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ error: "Fallo servidor" }),
        })

        const { result } = renderHook(() => useInventario())

        act(() => {
            result.current.cargarArticulos()
        })

        await waitFor(() => {
            expect(result.current.error).toBe("Fallo servidor")
            expect(result.current.articulos).toHaveLength(0)
        })
    })

    it("2. crea un artículo y 5. actualiza la lista", async () => {
        let fetchCount = 0
        global.fetch = vi.fn().mockImplementation(() => {
            fetchCount++
            if (fetchCount === 1) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ id: "2" }),
                })
            }
            return Promise.resolve({
                ok: true,
                json: async () => [...mockArticulos, { id: "2", nombre: "Nuevo" }],
            })
        })

        const { result } = renderHook(() => useInventario())

        await act(async () => {
            await result.current.crearArticulo({
                nombre: "Nuevo",
                cantidad_actual: 10,
                stock_minimo: 5,
                unidad_medida: "gr",
                notificar_stock: true
            })
        })

        expect(result.current.mensaje).toBe("Artículo creado exitosamente")
        expect(result.current.articulos).toHaveLength(2)
    })

    it("3. actualiza un artículo y 5. actualiza la lista", async () => {
        let fetchCount = 0
        global.fetch = vi.fn().mockImplementation(() => {
            fetchCount++
            if (fetchCount === 1) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ id: "1", nombre: "Editado" }),
                })
            }
            return Promise.resolve({
                ok: true,
                json: async () => [{ ...mockArticulos[0], nombre: "Editado" }],
            })
        })

        const { result } = renderHook(() => useInventario())

        await act(async () => {
            await result.current.actualizarArticulo("1", { nombre: "Editado" })
        })

        expect(result.current.mensaje).toBe("Artículo actualizado exitosamente")
        expect(result.current.articulos[0].nombre).toBe("Editado")
    })
})
