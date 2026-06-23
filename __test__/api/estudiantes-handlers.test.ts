import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockSupabaseClient, createMockAdminClient } from "../helpers/supabaseMock"

/* eslint-disable @typescript-eslint/naming-convention */
const mock = createMockSupabaseClient()
const adminMock = createMockAdminClient()

vi.mock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(() => Promise.resolve(mock.client)),
}))

vi.mock("@/lib/supabase/admin", () => ({
    createSupabaseAdminClient: vi.fn(() => adminMock.client),
}))

function postRequest(body: unknown) {
    return new Request("http://localhost/api/estudiantes", { method: "POST", body: JSON.stringify(body) })
}

function getRequest(query = "") {
    return new Request(`http://localhost/api/estudiantes${query}`)
}

const params = Promise.resolve({ id: "e1" })

describe("USR-01 - Handlers reales de /api/estudiantes", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("POST", () => {
        it("retorna 401 si no hay usuario autenticado", async () => {
            const { POST } = await import("@/app/api/estudiantes/route")
            mock.setUser(null)

            const res = await POST(postRequest({}))

            expect(res.status).toBe(401)
        })

        it("retorna 403 si el usuario no es AYUDANTE", async () => {
            const { POST } = await import("@/app/api/estudiantes/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "PROFESOR" })

            const res = await POST(postRequest({ email: "a@a.cl", password: "123456", nombre: "A", apellido: "B" }))

            expect(res.status).toBe(403)
        })

        it("retorna 400 si faltan campos requeridos", async () => {
            const { POST } = await import("@/app/api/estudiantes/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })

            const res = await POST(postRequest({ email: "a@a.cl" }))

            expect(res.status).toBe(400)
        })

        it("retorna 500 y no deja perfil huérfano si falla la creación en auth", async () => {
            const { POST } = await import("@/app/api/estudiantes/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            adminMock.createUser.mockResolvedValue({ data: { user: null }, error: { message: "ya existe" } })

            const res = await POST(postRequest({ email: "a@a.cl", password: "123456", nombre: "A", apellido: "B" }))

            expect(res.status).toBe(500)
            expect(adminMock.deleteUser).not.toHaveBeenCalled()
        })

        it("retorna 500 y revierte el usuario de auth si falla el insert en perfiles", async () => {
            const { POST } = await import("@/app/api/estudiantes/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            adminMock.createUser.mockResolvedValue({ data: { user: { id: "new-1" } }, error: null })
            mock.queueFrom(null, { message: "perfil insert failed" })

            const res = await POST(postRequest({ email: "a@a.cl", password: "123456", nombre: "A", apellido: "B" }))

            expect(res.status).toBe(500)
            expect(adminMock.deleteUser).toHaveBeenCalledWith("new-1")
        })

        it("crea el estudiante sin curso correctamente", async () => {
            const { POST } = await import("@/app/api/estudiantes/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            adminMock.createUser.mockResolvedValue({ data: { user: { id: "new-1" } }, error: null })
            mock.queueFrom(null)

            const res = await POST(postRequest({ email: "a@a.cl", password: "123456", nombre: "A", apellido: "B" }))
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body.id).toBe("new-1")
            expect(body.curso_id).toBeNull()
        })

        it("crea el estudiante y lo asocia al curso en curso_estudiantes", async () => {
            const { POST } = await import("@/app/api/estudiantes/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            adminMock.createUser.mockResolvedValue({ data: { user: { id: "new-1" } }, error: null })
            mock.queueFrom(null)
            mock.queueFrom(null)

            const res = await POST(
                postRequest({ email: "a@a.cl", password: "123456", nombre: "A", apellido: "B", curso_id: "c1" })
            )
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body.curso_id).toBe("c1")
        })

        it("retorna 500 si falla la asociación a curso_estudiantes", async () => {
            const { POST } = await import("@/app/api/estudiantes/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            adminMock.createUser.mockResolvedValue({ data: { user: { id: "new-1" } }, error: null })
            mock.queueFrom(null)
            mock.queueFrom(null, { message: "fk violation" })

            const res = await POST(
                postRequest({ email: "a@a.cl", password: "123456", nombre: "A", apellido: "B", curso_id: "c1" })
            )

            expect(res.status).toBe(500)
        })
    })

    describe("GET", () => {
        it("retorna 401 si no hay usuario autenticado", async () => {
            const { GET } = await import("@/app/api/estudiantes/route")
            mock.setUser(null)

            const res = await GET(getRequest())

            expect(res.status).toBe(401)
        })

        it("retorna 403 si el usuario no tiene un rol con acceso de lectura", async () => {
            const { GET } = await import("@/app/api/estudiantes/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "ESTUDIANTE" })

            const res = await GET(getRequest())

            expect(res.status).toBe(403)
        })

        it("permite a PROFESOR listar estudiantes (solo lectura)", async () => {
            const { GET } = await import("@/app/api/estudiantes/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "PROFESOR" })
            mock.queueFrom([
                { id: "e1", nombre: "Ana", apellido: "Soto", email: "a@a.cl", rol: "ESTUDIANTE", activo: true, curso_estudiantes: [] },
            ])

            const res = await GET(getRequest())
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body[0].curso_id).toBeNull()
        })

        it("aplana la relación curso_estudiantes cuando el estudiante tiene curso", async () => {
            const { GET } = await import("@/app/api/estudiantes/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom([
                {
                    id: "e1",
                    nombre: "Ana",
                    apellido: "Soto",
                    email: "a@a.cl",
                    rol: "ESTUDIANTE",
                    activo: true,
                    curso_estudiantes: [{ curso_id: "c1", cursos: { nombre: "Curso 1" } }],
                },
            ])

            const res = await GET(getRequest())
            const body = await res.json()

            expect(body[0].curso_id).toBe("c1")
            expect(body[0].cursos.nombre).toBe("Curso 1")
        })

        it("filtra por curso_id cuando se pasa como query param", async () => {
            const { GET } = await import("@/app/api/estudiantes/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom([])

            const res = await GET(getRequest("?curso_id=c1"))

            expect(res.status).toBe(200)
        })

        it("retorna 500 si supabase falla", async () => {
            const { GET } = await import("@/app/api/estudiantes/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom(null, { message: "db error" })

            const res = await GET(getRequest())

            expect(res.status).toBe(500)
        })
    })

    describe("PATCH /[id]", () => {
        function patchRequest(body: unknown) {
            return new Request("http://localhost/api/estudiantes/e1", { method: "PATCH", body: JSON.stringify(body) })
        }

        it("retorna 401 si no hay usuario autenticado", async () => {
            const { PATCH } = await import("@/app/api/estudiantes/[id]/route")
            mock.setUser(null)

            const res = await PATCH(patchRequest({}), { params })

            expect(res.status).toBe(401)
        })

        it("retorna 403 si el usuario no es AYUDANTE", async () => {
            const { PATCH } = await import("@/app/api/estudiantes/[id]/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "PROFESOR" })

            const res = await PATCH(patchRequest({ activo: false }), { params })

            expect(res.status).toBe(403)
        })

        it("retorna 400 si no hay campos para actualizar", async () => {
            const { PATCH } = await import("@/app/api/estudiantes/[id]/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })

            const res = await PATCH(patchRequest({}), { params })

            expect(res.status).toBe(400)
        })

        it("retorna 500 si falla el update de perfiles", async () => {
            const { PATCH } = await import("@/app/api/estudiantes/[id]/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom(null, { message: "update failed" })

            const res = await PATCH(patchRequest({ activo: false }), { params })

            expect(res.status).toBe(500)
        })

        it("reasigna el curso: borra la relación previa e inserta la nueva", async () => {
            const { PATCH } = await import("@/app/api/estudiantes/[id]/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom(null)
            mock.queueFrom(null)
            mock.queueFrom({ id: "e1", nombre: "Ana", apellido: "Soto", email: "a@a.cl", rol: "ESTUDIANTE", activo: true, curso_estudiantes: [{ curso_id: "c2" }] })

            const res = await PATCH(patchRequest({ curso_id: "c2" }), { params })
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body.curso_id).toBe("c2")
        })

        it("quita el curso cuando se pasa curso_id null", async () => {
            const { PATCH } = await import("@/app/api/estudiantes/[id]/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom(null)
            mock.queueFrom({ id: "e1", nombre: "Ana", apellido: "Soto", email: "a@a.cl", rol: "ESTUDIANTE", activo: true, curso_estudiantes: [] })

            const res = await PATCH(patchRequest({ curso_id: null }), { params })
            const body = await res.json()

            expect(body.curso_id).toBeNull()
        })

        it("retorna 500 si falla el delete de curso_estudiantes", async () => {
            const { PATCH } = await import("@/app/api/estudiantes/[id]/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom(null, { message: "delete failed" })

            const res = await PATCH(patchRequest({ curso_id: "c2" }), { params })

            expect(res.status).toBe(500)
        })

        it("retorna 500 si falla el insert de curso_estudiantes", async () => {
            const { PATCH } = await import("@/app/api/estudiantes/[id]/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom(null)
            mock.queueFrom(null, { message: "insert failed" })

            const res = await PATCH(patchRequest({ curso_id: "c2" }), { params })

            expect(res.status).toBe(500)
        })

        it("actualiza solo nombre/apellido/activo sin tocar curso_estudiantes", async () => {
            const { PATCH } = await import("@/app/api/estudiantes/[id]/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom(null)
            mock.queueFrom({ id: "e1", nombre: "Nuevo", apellido: "Soto", email: "a@a.cl", rol: "ESTUDIANTE", activo: true, curso_estudiantes: [] })

            const res = await PATCH(patchRequest({ nombre: "Nuevo" }), { params })
            const body = await res.json()

            expect(body.nombre).toBe("Nuevo")
        })

        it("retorna 500 si falla la consulta final", async () => {
            const { PATCH } = await import("@/app/api/estudiantes/[id]/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom(null)
            mock.queueFrom(null, { message: "select failed" })

            const res = await PATCH(patchRequest({ activo: true }), { params })

            expect(res.status).toBe(500)
        })
    })
})
/* eslint-enable @typescript-eslint/naming-convention */
