/* eslint-disable @typescript-eslint/naming-convention */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockSupabaseClient } from "../helpers/supabaseMock"

const mock = createMockSupabaseClient()

vi.mock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(() => Promise.resolve(mock.client)),
}))

describe("USR-02 - Handlers reales de /api/grupos", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("retorna 401 si no hay usuario autenticado", async () => {
        const { GET } = await import("@/app/api/grupos/route")
        mock.setUser(null)

        const res = await GET(new Request("http://localhost/api/grupos?curso_id=c1"))

        expect(res.status).toBe(401)
    })

    it("retorna 500 si supabase falla", async () => {
        const { GET } = await import("@/app/api/grupos/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom(null, { message: "db error" })

        const res = await GET(new Request("http://localhost/api/grupos?curso_id=c1"))

        expect(res.status).toBe(500)
    })

    it("retorna 400 si no se envía curso_id", async () => {
        const { GET } = await import("@/app/api/grupos/route")
        mock.setUser({ id: "u1" })

        const res = await GET(new Request("http://localhost/api/grupos"))

        expect(res.status).toBe(400)
    })

    it("retorna la lista de grupos", async () => {
        const { GET } = await import("@/app/api/grupos/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom([{ id: "g1", nombre: "Grupo 1", curso_id: "c1" }])

        const res = await GET(new Request("http://localhost/api/grupos?curso_id=c1"))
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toEqual([{ id: "g1", nombre: "Grupo 1", curso_id: "c1" }])
    })

    function postRequest(body: Record<string, unknown>) {
        return new Request("http://localhost/api/grupos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
    }

    it("POST retorna 401 si no hay usuario autenticado", async () => {
        const { POST } = await import("@/app/api/grupos/route")
        mock.setUser(null)

        const res = await POST(postRequest({ nombre: "Grupo A", curso_id: "c1" }))

        expect(res.status).toBe(401)
    })

    it("POST retorna 403 si el rol no es AYUDANTE ni PROFESOR", async () => {
        const { POST } = await import("@/app/api/grupos/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "ESTUDIANTE" })

        const res = await POST(postRequest({ nombre: "Grupo A", curso_id: "c1" }))

        expect(res.status).toBe(403)
    })

    it("POST retorna 400 si falta nombre o curso_id", async () => {
        const { POST } = await import("@/app/api/grupos/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })

        const res = await POST(postRequest({ nombre: "Grupo A" }))

        expect(res.status).toBe(400)
    })

    it("POST retorna 404 si el curso no existe", async () => {
        const { POST } = await import("@/app/api/grupos/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom(null, { message: "no encontrado" })

        const res = await POST(postRequest({ nombre: "Grupo A", curso_id: "c1" }))

        expect(res.status).toBe(404)
    })

    it("POST retorna 403 si un PROFESOR intenta crear un grupo en un curso que no es suyo", async () => {
        const { POST } = await import("@/app/api/grupos/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "PROFESOR" })
        mock.queueFrom({ id: "c1", profesor_id: "otro-profesor" })

        const res = await POST(postRequest({ nombre: "Grupo A", curso_id: "c1" }))

        expect(res.status).toBe(403)
    })

    it("POST permite a un PROFESOR crear un grupo en su propio curso", async () => {
        const { POST } = await import("@/app/api/grupos/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "PROFESOR" })
        mock.queueFrom({ id: "c1", profesor_id: "u1" })
        mock.queueFrom({ id: "g1", nombre: "Grupo A", curso_id: "c1" })

        const res = await POST(postRequest({ nombre: "Grupo A", curso_id: "c1" }))
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toEqual({ id: "g1", nombre: "Grupo A", curso_id: "c1" })
    })

    it("POST permite a un AYUDANTE crear un grupo en cualquier curso", async () => {
        const { POST } = await import("@/app/api/grupos/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({ id: "c1", profesor_id: "alguien-mas" })
        mock.queueFrom({ id: "g1", nombre: "Grupo A", curso_id: "c1" })

        const res = await POST(postRequest({ nombre: "Grupo A", curso_id: "c1" }))
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toEqual({ id: "g1", nombre: "Grupo A", curso_id: "c1" })
    })

    it("POST retorna 500 si la inserción falla", async () => {
        const { POST } = await import("@/app/api/grupos/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({ id: "c1", profesor_id: "alguien-mas" })
        mock.queueFrom(null, { message: "db error" })

        const res = await POST(postRequest({ nombre: "Grupo A", curso_id: "c1" }))

        expect(res.status).toBe(500)
    })
})
