/* eslint-disable @typescript-eslint/naming-convention */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockSupabaseClient } from "../helpers/supabaseMock"

const mock = createMockSupabaseClient()

vi.mock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(() => Promise.resolve(mock.client)),
}))

describe("CUR-02 - Handlers reales de /api/ayudantias", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("GET retorna 401 si no hay usuario autenticado", async () => {
        const { GET } = await import("@/app/api/ayudantias/route")
        mock.setUser(null)

        const res = await GET()

        expect(res.status).toBe(401)
    })

    it("GET retorna 500 si supabase falla", async () => {
        const { GET } = await import("@/app/api/ayudantias/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom(null, { message: "db error" })

        const res = await GET()

        expect(res.status).toBe(500)
    })

    it("GET retorna las ayudantías con inscritos e inscrito calculados", async () => {
        const { GET } = await import("@/app/api/ayudantias/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom([
            {
                id: "a1",
                dia: "LUNES",
                hora_inicio: "14:30:00",
                hora_fin: "16:00:00",
                cupos: 5,
                activo: true,
                curso: { nombre: "Diseño 3D" },
                ayudante: { nombre: "Lukas", apellido: "Avello" },
                ayudantia_estudiantes: [
                    { estudiante_id: "u1", estudiante: { nombre: "Pedro", apellido: "Pérez" } },
                    { estudiante_id: "u2", estudiante: { nombre: "Ana", apellido: "Torres" } },
                ],
            },
        ])

        const res = await GET()
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body[0].inscritos).toBe(2)
        expect(body[0].inscrito).toBe(true)
        expect(body[0].estudiantes).toEqual([
            { nombre: "Pedro", apellido: "Pérez" },
            { nombre: "Ana", apellido: "Torres" },
        ])
    })

    function postRequest(body: Record<string, unknown>) {
        return new Request("http://localhost/api/ayudantias", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
    }

    it("POST retorna 401 si no hay usuario autenticado", async () => {
        const { POST } = await import("@/app/api/ayudantias/route")
        mock.setUser(null)

        const res = await POST(postRequest({ curso_id: "c1", dia: "LUNES", hora_inicio: "14:00", hora_fin: "15:00", cupos: 5 }))

        expect(res.status).toBe(401)
    })

    it("POST retorna 403 si el rol no es AYUDANTE", async () => {
        const { POST } = await import("@/app/api/ayudantias/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "ESTUDIANTE" })

        const res = await POST(postRequest({ curso_id: "c1", dia: "LUNES", hora_inicio: "14:00", hora_fin: "15:00", cupos: 5 }))

        expect(res.status).toBe(403)
    })

    it("POST retorna 400 si faltan campos requeridos", async () => {
        const { POST } = await import("@/app/api/ayudantias/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })

        const res = await POST(postRequest({ curso_id: "c1" }))

        expect(res.status).toBe(400)
    })

    it("POST retorna 400 si cupos no es un entero positivo", async () => {
        const { POST } = await import("@/app/api/ayudantias/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })

        const res = await POST(postRequest({ curso_id: "c1", dia: "LUNES", hora_inicio: "14:00", hora_fin: "15:00", cupos: 0 }))

        expect(res.status).toBe(400)
    })

    it("POST retorna 404 si el curso no existe", async () => {
        const { POST } = await import("@/app/api/ayudantias/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom(null, { message: "no encontrado" })

        const res = await POST(postRequest({ curso_id: "c1", dia: "LUNES", hora_inicio: "14:00", hora_fin: "15:00", cupos: 5 }))

        expect(res.status).toBe(404)
    })

    it("POST crea la ayudantía correctamente", async () => {
        const { POST } = await import("@/app/api/ayudantias/route")
        mock.setUser({ id: "u1" })
        mock.queueFrom({ rol: "AYUDANTE" })
        mock.queueFrom({ id: "c1" })
        mock.queueFrom({ id: "a1", dia: "LUNES", hora_inicio: "14:00:00", hora_fin: "15:00:00", cupos: 5, activo: true })

        const res = await POST(postRequest({ curso_id: "c1", dia: "LUNES", hora_inicio: "14:00", hora_fin: "15:00", cupos: 5 }))
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.id).toBe("a1")
    })
})
