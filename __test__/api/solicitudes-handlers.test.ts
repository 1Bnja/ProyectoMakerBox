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

    it("retorna 403 si no se encuentra el perfil del usuario", async () => {
        const { GET } = await import("@/app/api/solicitudes/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom(null)

        const res = await GET(getRequest())

        expect(res.status).toBe(403)
    })

    it("un ESTUDIANTE solo ve sus propias solicitudes (filtra por user_id)", async () => {
        const { GET } = await import("@/app/api/solicitudes/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "ESTUDIANTE" })
        mock.queueFrom([
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { id: "s1", tipo: "ACADEMICA", estado: "PENDIENTE", user_id: "u1", solicitante: null },
        ])

        const res = await GET(getRequest())
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toHaveLength(1)
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

    it("un PROFESOR ve las solicitudes de los estudiantes de sus cursos", async () => {
        const { GET } = await import("@/app/api/solicitudes/route")
        mock.setUser({ id: "p1" })
        mock.queueFrom({ rol: "PROFESOR" })
        mock.queueFrom([{ id: "c1" }])
        // eslint-disable-next-line @typescript-eslint/naming-convention
        mock.queueFrom([{ estudiante_id: "e1" }, { estudiante_id: "e2" }])
        mock.queueFrom([
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { id: "s1", tipo: "ACADEMICA", estado: "PENDIENTE", user_id: "e1", solicitante: { nombre: "Ana", apellido: "Soto" } },
        ])

        const res = await GET(getRequest())
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toHaveLength(1)
        expect(body[0].user_id).toBe("e1")
    })

    it("un PROFESOR sin cursos asignados recibe una lista vacía", async () => {
        const { GET } = await import("@/app/api/solicitudes/route")
        mock.setUser({ id: "p1" })
        mock.queueFrom({ rol: "PROFESOR" })
        mock.queueFrom([])

        const res = await GET(getRequest())
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toEqual([])
    })

    it("un PROFESOR con cursos pero sin estudiantes inscritos recibe una lista vacía", async () => {
        const { GET } = await import("@/app/api/solicitudes/route")
        mock.setUser({ id: "p1" })
        mock.queueFrom({ rol: "PROFESOR" })
        mock.queueFrom([{ id: "c1" }])
        mock.queueFrom([])

        const res = await GET(getRequest())
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toEqual([])
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

function getDetalleRequest() {
    return new Request("http://localhost/api/solicitudes/s1")
}

/* eslint-disable @typescript-eslint/naming-convention */
describe("IMP-05 - Handlers reales de GET /api/solicitudes/[id] (detalle)", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("retorna 401 si no hay usuario autenticado", async () => {
        const { GET } = await import("@/app/api/solicitudes/[id]/route")
        mock.setUser(null)

        const res = await GET(getDetalleRequest(), { params })

        expect(res.status).toBe(401)
    })

    it("retorna 403 si el usuario no es AYUDANTE", async () => {
        const { GET } = await import("@/app/api/solicitudes/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "ESTUDIANTE" })

        const res = await GET(getDetalleRequest(), { params })

        expect(res.status).toBe(403)
    })

    it("retorna 404 si la solicitud no existe", async () => {
        const { GET } = await import("@/app/api/solicitudes/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom(null, { message: "not found" })

        const res = await GET(getDetalleRequest(), { params })

        expect(res.status).toBe(404)
    })

    it("retorna el detalle con archivo_url cuando stl_path existe", async () => {
        const { GET } = await import("@/app/api/solicitudes/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({
            id: "s1",
            tipo: "PERSONAL",
            estado: "PENDIENTE",
            comentario: "Pieza de prueba",
            motivo_rechazo: null,
            created_at: "2026-06-14T00:00:00Z",
            stl_path: "modelos/a.stl",
            diseno_path: null,
            diseno_url: null,
            colores: null,
            tiempo_estimado: null,
            observacion_ayudante: null,
            ayudante_id: null,
            solicitante: { nombre: "Benjamín", apellido: "Silva" },
        })
        mock.mockCreateSignedUrl.mockResolvedValue({
            data: { signedUrl: "https://example.com/signed/a.stl" },
            error: null,
        })

        const res = await GET(getDetalleRequest(), { params })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.archivo_url).toBe("https://example.com/signed/a.stl")
        expect(body.comentario).toBe("Pieza de prueba")
        expect(body.solicitante.nombre).toBe("Benjamín")
    })

    it("retorna archivo_url null cuando stl_path es null, sin llamar a createSignedUrl", async () => {
        const { GET } = await import("@/app/api/solicitudes/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({
            id: "s1",
            tipo: "PERSONAL",
            estado: "PENDIENTE",
            comentario: null,
            motivo_rechazo: null,
            created_at: "2026-06-14T00:00:00Z",
            stl_path: null,
            diseno_path: null,
            diseno_url: null,
            colores: null,
            tiempo_estimado: null,
            observacion_ayudante: null,
            ayudante_id: null,
            solicitante: null,
        })

        const res = await GET(getDetalleRequest(), { params })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.archivo_url).toBeNull()
        expect(mock.mockCreateSignedUrl).not.toHaveBeenCalled()
    })

    it("retorna archivo_url null (sin romper la respuesta) si createSignedUrl falla", async () => {
        const { GET } = await import("@/app/api/solicitudes/[id]/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({
            id: "s1",
            tipo: "PERSONAL",
            estado: "PENDIENTE",
            comentario: null,
            motivo_rechazo: null,
            created_at: "2026-06-14T00:00:00Z",
            stl_path: "modelos/borrado.stl",
            diseno_path: null,
            diseno_url: null,
            colores: null,
            tiempo_estimado: null,
            observacion_ayudante: null,
            ayudante_id: null,
            solicitante: null,
        })
        mock.mockCreateSignedUrl.mockResolvedValue({ data: null, error: { message: "not found" } })

        const res = await GET(getDetalleRequest(), { params })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.archivo_url).toBeNull()
    })
})
/* eslint-enable @typescript-eslint/naming-convention */
