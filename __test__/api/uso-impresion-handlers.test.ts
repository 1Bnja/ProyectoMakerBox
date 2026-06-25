import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockSupabaseClient } from "../helpers/supabaseMock"

/* eslint-disable @typescript-eslint/naming-convention */

const mock = createMockSupabaseClient()

vi.mock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(() => Promise.resolve(mock.client)),
}))

// Fixture historial para GET
const historialFixture = [
    {
        id: "uso1",
        impresion_id: "imp1",
        articulo_id: "art1",
        cantidad: 50,
        stock_anterior: 200,
        stock_restante: 150,
        creado_en: "2026-06-25T12:00:00Z",
        articulo: { nombre: "PLA Negro", unidad_medida: "gr" },
        impresion: { tipo: "PERSONAL", estado: "APROBADA", comentario: null, created_at: "2026-06-20T00:00:00Z", solicitante: { nombre: "Ana", apellido: "Torres" } },
    },
]

// Fixture resultado de RPC exitosa (nombres snake_case como los retorna PostgreSQL)
const rpcExitoFixture = {
    id: "uso-nuevo",
    stock_anterior: 200,
    cantidad: 50,
    stock_restante: 150,
}

describe("INV-02 - Handlers reales de /api/uso-impresion", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // GET
    describe("GET /api/uso-impresion", () => {
        it("1. GET retorna el historial normalizado en camelCase", async () => {
            const { GET } = await import("@/app/api/uso-impresion/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom(historialFixture)

            const res = await GET()
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(Array.isArray(body)).toBe(true)
            expect(body[0]).toMatchObject({
                id: "uso1",
                impresionId: "imp1",
                articuloId: "art1",
                cantidad: 50,
                stockAnterior: 200,
                stockRestante: 150,
                articuloNombre: "PLA Negro",
                unidadMedida: "gr",
            })
            expect(body[0].impresionLabel).toContain("PERSONAL")
        })

        it("1b. GET retorna 401 si no hay usuario", async () => {
            const { GET } = await import("@/app/api/uso-impresion/route")
            mock.setUser(null)

            const res = await GET()
            expect(res.status).toBe(401)
        })
    })

    // POST
    describe("POST /api/uso-impresion", () => {
        it("2. POST registra un uso valido y retorna 201", async () => {
            const { POST } = await import("@/app/api/uso-impresion/route")
            mock.setUser({ id: "u1" })
            mock.queueRpc(rpcExitoFixture)

            const req = new Request("http://localhost/api/uso-impresion", {
                method: "POST",
                body: JSON.stringify({
                    impresionId: "imp1",
                    articuloId: "art1",
                    cantidad: 50,
                }),
            })

            const res = await POST(req)
            const body = await res.json()

            expect(res.status).toBe(201)
            expect(body).toMatchObject({
                id: "uso-nuevo",
                stockAnterior: 200,
                cantidad: 50,
                stockRestante: 150,
            })
        })

        it("3. POST llama la RPC con parametros snake_case correctos", async () => {
            const { POST } = await import("@/app/api/uso-impresion/route")
            mock.setUser({ id: "u1" })
            mock.queueRpc(rpcExitoFixture)

            const req = new Request("http://localhost/api/uso-impresion", {
                method: "POST",
                body: JSON.stringify({
                    impresionId: "imp-uuid",
                    articuloId: "art-uuid",
                    cantidad: 100,
                }),
            })

            await POST(req)

            expect(mock.mockRpc).toHaveBeenCalledWith("registrar_uso_filamento", {
                p_impresion_id: "imp-uuid",
                p_articulo_id: "art-uuid",
                p_cantidad: 100,
            })
        })

        it("4. POST rechaza cantidad 0 (400)", async () => {
            const { POST } = await import("@/app/api/uso-impresion/route")
            mock.setUser({ id: "u1" })

            const req = new Request("http://localhost/api/uso-impresion", {
                method: "POST",
                body: JSON.stringify({
                    impresionId: "imp1",
                    articuloId: "art1",
                    cantidad: 0,
                }),
            })

            const res = await POST(req)
            expect(res.status).toBe(400)
        })

        it("5. POST rechaza cantidad negativa (400)", async () => {
            const { POST } = await import("@/app/api/uso-impresion/route")
            mock.setUser({ id: "u1" })

            const req = new Request("http://localhost/api/uso-impresion", {
                method: "POST",
                body: JSON.stringify({
                    impresionId: "imp1",
                    articuloId: "art1",
                    cantidad: -10,
                }),
            })

            const res = await POST(req)
            expect(res.status).toBe(400)
        })

        it("6. POST rechaza datos incompletos - impresionId faltante (400)", async () => {
            const { POST } = await import("@/app/api/uso-impresion/route")
            mock.setUser({ id: "u1" })

            const req = new Request("http://localhost/api/uso-impresion", {
                method: "POST",
                body: JSON.stringify({
                    articuloId: "art1",
                    cantidad: 50,
                }),
            })

            const res = await POST(req)
            expect(res.status).toBe(400)
        })

        it("7. POST maneja stock insuficiente (409)", async () => {
            const { POST } = await import("@/app/api/uso-impresion/route")
            mock.setUser({ id: "u1" })
            mock.queueRpc(null, { message: "Stock insuficiente", code: "23514" })

            const req = new Request("http://localhost/api/uso-impresion", {
                method: "POST",
                body: JSON.stringify({
                    impresionId: "imp1",
                    articuloId: "art1",
                    cantidad: 9999,
                }),
            })

            const res = await POST(req)
            const body = await res.json()

            expect(res.status).toBe(409)
            expect(body.error).toContain("Stock insuficiente")
        })

        it("8. POST maneja impresion inexistente (404)", async () => {
            const { POST } = await import("@/app/api/uso-impresion/route")
            mock.setUser({ id: "u1" })
            mock.queueRpc(null, { message: "Impresion no encontrada", code: "P0002" })

            const req = new Request("http://localhost/api/uso-impresion", {
                method: "POST",
                body: JSON.stringify({
                    impresionId: "no-existe",
                    articuloId: "art1",
                    cantidad: 10,
                }),
            })

            const res = await POST(req)
            expect(res.status).toBe(404)
        })

        it("9. POST maneja articulo inexistente (404)", async () => {
            const { POST } = await import("@/app/api/uso-impresion/route")
            mock.setUser({ id: "u1" })
            mock.queueRpc(null, { message: "Articulo no encontrado", code: "P0002" })

            const req = new Request("http://localhost/api/uso-impresion", {
                method: "POST",
                body: JSON.stringify({
                    impresionId: "imp1",
                    articuloId: "no-existe",
                    cantidad: 10,
                }),
            })

            const res = await POST(req)
            expect(res.status).toBe(404)
        })

        it("10. POST maneja usuario no autorizado (401)", async () => {
            const { POST } = await import("@/app/api/uso-impresion/route")
            mock.setUser(null)

            const req = new Request("http://localhost/api/uso-impresion", {
                method: "POST",
                body: JSON.stringify({
                    impresionId: "imp1",
                    articuloId: "art1",
                    cantidad: 10,
                }),
            })

            const res = await POST(req)
            expect(res.status).toBe(401)
        })
    })
})
