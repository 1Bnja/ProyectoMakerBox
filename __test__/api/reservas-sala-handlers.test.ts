import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockSupabaseClient } from "../helpers/supabaseMock"

/* eslint-disable @typescript-eslint/naming-convention */
const mock = createMockSupabaseClient()

vi.mock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(() => Promise.resolve(mock.client)),
}))

describe("RES-02 - Handlers reales de GET /api/reservas-sala", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("retorna 401 si no hay usuario autenticado", async () => {
        const { GET } = await import("@/app/api/reservas-sala/route")
        mock.setUser(null)

        const res = await GET()

        expect(res.status).toBe(401)
    })

    it("retorna 403 si el usuario no es AYUDANTE", async () => {
        const { GET } = await import("@/app/api/reservas-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "SOLICITANTE" })

        const res = await GET()

        expect(res.status).toBe(403)
    })

    it("retorna 500 si supabase falla", async () => {
        const { GET } = await import("@/app/api/reservas-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom(null, { message: "db error" })

        const res = await GET()

        expect(res.status).toBe(500)
    })

    it("retorna la lista de reservas con bloque y solicitante embebidos", async () => {
        const { GET } = await import("@/app/api/reservas-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom([
            {
                id: "r1",
                fecha: "2026-06-22",
                actividad: "Ayudantía Diseño 3D",
                created_at: "2026-06-14T00:00:00Z",
                bloque: { dia: "LUNES", hora_inicio: "09:00", hora_fin: "10:00" },
                solicitante: { nombre: "Ana", apellido: "Soto" },
            },
        ])

        const res = await GET()
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body[0].solicitante.nombre).toBe("Ana")
    })
})

function postRequest(body: unknown) {
    return new Request("http://localhost/api/reservas-sala", { method: "POST", body: JSON.stringify(body) })
}

describe("RES-01 - Handlers reales de POST /api/reservas-sala", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("retorna 401 si no hay usuario autenticado", async () => {
        const { POST } = await import("@/app/api/reservas-sala/route")
        mock.setUser(null)

        const res = await POST(postRequest({ bloque_id: "b1", fecha: "2026-06-22" }))

        expect(res.status).toBe(401)
    })

    it("retorna 403 si el usuario no es SOLICITANTE", async () => {
        const { POST } = await import("@/app/api/reservas-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "ESTUDIANTE" })

        const res = await POST(postRequest({ bloque_id: "b1", fecha: "2026-06-22" }))

        expect(res.status).toBe(403)
    })

    it("retorna 400 si faltan bloque_id o fecha", async () => {
        const { POST } = await import("@/app/api/reservas-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "SOLICITANTE" })

        const res = await POST(postRequest({ bloque_id: "b1" }))

        expect(res.status).toBe(400)
    })

    it("retorna 400 si la fecha es inválida", async () => {
        const { POST } = await import("@/app/api/reservas-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "SOLICITANTE" })

        const res = await POST(postRequest({ bloque_id: "b1", fecha: "no-es-fecha" }))

        expect(res.status).toBe(400)
    })

    it("retorna 404 si el bloque no existe", async () => {
        const { POST } = await import("@/app/api/reservas-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "SOLICITANTE" })
        mock.queueFrom(null, { message: "not found" })

        const res = await POST(postRequest({ bloque_id: "b1", fecha: "2026-06-22" }))

        expect(res.status).toBe(404)
    })

    it("retorna 409 si el bloque no está disponible", async () => {
        const { POST } = await import("@/app/api/reservas-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "SOLICITANTE" })
        mock.queueFrom({ id: "b1", dia: "LUNES", disponible: false })

        const res = await POST(postRequest({ bloque_id: "b1", fecha: "2026-06-22" }))

        expect(res.status).toBe(409)
    })

    it("retorna 400 si el bloque no corresponde al día de la fecha", async () => {
        const { POST } = await import("@/app/api/reservas-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "SOLICITANTE" })
        mock.queueFrom({ id: "b1", dia: "MARTES", disponible: true })

        // 2026-06-22 es lunes
        const res = await POST(postRequest({ bloque_id: "b1", fecha: "2026-06-22" }))

        expect(res.status).toBe(400)
    })

    it("retorna 409 si el bloque ya está reservado para esa fecha", async () => {
        const { POST } = await import("@/app/api/reservas-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "SOLICITANTE" })
        mock.queueFrom({ id: "b1", dia: "LUNES", disponible: true })
        mock.queueFrom({ id: "r-existente" })

        const res = await POST(postRequest({ bloque_id: "b1", fecha: "2026-06-22" }))

        expect(res.status).toBe(409)
    })

    it("crea la reserva correctamente", async () => {
        const { POST } = await import("@/app/api/reservas-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "SOLICITANTE" })
        mock.queueFrom({ id: "b1", dia: "LUNES", disponible: true })
        mock.queueFrom(null)
        mock.queueFrom({ id: "r1", fecha: "2026-06-22", actividad: "Reunión de grupo", created_at: "2026-06-14T00:00:00Z" })

        const res = await POST(postRequest({ bloque_id: "b1", fecha: "2026-06-22", actividad: "Reunión de grupo" }))
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.id).toBe("r1")
    })

    it("retorna 500 si falla el insert", async () => {
        const { POST } = await import("@/app/api/reservas-sala/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "SOLICITANTE" })
        mock.queueFrom({ id: "b1", dia: "LUNES", disponible: true })
        mock.queueFrom(null)
        mock.queueFrom(null, { message: "insert failed" })

        const res = await POST(postRequest({ bloque_id: "b1", fecha: "2026-06-22" }))

        expect(res.status).toBe(500)
    })
})
/* eslint-enable @typescript-eslint/naming-convention */
