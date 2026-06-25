import { render, screen, fireEvent, waitFor, within, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { RegistroFilamentoSection } from "@/app/components/RegistroFilamentoSection"

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
    {
        id: "art2",
        nombre: "PLA Blanco",
        cantidad_actual: 0,
        stock_minimo: 30,
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

function mockFetchBase() {
    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
        if (url.includes("/api/solicitudes")) {
            return Promise.resolve({ ok: true, json: async () => mockImpresiones })
        }
        if (url.includes("/api/articulos")) {
            return Promise.resolve({ ok: true, json: async () => mockArticulos })
        }
        if (url.includes("/api/uso-impresion") && (!init || init.method !== "POST")) {
            return Promise.resolve({ ok: true, json: async () => mockHistorial })
        }
        if (url.includes("/api/uso-impresion") && init?.method === "POST") {
            return Promise.resolve({
                ok: true,
                json: async () => ({
                    id: "uso-nuevo",
                    stockAnterior: 200,
                    cantidad: 50,
                    stockRestante: 150,
                }),
            })
        }
        return Promise.resolve({ ok: true, json: async () => [] })
    }) as unknown as typeof fetch
}

describe("INV-02 - RegistroFilamentoSection", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockFetchBase()
    })

    it("1. renderiza los selectores de impresion y articulo", async () => {
        render(<RegistroFilamentoSection />)

        await waitFor(() => {
            expect(screen.getByRole("combobox", { name: /impresión/i })).toBeInTheDocument()
        })
        expect(screen.getByRole("combobox", { name: /artículo/i })).toBeInTheDocument()
        expect(screen.getByRole("spinbutton", { name: /cantidad utilizada/i })).toBeInTheDocument()
    })

    it("2. muestra solo impresiones aprobadas en el selector", async () => {
        render(<RegistroFilamentoSection />)

        await waitFor(() => {
            expect(screen.getByRole("option", { name: /PERSONAL — Ana Torres/i })).toBeInTheDocument()
        })
    })

    it("3. muestra artículos con stock disponible (excluye stock=0)", async () => {
        render(<RegistroFilamentoSection />)

        await waitFor(() => {
            // PLA Negro tiene stock=200 debe aparecer
            expect(screen.getByRole("option", { name: /PLA Negro/i })).toBeInTheDocument()
        })

        // PLA Blanco tiene stock=0 NO debe aparecer en el selector
        const options = screen.getAllByRole("option")
        const optTexts = options.map((o) => o.textContent ?? "")
        expect(optTexts.some((t) => t.includes("PLA Blanco"))).toBe(false)
    })

    it("4. muestra stock y unidad al seleccionar un articulo", async () => {
        render(<RegistroFilamentoSection />)

        await waitFor(() => {
            const selectArt = document.getElementById("selectArticulo") as HTMLSelectElement
            expect(selectArt).toBeTruthy()
            expect(selectArt.options.length).toBeGreaterThan(1)
        })

        fireEvent.change(screen.getByRole("combobox", { name: /artículo/i }), { target: { value: "art1" } })

        await waitFor(() => {
            expect(screen.getByText(/Stock disponible/i)).toBeInTheDocument()
        })
        // Verificar el párrafo de info de stock por su id
        const stockInfo = document.getElementById("stockInfo")
        expect(stockInfo).toBeInTheDocument()
        expect(stockInfo?.textContent).toContain("200")
        expect(stockInfo?.textContent).toContain("gr")
    })

    it("5. no envía el formulario si cantidad es 0", async () => {
        render(<RegistroFilamentoSection />)

        await waitFor(() => expect(screen.getByRole("combobox", { name: /impresión/i })).toBeInTheDocument())

        fireEvent.change(screen.getByRole("combobox", { name: /impresión/i }), { target: { value: "imp1" } })
        fireEvent.change(screen.getByRole("combobox", { name: /artículo/i }), { target: { value: "art1" } })
        fireEvent.change(screen.getByRole("spinbutton", { name: /cantidad utilizada/i }), { target: { value: "0" } })

        fireEvent.click(screen.getByRole("button", { name: /registrar uso/i }))

        // No debe llamarse al POST con cantidad 0
        await waitFor(() => {
            const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls
            const postCall = calls.find(
                ([url, init]: [string, RequestInit | undefined]) =>
                    url.includes("/api/uso-impresion") && init?.method === "POST"
            )
            expect(postCall).toBeUndefined()
        })
    })

    it("6. envía impresionId, articuloId y cantidad correctos al registrar", async () => {
        render(<RegistroFilamentoSection />)

        await waitFor(() => expect(screen.getByRole("combobox", { name: /impresión/i })).toBeInTheDocument())

        fireEvent.change(screen.getByRole("combobox", { name: /impresión/i }), { target: { value: "imp1" } })
        fireEvent.change(screen.getByRole("combobox", { name: /artículo/i }), { target: { value: "art1" } })
        fireEvent.change(screen.getByRole("spinbutton", { name: /cantidad utilizada/i }), { target: { value: "50" } })

        fireEvent.click(screen.getByRole("button", { name: /registrar uso/i }))

        await waitFor(() => {
            const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls
            const postCall = calls.find(
                ([url, init]: [string, RequestInit | undefined]) =>
                    url.includes("/api/uso-impresion") && init?.method === "POST"
            )
            expect(postCall).toBeDefined()
            const sentBody = JSON.parse(postCall![1].body as string)
            expect(sentBody).toMatchObject({
                impresionId: "imp1",
                articuloId: "art1",
                cantidad: 50,
            })
        })
    })

    it("7. muestra mensaje de éxito después del registro", async () => {
        render(<RegistroFilamentoSection />)

        await waitFor(() => expect(screen.getByRole("combobox", { name: /impresión/i })).toBeInTheDocument())

        fireEvent.change(screen.getByRole("combobox", { name: /impresión/i }), { target: { value: "imp1" } })
        fireEvent.change(screen.getByRole("combobox", { name: /artículo/i }), { target: { value: "art1" } })
        fireEvent.change(screen.getByRole("spinbutton", { name: /cantidad utilizada/i }), { target: { value: "50" } })

        fireEvent.click(screen.getByRole("button", { name: /registrar uso/i }))

        await waitFor(() => {
            expect(screen.getByText(/uso registrado exitosamente/i)).toBeInTheDocument()
        })
    })

    it("8. muestra alerta de stock bajo después del registro", async () => {
        // PLA Negro: stock_minimo=50 Si el stock_nuevo=40 < stock_minimo=50 → stock bajo
        global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
            if (url.includes("/api/solicitudes")) {
                return Promise.resolve({ ok: true, json: async () => mockImpresiones })
            }
            if (url.includes("/api/articulos")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => [{ ...mockArticulos[0], cantidad_actual: 200, stock_minimo: 100 }],
                })
            }
            if (url.includes("/api/uso-impresion") && init?.method === "POST") {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        id: "u-bajo",
                        stockAnterior: 200,
                        cantidad: 150,
                        stockRestante: 50, // <= stock_minimo (100) → alerta
                    }),
                })
            }
            if (url.includes("/api/uso-impresion")) {
                return Promise.resolve({ ok: true, json: async () => [] })
            }
            return Promise.resolve({ ok: true, json: async () => [] })
        }) as unknown as typeof fetch

        render(<RegistroFilamentoSection />)

        await waitFor(() => expect(screen.getByRole("combobox", { name: /impresión/i })).toBeInTheDocument())

        fireEvent.change(screen.getByRole("combobox", { name: /impresión/i }), { target: { value: "imp1" } })
        fireEvent.change(screen.getByRole("combobox", { name: /artículo/i }), { target: { value: "art1" } })
        fireEvent.change(screen.getByRole("spinbutton", { name: /cantidad utilizada/i }), { target: { value: "150" } })

        fireEvent.click(screen.getByRole("button", { name: /registrar uso/i }))

        await waitFor(() => {
            expect(screen.getByText(/stock bajo/i)).toBeInTheDocument()
        })
    })

    it("9. muestra alerta de stock agotado despues del registro", async () => {
        global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
            if (url.includes("/api/solicitudes")) {
                return Promise.resolve({ ok: true, json: async () => mockImpresiones })
            }
            if (url.includes("/api/articulos")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => [{ ...mockArticulos[0], cantidad_actual: 50 }],
                })
            }
            if (url.includes("/api/uso-impresion") && init?.method === "POST") {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        id: "u-agotado",
                        stockAnterior: 50,
                        cantidad: 50,
                        stockRestante: 0, // agotado
                    }),
                })
            }
            if (url.includes("/api/uso-impresion")) {
                return Promise.resolve({ ok: true, json: async () => [] })
            }
            return Promise.resolve({ ok: true, json: async () => [] })
        }) as unknown as typeof fetch

        render(<RegistroFilamentoSection />)

        await waitFor(() => expect(screen.getByRole("combobox", { name: /impresión/i })).toBeInTheDocument())

        fireEvent.change(screen.getByRole("combobox", { name: /impresión/i }), { target: { value: "imp1" } })
        fireEvent.change(screen.getByRole("combobox", { name: /artículo/i }), { target: { value: "art1" } })
        fireEvent.change(screen.getByRole("spinbutton", { name: /cantidad utilizada/i }), { target: { value: "50" } })

        fireEvent.click(screen.getByRole("button", { name: /registrar uso/i }))

        await waitFor(() => {
            expect(screen.getByText(/stock agotado/i)).toBeInTheDocument()
        })
    })

    it("10. muestra el historial en la tabla", async () => {
        render(<RegistroFilamentoSection />)

        await waitFor(() => {
            const tabla = screen.getByRole("table")
            expect(within(tabla).getByText("PERSONAL — Ana Torres")).toBeInTheDocument()
            expect(within(tabla).getByText(/PLA Negro/i)).toBeInTheDocument()
        })
    })

    it("11. deshabilita el botón mientras guarda (anti-doble-envío)", async () => {
        let resolverPost: (value: unknown) => void
        const postPromise = new Promise((res) => {
            resolverPost = res
        })

        global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
            if (url.includes("/api/solicitudes")) {
                return Promise.resolve({ ok: true, json: async () => mockImpresiones })
            }
            if (url.includes("/api/articulos")) {
                return Promise.resolve({ ok: true, json: async () => mockArticulos })
            }
            if (url.includes("/api/uso-impresion") && init?.method === "POST") {
                return postPromise
            }
            if (url.includes("/api/uso-impresion")) {
                return Promise.resolve({ ok: true, json: async () => [] })
            }
            return Promise.resolve({ ok: true, json: async () => [] })
        }) as unknown as typeof fetch

        render(<RegistroFilamentoSection />)

        await waitFor(() => expect(screen.getByRole("combobox", { name: /impresión/i })).toBeInTheDocument())

        fireEvent.change(screen.getByRole("combobox", { name: /impresión/i }), { target: { value: "imp1" } })
        fireEvent.change(screen.getByRole("combobox", { name: /artículo/i }), { target: { value: "art1" } })
        fireEvent.change(screen.getByRole("spinbutton", { name: /cantidad utilizada/i }), { target: { value: "50" } })

        const btn = screen.getByRole("button", { name: /registrar uso/i })
        fireEvent.click(btn)

        // Mientras el POST está pendiente, el botón debe estar deshabilitado
        await waitFor(() => {
            expect(screen.getByRole("button", { name: /registrando/i })).toBeDisabled()
        })

        // Intentar un segundo clic
        fireEvent.click(screen.getByRole("button", { name: /registrando/i }))
        
        // Comprobar que registrarUso (el fetch POST) fue llamado solamente una vez
        const postCalls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
            ([url, init]: [string, RequestInit | undefined]) => url.includes("/api/uso-impresion") && init?.method === "POST"
        )
        expect(postCalls.length).toBe(1)

        // Resolver el POST para limpiar el estado
        act(() => {
            resolverPost!({
                ok: true,
                json: async () => ({ id: "u", stockAnterior: 200, cantidad: 50, stockRestante: 150 }),
            })
        })
    })
})
