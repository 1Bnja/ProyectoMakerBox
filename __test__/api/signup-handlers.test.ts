import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockAdminClient } from "../helpers/supabaseMock"

const adminMock = createMockAdminClient()

vi.mock("@/lib/supabase/admin", () => ({
    createSupabaseAdminClient: vi.fn(() => adminMock.client),
}))

function postRequest(body: unknown) {
    return new Request("http://localhost/api/auth/signup", { method: "POST", body: JSON.stringify(body) })
}

describe("Handlers reales de /api/auth/signup", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("retorna 400 si faltan campos requeridos", async () => {
        const { POST } = await import("@/app/api/auth/signup/route")

        const res = await POST(postRequest({ email: "a@a.cl" }))

        expect(res.status).toBe(400)
    })

    it("retorna 400 si la contraseña es muy corta", async () => {
        const { POST } = await import("@/app/api/auth/signup/route")

        const res = await POST(
            postRequest({ email: "a@a.cl", password: "123", nombre: "Ana", apellido: "Soto" })
        )

        expect(res.status).toBe(400)
    })

    it("retorna 500 si falla la creación en auth", async () => {
        const { POST } = await import("@/app/api/auth/signup/route")
        adminMock.createUser.mockResolvedValue({ data: { user: null }, error: { message: "ya existe" } })

        const res = await POST(
            postRequest({ email: "a@a.cl", password: "123456", nombre: "Ana", apellido: "Soto" })
        )

        expect(res.status).toBe(500)
    })

    it("retorna 500 y revierte el usuario de auth si falla el insert en perfiles", async () => {
        const { POST } = await import("@/app/api/auth/signup/route")
        adminMock.createUser.mockResolvedValue({ data: { user: { id: "new-1" } }, error: null })
        adminMock.queueFrom(null, { message: "insert failed" })

        const res = await POST(
            postRequest({ email: "a@a.cl", password: "123456", nombre: "Ana", apellido: "Soto" })
        )

        expect(res.status).toBe(500)
        expect(adminMock.deleteUser).toHaveBeenCalledWith("new-1")
    })

    it("crea la cuenta de Solicitante correctamente", async () => {
        const { POST } = await import("@/app/api/auth/signup/route")
        adminMock.createUser.mockResolvedValue({ data: { user: { id: "new-1" } }, error: null })
        adminMock.queueFrom(null)

        const res = await POST(
            postRequest({ email: "a@a.cl", password: "123456", nombre: "Ana", apellido: "Soto" })
        )
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.success).toBe(true)
        expect(adminMock.createUser).toHaveBeenCalledWith(
            expect.objectContaining({
                email: "a@a.cl",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                user_metadata: { nombre: "Ana", apellido: "Soto", rol: "SOLICITANTE" },
            })
        )
    })
})
