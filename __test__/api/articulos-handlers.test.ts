import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockSupabaseClient } from "../helpers/supabaseMock"

/* eslint-disable @typescript-eslint/naming-convention */

const mock = createMockSupabaseClient()

vi.mock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(() => Promise.resolve(mock.client)),
}))

describe("INV-01 - Handlers reales de /api/articulos", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("GET /api/articulos", () => {
        it("1. GET retorna los artículos", async () => {
            const { GET } = await import("@/app/api/articulos/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom([
                { id: "1", nombre: "Articulo A", cantidad_actual: 10, stock_minimo: 5, unidad_medida: "gr", notificar_stock: true }
            ])

            const res = await GET()
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveLength(1)
            expect(body[0].nombre).toBe("Articulo A")
        })
    })

    describe("POST /api/articulos", () => {
        it("2. POST crea un artículo válido", async () => {
            const { POST } = await import("@/app/api/articulos/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ id: "2", nombre: "Nuevo", cantidad_actual: 10, stock_minimo: 5, unidad_medida: "gr" })

            const req = new Request("http://localhost/api/articulos", {
                method: "POST",
                body: JSON.stringify({
                    nombre: "Nuevo",
                    cantidad_actual: 10,
                    stock_minimo: 5,
                    unidad_medida: "gr",
                    notificar_stock: true
                })
            })

            const res = await POST(req)
            const body = await res.json()

            expect(res.status).toBe(201)
            expect(body.id).toBe("2")
        })

        it("3. POST rechaza nombre vacío", async () => {
            const { POST } = await import("@/app/api/articulos/route")
            mock.setUser({ id: "u1" })

            const req = new Request("http://localhost/api/articulos", {
                method: "POST",
                body: JSON.stringify({
                    nombre: "   ",
                    cantidad_actual: 10,
                    stock_minimo: 5,
                    unidad_medida: "gr",
                    notificar_stock: true
                })
            })

            const res = await POST(req)
            expect(res.status).toBe(400)
        })

        it("4. POST rechaza cantidad negativa", async () => {
            const { POST } = await import("@/app/api/articulos/route")
            mock.setUser({ id: "u1" })

            const req = new Request("http://localhost/api/articulos", {
                method: "POST",
                body: JSON.stringify({
                    nombre: "Item",
                    cantidad_actual: -5,
                    stock_minimo: 5,
                    unidad_medida: "gr"
                })
            })

            const res = await POST(req)
            expect(res.status).toBe(400)
        })

        it("5. POST rechaza stock mínimo negativo", async () => {
            const { POST } = await import("@/app/api/articulos/route")
            mock.setUser({ id: "u1" })

            const req = new Request("http://localhost/api/articulos", {
                method: "POST",
                body: JSON.stringify({
                    nombre: "Item",
                    cantidad_actual: 10,
                    stock_minimo: -1,
                    unidad_medida: "gr"
                })
            })

            const res = await POST(req)
            expect(res.status).toBe(400)
        })

        it("6. POST rechaza unidad vacía", async () => {
            const { POST } = await import("@/app/api/articulos/route")
            mock.setUser({ id: "u1" })

            const req = new Request("http://localhost/api/articulos", {
                method: "POST",
                body: JSON.stringify({
                    nombre: "Item",
                    cantidad_actual: 10,
                    stock_minimo: 5,
                    unidad_medida: "  "
                })
            })

            const res = await POST(req)
            expect(res.status).toBe(400)
        })
    })

    describe("PATCH /api/articulos/[id]", () => {
        it("7. PATCH actualiza un artículo", async () => {
            const { PATCH } = await import("@/app/api/articulos/[id]/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ id: "1" }) // exists check
            mock.queueFrom({ id: "1", nombre: "Actualizado" }) // update result

            const req = new Request("http://localhost/api/articulos/1", {
                method: "PATCH",
                body: JSON.stringify({
                    nombre: "Actualizado",
                })
            })

            const res = await PATCH(req, { params: Promise.resolve({ id: "1" }) })
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body.nombre).toBe("Actualizado")
        })

        it("8. PATCH retorna 404 si no existe", async () => {
            const { PATCH } = await import("@/app/api/articulos/[id]/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom(null, { message: "not found" })

            const req = new Request("http://localhost/api/articulos/999", {
                method: "PATCH",
                body: JSON.stringify({
                    nombre: "Actualizado",
                })
            })

            const res = await PATCH(req, { params: Promise.resolve({ id: "999" }) })
            expect(res.status).toBe(404)
        })

        it("9. PATCH rechaza valores inválidos", async () => {
            const { PATCH } = await import("@/app/api/articulos/[id]/route")
            mock.setUser({ id: "u1" })

            const req = new Request("http://localhost/api/articulos/1", {
                method: "PATCH",
                body: JSON.stringify({
                    cantidad_actual: -10,
                })
            })

            const res = await PATCH(req, { params: Promise.resolve({ id: "1" }) })
            expect(res.status).toBe(400)
        })
    })
})
