import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { InventarioSection } from "@/app/components/InventarioSection"

/* eslint-disable @typescript-eslint/naming-convention */

const mockArticulos = [
    { id: "1", nombre: "Art Normal", cantidad_actual: 10, stock_minimo: 5, unidad_medida: "u", notificar_stock: true },
    { id: "2", nombre: "Art Bajo", cantidad_actual: 3, stock_minimo: 5, unidad_medida: "u", notificar_stock: true },
    { id: "3", nombre: "Art Agotado", cantidad_actual: 0, stock_minimo: 5, unidad_medida: "u", notificar_stock: true },
    { id: "4", nombre: "Art Sin Alerta", cantidad_actual: 1, stock_minimo: 5, unidad_medida: "u", notificar_stock: false }
]

describe("INV-01 - InventarioSection", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockArticulos,
        })
    })

    it("1. renderiza artículos de la API y estados de alerta (7, 8, 9, 10)", async () => {
        render(<InventarioSection />)

        await waitFor(() => {
            expect(screen.getByText("Art Normal")).toBeInTheDocument()
        })
        
        expect(screen.getByText("Art Bajo")).toBeInTheDocument()
        expect(screen.getByText("Art Agotado")).toBeInTheDocument()
        expect(screen.getByText("Art Sin Alerta")).toBeInTheDocument()

        // Test estados de alerta (evaluarAlertaStock)
        expect(screen.getByText("Normal")).toBeInTheDocument()
        expect(screen.getByText("Stock bajo")).toBeInTheDocument()
        expect(screen.getByText("Stock agotado")).toBeInTheDocument()
        expect(screen.getByText("Sin alerta")).toBeInTheDocument()
    })

    it("2. abre modal de nuevo artículo, 3. envía formulario, 4. muestra mensaje éxito", async () => {

        global.fetch = vi.fn().mockImplementation((url, init) => {
            if (init && init.method === "POST") {
                return Promise.resolve({ ok: true, json: async () => ({ id: "5" }) })
            }
            // initial load and reload
            return Promise.resolve({ ok: true, json: async () => mockArticulos })
        })

        render(<InventarioSection />)
        await waitFor(() => expect(screen.getByText("Art Normal")).toBeInTheDocument())

        fireEvent.click(screen.getByText("+ Nuevo artículo"))
        expect(screen.getByText("Nuevo Artículo")).toBeInTheDocument()

        const textboxes = screen.getAllByRole("textbox")
        const spinbuttons = screen.getAllByRole("spinbutton")

        fireEvent.change(textboxes[0], { target: { value: "Nuevo Art" } }) // Nombre
        fireEvent.change(spinbuttons[0], { target: { value: "10" } }) // Cantidad
        fireEvent.change(spinbuttons[1], { target: { value: "5" } }) // Mínimo
        fireEvent.change(textboxes[1], { target: { value: "gr" } }) // Unidad

        fireEvent.click(screen.getByRole("button", { name: "Guardar" }))

        await waitFor(() => {
            expect(screen.getByText("Artículo creado exitosamente")).toBeInTheDocument()
        })
    })

    it("5. abre modal de edición y 6. actualiza un artículo", async () => {
        global.fetch = vi.fn().mockImplementation((url, init) => {
            if (init && init.method === "PATCH") {
                return Promise.resolve({ ok: true, json: async () => ({ id: "1" }) })
            }
            return Promise.resolve({ ok: true, json: async () => mockArticulos })
        })

        render(<InventarioSection />)
        await waitFor(() => expect(screen.getByText("Art Normal")).toBeInTheDocument())

        const btnEditar = screen.getAllByText("Editar")[0]
        fireEvent.click(btnEditar)

        expect(screen.getByText("Editar Artículo")).toBeInTheDocument()
        
        const textboxes = screen.getAllByRole("textbox")
        fireEvent.change(textboxes[0], { target: { value: "Art Normal Modificado" } })
        fireEvent.click(screen.getByRole("button", { name: "Guardar" }))

        await waitFor(() => {
            expect(screen.getByText("Artículo actualizado exitosamente")).toBeInTheDocument()
        })
    })
})
