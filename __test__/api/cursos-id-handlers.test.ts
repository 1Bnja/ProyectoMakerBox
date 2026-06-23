import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockSupabaseClient } from "../helpers/supabaseMock"

/* eslint-disable @typescript-eslint/naming-convention */
const mock = createMockSupabaseClient()

vi.mock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(() => Promise.resolve(mock.client)),
}))

function patchRequest(body: unknown) {
    return new Request("http://localhost/api/cursos/c1", {
        method: "PATCH",
        body: JSON.stringify(body),
    })
}

const params = Promise.resolve({ id: "c1" })

describe("CUR-01 - Handlers reales de /api/cursos/[id]", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("retorna 401 si no hay usuario autenticado", async () => {
        const { PATCH } = await import("@/app/api/cursos/[id]/route")
        mock.setUser(null)

        const res = await PATCH(patchRequest({ nombre: "X" }), { params })

        expect(res.status).toBe(401)
    })

    it("retorna 403 si el usuario no es AYUDANTE", async () => {
        const { PATCH } = await import("@/app/api/cursos/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "ADMIN" })

        const res = await PATCH(patchRequest({ nombre: "X" }), { params })

        expect(res.status).toBe(403)
    })

    it("retorna 400 si el ayudante_id no es válido", async () => {
        const { PATCH } = await import("@/app/api/cursos/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({ rol: "PROFESOR" })

        const res = await PATCH(patchRequest({ ayudante_id: "a1" }), { params })

        expect(res.status).toBe(400)
    })

    it("retorna 400 si el profesor_id no es válido", async () => {
        const { PATCH } = await import("@/app/api/cursos/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({ rol: "AYUDANTE" })

        const res = await PATCH(patchRequest({ profesor_id: "p1" }), { params })

        expect(res.status).toBe(400)
    })

    it("permite limpiar el ayudante_id pasando null sin re-validar rol", async () => {
        const { PATCH } = await import("@/app/api/cursos/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({ id: "c1", ayudante_id: null })

        const res = await PATCH(patchRequest({ ayudante_id: null }), { params })

        expect(res.status).toBe(200)
    })

    it("retorna 400 si no hay campos para actualizar", async () => {
        const { PATCH } = await import("@/app/api/cursos/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })

        const res = await PATCH(patchRequest({}), { params })

        expect(res.status).toBe(400)
    })

    it("retorna 500 si falla el update", async () => {
        const { PATCH } = await import("@/app/api/cursos/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom(null, { message: "update failed" })

        const res = await PATCH(patchRequest({ nombre: "Nuevo nombre" }), { params })

        expect(res.status).toBe(500)
    })

    it("actualiza el curso correctamente", async () => {
        const { PATCH } = await import("@/app/api/cursos/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({ id: "c1", nombre: "Nuevo nombre", activo: true })

        const res = await PATCH(patchRequest({ nombre: "Nuevo nombre" }), { params })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.nombre).toBe("Nuevo nombre")
    })
})
/* eslint-enable @typescript-eslint/naming-convention */
