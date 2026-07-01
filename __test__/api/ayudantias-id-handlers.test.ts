/* eslint-disable @typescript-eslint/naming-convention */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockSupabaseClient } from "../helpers/supabaseMock"

const mock = createMockSupabaseClient()

vi.mock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(() => Promise.resolve(mock.client)),
}))

function patchRequest(body: Record<string, unknown>) {
    return new Request("http://localhost/api/ayudantias/a1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
}

const params = Promise.resolve({ id: "a1" })

describe("CUR-02 - Handlers reales de /api/ayudantias/[id]", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("retorna 401 si no hay usuario autenticado", async () => {
        const { PATCH } = await import("@/app/api/ayudantias/[id]/route")
        mock.setUser(null)

        const res = await PATCH(patchRequest({ activo: false }), { params })

        expect(res.status).toBe(401)
    })

    it("retorna 403 si el rol no es AYUDANTE", async () => {
        const { PATCH } = await import("@/app/api/ayudantias/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "ESTUDIANTE" })

        const res = await PATCH(patchRequest({ activo: false }), { params })

        expect(res.status).toBe(403)
    })

    it("retorna 400 si no hay campos para actualizar", async () => {
        const { PATCH } = await import("@/app/api/ayudantias/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })

        const res = await PATCH(patchRequest({}), { params })

        expect(res.status).toBe(400)
    })

    it("desactiva la ayudantía correctamente", async () => {
        const { PATCH } = await import("@/app/api/ayudantias/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({ id: "a1", dia: "LUNES", hora_inicio: "14:00:00", hora_fin: "15:00:00", cupos: 5, activo: false })

        const res = await PATCH(patchRequest({ activo: false }), { params })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.activo).toBe(false)
    })

    it("retorna 500 si la actualización falla", async () => {
        const { PATCH } = await import("@/app/api/ayudantias/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom(null, { message: "db error" })

        const res = await PATCH(patchRequest({ activo: false }), { params })

        expect(res.status).toBe(500)
    })
})
