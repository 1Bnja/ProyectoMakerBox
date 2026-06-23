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

        const res = await GET()

        expect(res.status).toBe(401)
    })

    it("retorna 500 si supabase falla", async () => {
        const { GET } = await import("@/app/api/grupos/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom(null, { message: "db error" })

        const res = await GET()

        expect(res.status).toBe(500)
    })

    it("retorna la lista de grupos", async () => {
        const { GET } = await import("@/app/api/grupos/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom([{ id: "g1", nombre: "Grupo 1" }])

        const res = await GET()
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toEqual([{ id: "g1", nombre: "Grupo 1" }])
    })
})
