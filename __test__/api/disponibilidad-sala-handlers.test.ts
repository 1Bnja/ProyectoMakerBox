import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockSupabaseClient } from "../helpers/supabaseMock"

/* eslint-disable @typescript-eslint/naming-convention */
const mock = createMockSupabaseClient()

vi.mock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(() => Promise.resolve(mock.client)),
}))

function getRequest(query = "") {
    return new Request(`http://localhost/api/disponibilidad-sala${query}`)
}

describe("RES-02 - Handlers reales de GET /api/disponibilidad-sala", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("retorna 401 si no hay usuario autenticado", async () => {
        const { GET } = await import("@/app/api/disponibilidad-sala/route")
        mock.setUser(null)

        const res = await GET(getRequest())

        expect(res.status).toBe(401)
    })

    it("sin fecha, retorna todos los bloques (vista de gestión del ayudante)", async () => {
        const { GET } = await import("@/app/api/disponibilidad-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom([
            { id: "b1", dia: "LUNES", hora_inicio: "09:00", hora_fin: "10:00", disponible: true },
            { id: "b2", dia: "LUNES", hora_inicio: "10:00", hora_fin: "11:00", disponible: false },
        ])

        const res = await GET(getRequest())
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toHaveLength(2)
    })

    it("sin fecha, retorna 500 si supabase falla", async () => {
        const { GET } = await import("@/app/api/disponibilidad-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom(null, { message: "db error" })

        const res = await GET(getRequest())

        expect(res.status).toBe(500)
    })

    it("retorna 400 si la fecha es inválida", async () => {
        const { GET } = await import("@/app/api/disponibilidad-sala/route")
        mock.setUser({ id: "u1" })

        const res = await GET(getRequest("?fecha=no-es-una-fecha"))

        expect(res.status).toBe(400)
    })

    it("con fecha, retorna 500 si falla la consulta de bloques", async () => {
        const { GET } = await import("@/app/api/disponibilidad-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom(null, { message: "db error" })

        const res = await GET(getRequest("?fecha=2026-06-22"))

        expect(res.status).toBe(500)
    })

    it("con fecha (lunes), filtra por día y excluye los bloques ya reservados", async () => {
        const { GET } = await import("@/app/api/disponibilidad-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom([
            { id: "b1", dia: "LUNES", hora_inicio: "09:00", hora_fin: "10:00", disponible: true },
            { id: "b2", dia: "LUNES", hora_inicio: "10:00", hora_fin: "11:00", disponible: true },
        ])
        mock.queueFrom([{ bloque_id: "b2" }])

        // 2026-06-22 es lunes
        const res = await GET(getRequest("?fecha=2026-06-22"))
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toEqual([
            { id: "b1", dia: "LUNES", hora_inicio: "09:00", hora_fin: "10:00", disponible: true },
        ])
    })

    it("con fecha, retorna 500 si falla la consulta de reservas", async () => {
        const { GET } = await import("@/app/api/disponibilidad-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom([{ id: "b1", dia: "LUNES", hora_inicio: "09:00", hora_fin: "10:00", disponible: true }])
        mock.queueFrom(null, { message: "db error" })

        const res = await GET(getRequest("?fecha=2026-06-22"))

        expect(res.status).toBe(500)
    })

    it("con fecha pero sin bloques de ese día, retorna lista vacía sin consultar reservas", async () => {
        const { GET } = await import("@/app/api/disponibilidad-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom([])

        const res = await GET(getRequest("?fecha=2026-06-21"))
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toEqual([])
    })

    it("vista=gestion retorna 403 si el usuario no es AYUDANTE", async () => {
        const { GET } = await import("@/app/api/disponibilidad-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "SOLICITANTE" })

        const res = await GET(getRequest("?fecha=2026-06-22&vista=gestion"))

        expect(res.status).toBe(403)
    })

    it("vista=gestion retorna todos los bloques del día con su reservaId (ocupados y libres)", async () => {
        const { GET } = await import("@/app/api/disponibilidad-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom([
            { id: "b1", dia: "LUNES", hora_inicio: "09:00", hora_fin: "10:00", disponible: true },
            { id: "b2", dia: "LUNES", hora_inicio: "10:00", hora_fin: "11:00", disponible: true },
        ])
        mock.queueFrom([{ id: "r1", bloque_id: "b2" }])

        // 2026-06-22 es lunes
        const res = await GET(getRequest("?fecha=2026-06-22&vista=gestion"))
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toEqual([
            { id: "b1", dia: "LUNES", hora_inicio: "09:00", hora_fin: "10:00", disponible: true, reservaId: null },
            { id: "b2", dia: "LUNES", hora_inicio: "10:00", hora_fin: "11:00", disponible: true, reservaId: "r1" },
        ])
    })
})

const paramsId = Promise.resolve({ id: "b1" })

function patchRequest(body: unknown) {
    return new Request("http://localhost/api/disponibilidad-sala/b1", { method: "PATCH", body: JSON.stringify(body) })
}

describe("RES-02 - Handlers reales de PATCH /api/disponibilidad-sala/[id]", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("retorna 401 si no hay usuario autenticado", async () => {
        const { PATCH } = await import("@/app/api/disponibilidad-sala/[id]/route")
        mock.setUser(null)

        const res = await PATCH(patchRequest({ disponible: false }), { params: paramsId })

        expect(res.status).toBe(401)
    })

    it("retorna 403 si el usuario no es AYUDANTE", async () => {
        const { PATCH } = await import("@/app/api/disponibilidad-sala/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "SOLICITANTE" })

        const res = await PATCH(patchRequest({ disponible: false }), { params: paramsId })

        expect(res.status).toBe(403)
    })

    it("retorna 400 si disponible no es booleano", async () => {
        const { PATCH } = await import("@/app/api/disponibilidad-sala/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })

        const res = await PATCH(patchRequest({ disponible: "no" }), { params: paramsId })

        expect(res.status).toBe(400)
    })

    it("actualiza la disponibilidad correctamente", async () => {
        const { PATCH } = await import("@/app/api/disponibilidad-sala/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({ id: "b1", dia: "LUNES", hora_inicio: "09:00", hora_fin: "10:00", disponible: false })

        const res = await PATCH(patchRequest({ disponible: false }), { params: paramsId })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.disponible).toBe(false)
    })

    it("retorna 500 si falla el update", async () => {
        const { PATCH } = await import("@/app/api/disponibilidad-sala/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom(null, { message: "update failed" })

        const res = await PATCH(patchRequest({ disponible: false }), { params: paramsId })

        expect(res.status).toBe(500)
    })
})
/* eslint-enable @typescript-eslint/naming-convention */
