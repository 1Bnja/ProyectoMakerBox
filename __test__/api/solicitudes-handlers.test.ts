import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockSupabaseClient } from "../helpers/supabaseMock"

const mock = createMockSupabaseClient()

vi.mock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(() => Promise.resolve(mock.client)),
}))

function postRequest(body: unknown) {
    return new Request("http://localhost/api/solicitudes", { method: "POST", body: JSON.stringify(body) })
}

describe("IMP-01 - Handlers reales de /api/solicitudes", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("retorna 401 si no hay usuario autenticado", async () => {
        const { POST } = await import("@/app/api/solicitudes/route")
        mock.setUser(null)

        const res = await POST(postRequest({}))

        expect(res.status).toBe(401)
    })

    it("retorna 401 si auth.getUser devuelve error", async () => {
        const { POST } = await import("@/app/api/solicitudes/route")
        mock.mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "expired" } })

        const res = await POST(postRequest({}))

        expect(res.status).toBe(401)
    })

    it("retorna 500 si falla el insert", async () => {
        const { POST } = await import("@/app/api/solicitudes/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom(null, { message: "insert failed" })

        // eslint-disable-next-line @typescript-eslint/naming-convention
        const res = await POST(postRequest({ stl_path: "a.stl", comentario: "hola" }))

        expect(res.status).toBe(500)
    })

    it("crea la solicitud correctamente", async () => {
        const { POST } = await import("@/app/api/solicitudes/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom(null)

        // eslint-disable-next-line @typescript-eslint/naming-convention
        const res = await POST(postRequest({ stl_path: "a.stl", comentario: "hola" }))
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.success).toBe(true)
    })
})

function getRequest(query = "") {
    return new Request(`http://localhost/api/solicitudes${query}`)
}

describe("IMP-03 - Handlers reales de GET /api/solicitudes", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("retorna 401 si no hay usuario autenticado", async () => {
        const { GET } = await import("@/app/api/solicitudes/route")
        mock.setUser(null)

        const res = await GET(getRequest())

        expect(res.status).toBe(401)
    })

    it("retorna 403 si el usuario no es AYUDANTE", async () => {
        const { GET } = await import("@/app/api/solicitudes/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "ESTUDIANTE" })

        const res = await GET(getRequest())

        expect(res.status).toBe(403)
    })

    it("retorna 500 si supabase falla", async () => {
        const { GET } = await import("@/app/api/solicitudes/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom(null, { message: "db error" })

        const res = await GET(getRequest())

        expect(res.status).toBe(500)
    })

    it("retorna la lista de solicitudes con el solicitante embebido", async () => {
        const { GET } = await import("@/app/api/solicitudes/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom([
            { id: "s1", tipo: "PERSONAL", estado: "PENDIENTE", solicitante: { nombre: "Ana", apellido: "Soto" } },
        ])

        const res = await GET(getRequest())
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body[0].solicitante.nombre).toBe("Ana")
    })

    it("filtra por estado cuando se pasa como query param", async () => {
        const { GET } = await import("@/app/api/solicitudes/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom([])

        const res = await GET(getRequest("?estado=APROBADA"))

        expect(res.status).toBe(200)
    })
})

function patchRequest(body: unknown) {
    return new Request("http://localhost/api/solicitudes/s1", { method: "PATCH", body: JSON.stringify(body) })
}

const params = Promise.resolve({ id: "s1" })

/* eslint-disable @typescript-eslint/naming-convention */
describe("IMP-04 - Handlers reales de PATCH /api/solicitudes/[id]", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("retorna 401 si no hay usuario autenticado", async () => {
        const { PATCH } = await import("@/app/api/solicitudes/[id]/route")
        mock.setUser(null)

        const res = await PATCH(patchRequest({ estado: "APROBADA" }), { params })

        expect(res.status).toBe(401)
    })

    it("retorna 403 si el usuario no es AYUDANTE", async () => {
        const { PATCH } = await import("@/app/api/solicitudes/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "ESTUDIANTE" })

        const res = await PATCH(patchRequest({ estado: "APROBADA" }), { params })

        expect(res.status).toBe(403)
    })

    it("retorna 400 si el estado no es APROBADA ni RECHAZADA", async () => {
        const { PATCH } = await import("@/app/api/solicitudes/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })

        const res = await PATCH(patchRequest({ estado: "FINALIZADA" }), { params })

        expect(res.status).toBe(400)
    })

    it("retorna 400 si rechaza sin motivo", async () => {
        const { PATCH } = await import("@/app/api/solicitudes/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })

        const res = await PATCH(patchRequest({ estado: "RECHAZADA" }), { params })

        expect(res.status).toBe(400)
    })

    it("retorna 404 si la solicitud no existe", async () => {
        const { PATCH } = await import("@/app/api/solicitudes/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom(null, { message: "not found" })

        const res = await PATCH(patchRequest({ estado: "APROBADA" }), { params })

        expect(res.status).toBe(404)
    })

    it("retorna 400 si la solicitud no está PENDIENTE", async () => {
        const { PATCH } = await import("@/app/api/solicitudes/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({ estado: "APROBADA" })

        const res = await PATCH(patchRequest({ estado: "RECHAZADA", motivo_rechazo: "x" }), { params })

        expect(res.status).toBe(400)
    })

    it("aprueba una solicitud pendiente correctamente", async () => {
        const { PATCH } = await import("@/app/api/solicitudes/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({ estado: "PENDIENTE" })
        mock.queueFrom({ id: "s1", estado: "APROBADA", motivo_rechazo: null, ayudante_id: "u1" })

        const res = await PATCH(patchRequest({ estado: "APROBADA" }), { params })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.estado).toBe("APROBADA")
    })

    it("rechaza una solicitud pendiente con motivo", async () => {
        const { PATCH } = await import("@/app/api/solicitudes/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({ estado: "PENDIENTE" })
        mock.queueFrom({ id: "s1", estado: "RECHAZADA", motivo_rechazo: "No cumple normas", ayudante_id: "u1" })

        const res = await PATCH(patchRequest({ estado: "RECHAZADA", motivo_rechazo: "No cumple normas" }), { params })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.motivo_rechazo).toBe("No cumple normas")
    })

    it("retorna 500 si falla el update", async () => {
        const { PATCH } = await import("@/app/api/solicitudes/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({ estado: "PENDIENTE" })
        mock.queueFrom(null, { message: "update failed" })

        const res = await PATCH(patchRequest({ estado: "APROBADA" }), { params })

        expect(res.status).toBe(500)
    })
})
/* eslint-enable @typescript-eslint/naming-convention */
