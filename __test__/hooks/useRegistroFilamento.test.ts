import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useRegistroFilamento } from "@/app/hooks/useRegistroFilamento"

/* eslint-disable @typescript-eslint/naming-convention */

const mockImpresiones = [
    {
        id: "imp1",
        tipo: "PERSONAL",
        estado: "APROBADA",
        comentario: null,
        created_at: "2026-06-20T00:00:00Z",
        solicitante: { nombre: "Ana", apellido: "Torres" },
    },
]

const mockArticulos = [
    {
        id: "art1",
        nombre: "PLA Negro",
        cantidad_actual: 200,
        stock_minimo: 50,
        unidad_medida: "gr",
        notificar_stock: true,
    },
]

const mockHistorial = [
    {
        id: "uso1",
        impresionId: "imp1",
        articuloId: "art1",
        cantidad: 50,
        stockAnterior: 200,
        stockRestante: 150,
        creadoEn: "2026-06-25T10:00:00Z",
        articuloNombre: "PLA Negro",
        unidadMedida: "gr",
        impresionLabel: "PERSONAL — Ana Torres",
    },
]

/** Configura un fetch que responde correctamente a las 3 APIs de carga */
function mockFetchCarga() {
    global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("/api/solicitudes")) {
            return Promise.resolve({ ok: true, json: async () => mockImpresiones })
        }
        if (url.includes("/api/articulos")) {
            return Promise.resolve({ ok: true, json: async () => mockArticulos })
        }
        if (url.includes("/api/uso-impresion")) {
            return Promise.resolve({ ok: true, json: async () => mockHistorial })
        }
        return Promise.resolve({ ok: true, json: async () => [] })
    }) as unknown as typeof fetch
}

describe("INV-02 - useRegistroFilamento Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("1. carga impresiones, artículos e historial al llamar cargarDatos()", async () => {
        mockFetchCarga()
        const { result } = renderHook(() => useRegistroFilamento())

        act(() => {
            result.current.cargarDatos()
        })

        await waitFor(() => {
            expect(result.current.cargando).toBe(false)
            expect(result.current.impresiones).toHaveLength(1)
            expect(result.current.articulos).toHaveLength(1)
            expect(result.current.historial).toHaveLength(1)
        })
    })

    it("2. registrarUso llama a POST /api/uso-impresion y muestra mensaje de éxito", async () => {
        mockFetchCarga()
        const { result } = renderHook(() => useRegistroFilamento())

        await act(async () => {
            await result.current.cargarDatos()
        })
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                id: "uso-nuevo",
                stockAnterior: 200,
                cantidad: 50,
                stockRestante: 150,
            }),
        }) as unknown as typeof fetch

        await act(async () => {
            await result.current.registrarUso({
                impresionId: "imp1",
                articuloId: "art1",
                cantidad: 50,
            })
        })

        expect(result.current.mensajeExito).toBe("Uso registrado exitosamente")
        expect(result.current.error).toBeNull()
    })

    it("3. actualiza stock local del artículo después del registro", async () => {
        mockFetchCarga()
        const { result } = renderHook(() => useRegistroFilamento())

        await act(async () => {
            await result.current.cargarDatos()
        })

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ id: "u2", stockAnterior: 200, cantidad: 50, stockRestante: 150 }),
        }) as unknown as typeof fetch

        await act(async () => {
            await result.current.registrarUso({
                impresionId: "imp1",
                articuloId: "art1",
                cantidad: 50,
            })
        })

        const artActualizado = result.current.articulos.find((a) => a.id === "art1")
        expect(artActualizado?.cantidad_actual).toBe(150)
    })

    it("4. agrega el nuevo uso al inicio del historial sin recargar la página", async () => {
        mockFetchCarga()
        const { result } = renderHook(() => useRegistroFilamento())

        await act(async () => {
            await result.current.cargarDatos()
        })

        const historialInicial = result.current.historial.length

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ id: "u-new", stockAnterior: 200, cantidad: 30, stockRestante: 170 }),
        }) as unknown as typeof fetch

        await act(async () => {
            await result.current.registrarUso({
                impresionId: "imp1",
                articuloId: "art1",
                cantidad: 30,
            })
        })

        expect(result.current.historial).toHaveLength(historialInicial + 1)
        expect(result.current.historial[0].cantidad).toBe(30)
    })

    it("5. maneja stock insuficiente (error 409)", async () => {
        mockFetchCarga()
        const { result } = renderHook(() => useRegistroFilamento())

        await act(async () => {
            await result.current.cargarDatos()
        })

        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ error: "Stock insuficiente" }),
        }) as unknown as typeof fetch

        await act(async () => {
            try {
                await result.current.registrarUso({
                    impresionId: "imp1",
                    articuloId: "art1",
                    cantidad: 9999,
                })
            } catch {
            }
        })

        expect(result.current.error).toBe("Stock insuficiente")
        expect(result.current.mensajeExito).toBeNull()
    })

    it("6. evita doble envío (guardando=true durante la operación)", async () => {
        mockFetchCarga()
        const { result } = renderHook(() => useRegistroFilamento())

        await act(async () => {
            await result.current.cargarDatos()
        })

        let resolverPost: (value: unknown) => void
        const postPromise = new Promise((res) => {
            resolverPost = res
        })

        global.fetch = vi.fn().mockReturnValue(postPromise) as unknown as typeof fetch

        act(() => {
            result.current.registrarUso({ impresionId: "imp1", articuloId: "art1", cantidad: 10 })
        })
        await waitFor(() => expect(result.current.guardando).toBe(true))

        act(() => {
            resolverPost!({ ok: true, json: async () => ({ id: "u", stockAnterior: 200, cantidad: 10, stockRestante: 190 }) })
        })

        await waitFor(() => expect(result.current.guardando).toBe(false))
    })

    it("7. maneja errores de red", async () => {
        mockFetchCarga()
        const { result } = renderHook(() => useRegistroFilamento())

        await act(async () => {
            await result.current.cargarDatos()
        })

        global.fetch = vi.fn().mockRejectedValue(new Error("Network error")) as unknown as typeof fetch

        await act(async () => {
            try {
                await result.current.registrarUso({
                    impresionId: "imp1",
                    articuloId: "art1",
                    cantidad: 10,
                })
            } catch {
            }
        })

        expect(result.current.error).toBe("Network error")
    })
})
