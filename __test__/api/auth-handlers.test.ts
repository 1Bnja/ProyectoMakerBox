import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockSupabaseClient } from "../helpers/supabaseMock"

const mock = createMockSupabaseClient()

vi.mock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(() => Promise.resolve(mock.client)),
}))

function loginRequest(body: unknown) {
    return new Request("http://localhost/api/auth/login", { method: "POST", body: JSON.stringify(body) })
}

describe("AUTH-01 - Handlers reales de /api/auth", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("POST /api/auth/login", () => {
        it("retorna 400 si faltan email o contraseña", async () => {
            const { POST } = await import("@/app/api/auth/login/route")

            const res = await POST(loginRequest({ email: "a@a.cl" }))

            expect(res.status).toBe(400)
        })

        it("retorna 401 si las credenciales son inválidas", async () => {
            const { POST } = await import("@/app/api/auth/login/route")
            mock.client.auth.signInWithPassword.mockResolvedValue({
                data: { user: null },
                error: { message: "Invalid login credentials" },
            })

            const res = await POST(loginRequest({ email: "a@a.cl", password: "wrong" }))

            expect(res.status).toBe(401)
        })

        it("retorna 404 si el usuario autenticado no tiene perfil", async () => {
            const { POST } = await import("@/app/api/auth/login/route")
            mock.client.auth.signInWithPassword.mockResolvedValue({
                data: { user: { id: "u1" } },
                error: null,
            })
            mock.queueFrom(null, { message: "not found" })

            const res = await POST(loginRequest({ email: "a@a.cl", password: "123456" }))

            expect(res.status).toBe(404)
        })

        it("retorna el rol del perfil cuando el login es exitoso", async () => {
            const { POST } = await import("@/app/api/auth/login/route")
            mock.client.auth.signInWithPassword.mockResolvedValue({
                data: { user: { id: "u1" } },
                error: null,
            })
            mock.queueFrom({ rol: "AYUDANTE" })

            const res = await POST(loginRequest({ email: "a@a.cl", password: "123456" }))
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body.rol).toBe("AYUDANTE")
        })
    })

    describe("GET /api/auth/me", () => {
        it("retorna 401 si no hay usuario autenticado", async () => {
            const { GET } = await import("@/app/api/auth/me/route")
            mock.setUser(null)

            const res = await GET()

            expect(res.status).toBe(401)
        })

        it("retorna 404 si no se encuentra el perfil", async () => {
            const { GET } = await import("@/app/api/auth/me/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom(null, { message: "not found" })

            const res = await GET()

            expect(res.status).toBe(404)
        })

        it("retorna el perfil del usuario autenticado", async () => {
            const { GET } = await import("@/app/api/auth/me/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ nombre: "Ana", apellido: "Soto", rol: "AYUDANTE" })

            const res = await GET()
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body.rol).toBe("AYUDANTE")
        })
    })
})
