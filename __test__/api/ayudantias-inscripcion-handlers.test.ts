/* eslint-disable @typescript-eslint/naming-convention */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockSupabaseClient } from "../helpers/supabaseMock"

const mock = createMockSupabaseClient()

vi.mock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(() => Promise.resolve(mock.client)),
}))

const params = Promise.resolve({ id: "a1" })
const request = new Request("http://localhost/api/ayudantias/a1/inscripcion", { method: "POST" })

describe("CUR-03 - Handlers reales de /api/ayudantias/[id]/inscripcion", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("POST retorna 401 si no hay usuario autenticado", async () => {
        const { POST } = await import("@/app/api/ayudantias/[id]/inscripcion/route")
        mock.setUser(null)

        const res = await POST(request, { params })

        expect(res.status).toBe(401)
    })

    it("POST retorna 403 si el rol no es ESTUDIANTE", async () => {
        const { POST } = await import("@/app/api/ayudantias/[id]/inscripcion/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })

        const res = await POST(request, { params })

        expect(res.status).toBe(403)
    })

    it("POST retorna 404 si la ayudantía no existe", async () => {
        const { POST } = await import("@/app/api/ayudantias/[id]/inscripcion/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "ESTUDIANTE" })
        mock.queueFrom(null, { message: "no encontrada" })

        const res = await POST(request, { params })

        expect(res.status).toBe(404)
    })

    it("POST retorna 409 si la ayudantía está inactiva", async () => {
        const { POST } = await import("@/app/api/ayudantias/[id]/inscripcion/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "ESTUDIANTE" })
        mock.queueFrom({ id: "a1", activo: false, cupos: 5, curso: null })

        const res = await POST(request, { params })

        expect(res.status).toBe(409)
    })

    it("POST retorna 409 si el estudiante ya está inscrito", async () => {
        const { POST } = await import("@/app/api/ayudantias/[id]/inscripcion/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "ESTUDIANTE" })
        mock.queueFrom({ id: "a1", activo: true, cupos: 5, curso: null })
        mock.queueFrom({ ayudantia_id: "a1" })

        const res = await POST(request, { params })

        expect(res.status).toBe(409)
    })

    it("POST retorna 409 si no hay cupos disponibles", async () => {
        const { POST } = await import("@/app/api/ayudantias/[id]/inscripcion/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "ESTUDIANTE" })
        mock.queueFrom({ id: "a1", activo: true, cupos: 2, curso: null })
        mock.queueFrom(null)
        mock.queueFrom([{ estudiante_id: "u2" }, { estudiante_id: "u3" }])

        const res = await POST(request, { params })

        expect(res.status).toBe(409)
    })

    it("POST retorna 409 si ya alcanzó el máximo de 2 ayudantías del semestre", async () => {
        const { POST } = await import("@/app/api/ayudantias/[id]/inscripcion/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "ESTUDIANTE" })
        mock.queueFrom({ id: "a1", activo: true, cupos: 5, curso: { semestre_id: "s1" } })
        mock.queueFrom(null)
        mock.queueFrom([{ estudiante_id: "u2" }])
        mock.queueFrom([
            { ayudantia: { curso: { semestre_id: "s1" } } },
            { ayudantia: { curso: { semestre_id: "s1" } } },
        ])

        const res = await POST(request, { params })
        const body = await res.json()

        expect(res.status).toBe(409)
        expect(body.error).toMatch(/máximo de 2/)
    })

    it("POST inscribe correctamente cuando hay cupos y no se supera el máximo por semestre", async () => {
        const { POST } = await import("@/app/api/ayudantias/[id]/inscripcion/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "ESTUDIANTE" })
        mock.queueFrom({ id: "a1", activo: true, cupos: 5, curso: { semestre_id: "s1" } })
        mock.queueFrom(null)
        mock.queueFrom([{ estudiante_id: "u2" }])
        mock.queueFrom([{ ayudantia: { curso: { semestre_id: "s1" } } }])
        mock.queueFrom({ ayudantia_id: "a1", estudiante_id: "u1" })

        const res = await POST(request, { params })
        const body = await res.json()

        expect(res.status).toBe(201)
        expect(body.ok).toBe(true)
    })

    it("POST retorna 500 si la inserción falla", async () => {
        const { POST } = await import("@/app/api/ayudantias/[id]/inscripcion/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "ESTUDIANTE" })
        mock.queueFrom({ id: "a1", activo: true, cupos: 5, curso: null })
        mock.queueFrom(null)
        mock.queueFrom([])
        mock.queueFrom(null, { message: "db error" })

        const res = await POST(request, { params })

        expect(res.status).toBe(500)
    })

    it("DELETE retorna 401 si no hay usuario autenticado", async () => {
        const { DELETE } = await import("@/app/api/ayudantias/[id]/inscripcion/route")
        mock.setUser(null)

        const res = await DELETE(request, { params })

        expect(res.status).toBe(401)
    })

    it("DELETE desinscribe correctamente al propio estudiante", async () => {
        const { DELETE } = await import("@/app/api/ayudantias/[id]/inscripcion/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom(null)

        const res = await DELETE(request, { params })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.ok).toBe(true)
    })

    it("DELETE retorna 500 si falla la eliminación", async () => {
        const { DELETE } = await import("@/app/api/ayudantias/[id]/inscripcion/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom(null, { message: "db error" })

        const res = await DELETE(request, { params })

        expect(res.status).toBe(500)
    })
})
