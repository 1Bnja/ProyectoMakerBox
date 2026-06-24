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
})
