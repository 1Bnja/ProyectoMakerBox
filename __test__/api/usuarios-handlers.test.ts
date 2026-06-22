import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockSupabaseClient, createMockAdminClient } from "../helpers/supabaseMock"

const mock = createMockSupabaseClient()
const adminMock = createMockAdminClient()

vi.mock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(() => Promise.resolve(mock.client)),
}))

vi.mock("@/lib/supabase/admin", () => ({
    createSupabaseAdminClient: vi.fn(() => adminMock.client),
}))

function postRequest(body: unknown) {
    return new Request("http://localhost/api/usuarios", { method: "POST", body: JSON.stringify(body) })
}

function patchRequest(body: unknown) {
    return new Request("http://localhost/api/usuarios/u2", { method: "PATCH", body: JSON.stringify(body) })
}

const params = Promise.resolve({ id: "u2" })

describe("USR-03 - Handlers reales de /api/usuarios", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("POST", () => {
        it("retorna 401 si no hay usuario autenticado", async () => {
            const { POST } = await import("@/app/api/usuarios/route")
            mock.setUser(null)

            const res = await POST(postRequest({}))

            expect(res.status).toBe(401)
        })

        it("retorna 403 si el usuario no es ADMIN ni AYUDANTE", async () => {
            const { POST } = await import("@/app/api/usuarios/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "PROFESOR" })

            const res = await POST(postRequest({ email: "a@a.cl", password: "123456", nombre: "A", apellido: "B", rol: "PROFESOR" }))

            expect(res.status).toBe(403)
        })

        it("retorna 400 si faltan campos requeridos", async () => {
            const { POST } = await import("@/app/api/usuarios/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "ADMIN" })

            const res = await POST(postRequest({ email: "a@a.cl" }))

            expect(res.status).toBe(400)
        })

        it("retorna 400 si el rol no es AYUDANTE ni PROFESOR", async () => {
            const { POST } = await import("@/app/api/usuarios/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "ADMIN" })

            const res = await POST(postRequest({ email: "a@a.cl", password: "123456", nombre: "A", apellido: "B", rol: "ESTUDIANTE" }))

            expect(res.status).toBe(400)
        })

        it("retorna 403 si un AYUDANTE intenta crear otro AYUDANTE", async () => {
            const { POST } = await import("@/app/api/usuarios/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })

            const res = await POST(postRequest({ email: "a@a.cl", password: "123456", nombre: "A", apellido: "B", rol: "AYUDANTE" }))

            expect(res.status).toBe(403)
        })

        it("permite que un AYUDANTE cree un PROFESOR", async () => {
            const { POST } = await import("@/app/api/usuarios/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            adminMock.createUser.mockResolvedValue({ data: { user: { id: "new-1" } }, error: null })
            mock.queueFrom(null)

            const res = await POST(postRequest({ email: "p@a.cl", password: "123456", nombre: "P", apellido: "Q", rol: "PROFESOR" }))
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body.rol).toBe("PROFESOR")
        })

        it("permite que un ADMIN cree un AYUDANTE", async () => {
            const { POST } = await import("@/app/api/usuarios/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "ADMIN" })
            adminMock.createUser.mockResolvedValue({ data: { user: { id: "new-2" } }, error: null })
            mock.queueFrom(null)

            const res = await POST(postRequest({ email: "ay@a.cl", password: "123456", nombre: "Ay", apellido: "Q", rol: "AYUDANTE" }))
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body.rol).toBe("AYUDANTE")
        })

        it("retorna 500 si falla la creación en auth", async () => {
            const { POST } = await import("@/app/api/usuarios/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "ADMIN" })
            adminMock.createUser.mockResolvedValue({ data: { user: null }, error: { message: "ya existe" } })

            const res = await POST(postRequest({ email: "a@a.cl", password: "123456", nombre: "A", apellido: "B", rol: "PROFESOR" }))

            expect(res.status).toBe(500)
        })

        it("retorna 500 y revierte el usuario de auth si falla el insert en perfiles", async () => {
            const { POST } = await import("@/app/api/usuarios/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "ADMIN" })
            adminMock.createUser.mockResolvedValue({ data: { user: { id: "new-1" } }, error: null })
            mock.queueFrom(null, { message: "insert failed" })

            const res = await POST(postRequest({ email: "a@a.cl", password: "123456", nombre: "A", apellido: "B", rol: "PROFESOR" }))

            expect(res.status).toBe(500)
            expect(adminMock.deleteUser).toHaveBeenCalledWith("new-1")
        })
    })

    describe("GET", () => {
        it("retorna 401 si no hay usuario autenticado", async () => {
            const { GET } = await import("@/app/api/usuarios/route")
            mock.setUser(null)

            const res = await GET()

            expect(res.status).toBe(401)
        })

        it("retorna 403 si el usuario no es ADMIN ni AYUDANTE", async () => {
            const { GET } = await import("@/app/api/usuarios/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "ESTUDIANTE" })

            const res = await GET()

            expect(res.status).toBe(403)
        })

        it("ADMIN ve tanto AYUDANTE como PROFESOR", async () => {
            const { GET } = await import("@/app/api/usuarios/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "ADMIN" })
            mock.queueFrom([{ id: "a1", rol: "AYUDANTE" }, { id: "p1", rol: "PROFESOR" }])

            const res = await GET()
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body).toHaveLength(2)
        })

        it("AYUDANTE solo ve PROFESOR en la consulta", async () => {
            const { GET } = await import("@/app/api/usuarios/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom([{ id: "p1", rol: "PROFESOR" }])

            const res = await GET()
            const body = await res.json()

            expect(body).toEqual([{ id: "p1", rol: "PROFESOR" }])
        })

        it("retorna 500 si supabase falla", async () => {
            const { GET } = await import("@/app/api/usuarios/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "ADMIN" })
            mock.queueFrom(null, { message: "db error" })

            const res = await GET()

            expect(res.status).toBe(500)
        })
    })

    describe("PATCH /[id]", () => {
        it("retorna 401 si no hay usuario autenticado", async () => {
            const { PATCH } = await import("@/app/api/usuarios/[id]/route")
            mock.setUser(null)

            const res = await PATCH(patchRequest({}), { params })

            expect(res.status).toBe(401)
        })

        it("retorna 403 si el usuario no es ADMIN ni AYUDANTE", async () => {
            const { PATCH } = await import("@/app/api/usuarios/[id]/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "PROFESOR" })

            const res = await PATCH(patchRequest({ activo: false }), { params })

            expect(res.status).toBe(403)
        })

        it("retorna 400 si no hay campos para actualizar", async () => {
            const { PATCH } = await import("@/app/api/usuarios/[id]/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "ADMIN" })

            const res = await PATCH(patchRequest({}), { params })

            expect(res.status).toBe(400)
        })

        it("ADMIN puede editar un usuario con rol AYUDANTE o PROFESOR", async () => {
            const { PATCH } = await import("@/app/api/usuarios/[id]/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "ADMIN" })
            mock.queueFrom({ id: "u2", rol: "AYUDANTE", activo: false })

            const res = await PATCH(patchRequest({ activo: false }), { params })
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body.activo).toBe(false)
        })

        it("AYUDANTE editando queda acotado a filas con rol PROFESOR (vía .in)", async () => {
            const { PATCH } = await import("@/app/api/usuarios/[id]/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom({ id: "u2", rol: "PROFESOR", activo: false })

            const res = await PATCH(patchRequest({ activo: false }), { params })

            expect(res.status).toBe(200)
        })

        it("retorna 500 si falla el update", async () => {
            const { PATCH } = await import("@/app/api/usuarios/[id]/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "ADMIN" })
            mock.queueFrom(null, { message: "update failed" })

            const res = await PATCH(patchRequest({ activo: false }), { params })

            expect(res.status).toBe(500)
        })
    })
})
