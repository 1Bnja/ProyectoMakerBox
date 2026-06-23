import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockSupabaseClient } from "../helpers/supabaseMock"

/* eslint-disable @typescript-eslint/naming-convention */
const mock = createMockSupabaseClient()

vi.mock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(() => Promise.resolve(mock.client)),
}))

function patchRequest(body: unknown) {
    return new Request("http://localhost/api/estudiantes/e1/grupo", { method: "PATCH", body: JSON.stringify(body) })
}

const params = Promise.resolve({ id: "e1" })

describe("USR-02 - Handlers reales de /api/estudiantes/[id]/grupo", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("retorna 401 si no hay usuario autenticado", async () => {
        const { PATCH } = await import("@/app/api/estudiantes/[id]/grupo/route")
        mock.setUser(null)

        const res = await PATCH(patchRequest({ curso_id: "c1", grupo_id: "g1" }), { params })

        expect(res.status).toBe(401)
    })

    it("retorna 403 si el usuario no es AYUDANTE", async () => {
        const { PATCH } = await import("@/app/api/estudiantes/[id]/grupo/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "PROFESOR" })

        const res = await PATCH(patchRequest({ curso_id: "c1", grupo_id: "g1" }), { params })

        expect(res.status).toBe(403)
    })

    it("retorna 400 si faltan curso_id o grupo_id", async () => {
        const { PATCH } = await import("@/app/api/estudiantes/[id]/grupo/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })

        const res = await PATCH(patchRequest({ curso_id: "c1" }), { params })

        expect(res.status).toBe(400)
    })

    it("asocia correctamente un estudiante a un grupo de su curso", async () => {
        const { PATCH } = await import("@/app/api/estudiantes/[id]/grupo/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({ id: "e1", nombre: "Ana", apellido: "Soto", email: "a@a.cl", rol: "ESTUDIANTE", activo: true })
        mock.queueFrom({ id: "c1", nombre: "Curso 1" })
        mock.queueFrom({ id: "g1", nombre: "Grupo 1", curso_id: "c1" })
        mock.queueFrom({ curso_id: "c1" })
        mock.queueFrom([{ id: "g1" }, { id: "g2" }])
        mock.queueFrom([])
        mock.queueFrom(null)

        const res = await PATCH(patchRequest({ curso_id: "c1", grupo_id: "g1" }), { params })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.grupo.id).toBe("g1")
        expect(body.curso.id).toBe("c1")
    })

    it("rechaza un grupo que pertenece a otro curso", async () => {
        const { PATCH } = await import("@/app/api/estudiantes/[id]/grupo/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({ id: "e1", nombre: "Ana", apellido: "Soto", email: "a@a.cl", rol: "ESTUDIANTE", activo: true })
        mock.queueFrom({ id: "c1", nombre: "Curso 1" })
        mock.queueFrom(null)

        const res = await PATCH(patchRequest({ curso_id: "c1", grupo_id: "g9" }), { params })

        expect(res.status).toBe(404)
    })

    it("rechaza un estudiante que no pertenece al curso", async () => {
        const { PATCH } = await import("@/app/api/estudiantes/[id]/grupo/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({ id: "e1", nombre: "Ana", apellido: "Soto", email: "a@a.cl", rol: "ESTUDIANTE", activo: true })
        mock.queueFrom({ id: "c1", nombre: "Curso 1" })
        mock.queueFrom({ id: "g1", nombre: "Grupo 1", curso_id: "c1" })
        mock.queueFrom(null)

        const res = await PATCH(patchRequest({ curso_id: "c1", grupo_id: "g1" }), { params })

        expect(res.status).toBe(409)
    })

    it("reemplaza el grupo anterior por uno nuevo dentro del mismo curso", async () => {
        const { PATCH } = await import("@/app/api/estudiantes/[id]/grupo/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({ id: "e1", nombre: "Ana", apellido: "Soto", email: "a@a.cl", rol: "ESTUDIANTE", activo: true })
        mock.queueFrom({ id: "c1", nombre: "Curso 1" })
        mock.queueFrom({ id: "g2", nombre: "Grupo 2", curso_id: "c1" })
        mock.queueFrom({ curso_id: "c1" })
        mock.queueFrom([{ id: "g1" }, { id: "g2" }])
        mock.queueFrom([{ grupo_id: "g1", grupos: { id: "g1", nombre: "Grupo 1", curso_id: "c1" } }])
        mock.queueFrom(null)
        mock.queueFrom(null)

        const res = await PATCH(patchRequest({ curso_id: "c1", grupo_id: "g2" }), { params })

        expect(res.status).toBe(200)
    })

    it("no duplica la relación si ya pertenece al mismo grupo", async () => {
        const { PATCH } = await import("@/app/api/estudiantes/[id]/grupo/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({ id: "e1", nombre: "Ana", apellido: "Soto", email: "a@a.cl", rol: "ESTUDIANTE", activo: true })
        mock.queueFrom({ id: "c1", nombre: "Curso 1" })
        mock.queueFrom({ id: "g1", nombre: "Grupo 1", curso_id: "c1" })
        mock.queueFrom({ curso_id: "c1" })
        mock.queueFrom([{ id: "g1" }])
        mock.queueFrom([{ grupo_id: "g1", grupos: { id: "g1", nombre: "Grupo 1", curso_id: "c1" } }])

        const res = await PATCH(patchRequest({ curso_id: "c1", grupo_id: "g1" }), { params })

        expect(res.status).toBe(200)
        expect(mock.mockFrom).toHaveBeenCalledTimes(7)
    })
})
/* eslint-enable @typescript-eslint/naming-convention */