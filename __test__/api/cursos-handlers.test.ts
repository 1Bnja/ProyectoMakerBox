import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockSupabaseClient } from "../helpers/supabaseMock"

/* eslint-disable @typescript-eslint/naming-convention */
const mock = createMockSupabaseClient()

vi.mock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(() => Promise.resolve(mock.client)),
}))

describe("CUR-01 - Handlers reales de /api/cursos", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("GET", () => {
        it("retorna 401 si no hay usuario autenticado", async () => {
            const { GET } = await import("@/app/api/cursos/route")
            mock.setUser(null)

            const res = await GET()

            expect(res.status).toBe(401)
        })

        it("retorna 500 si supabase falla", async () => {
            const { GET } = await import("@/app/api/cursos/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom(null, { message: "db error" })

            const res = await GET()

            expect(res.status).toBe(500)
        })

        it("retorna la lista de cursos aplanando el conteo de estudiantes", async () => {
            const { GET } = await import("@/app/api/cursos/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom([
                {
                    id: "c1",
                    nombre: "Curso 1",
                    sigla: "ING-101",
                    semestre_id: null,
                    activo: true,
                    ayudante_id: "a1",
                    ayudante: { nombre: "Ana", apellido: "Soto" },
                    profesor_id: null,
                    profesor: null,
                    estudiantes: [{ count: 5 }],
                },
            ])

            const res = await GET()
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body[0].estudiantes).toBe(5)
            expect(body[0].nombre).toBe("Curso 1")
        })

        it("filtra por profesor_id cuando el usuario es PROFESOR", async () => {
            const { GET } = await import("@/app/api/cursos/route")
            mock.setUser({ id: "p1" })
            mock.queueFrom({ rol: "PROFESOR" })
            mock.queueFrom([
                {
                    id: "c1",
                    nombre: "Curso 1",
                    sigla: "ING-101",
                    semestre_id: null,
                    activo: true,
                    ayudante_id: null,
                    ayudante: null,
                    profesor_id: "p1",
                    profesor: { nombre: "Rodrigo", apellido: "Pavez" },
                    estudiantes: [{ count: 3 }],
                },
            ])

            const res = await GET()
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body[0].profesor_id).toBe("p1")
        })
    })

    describe("POST", () => {
        it("retorna 401 si no hay usuario autenticado", async () => {
            const { POST } = await import("@/app/api/cursos/route")
            mock.setUser(null)

            const res = await POST(new Request("http://localhost/api/cursos", { method: "POST", body: "{}" }))

            expect(res.status).toBe(401)
        })

        it("retorna 403 si el usuario no es AYUDANTE", async () => {
            const { POST } = await import("@/app/api/cursos/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "PROFESOR" })

            const res = await POST(new Request("http://localhost/api/cursos", { method: "POST", body: "{}" }))

            expect(res.status).toBe(403)
        })

        it("retorna 400 si falta el nombre", async () => {
            const { POST } = await import("@/app/api/cursos/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })

            const res = await POST(
                new Request("http://localhost/api/cursos", { method: "POST", body: JSON.stringify({}) })
            )

            expect(res.status).toBe(400)
        })

        it("retorna 400 si el ayudante_id no corresponde a un AYUDANTE", async () => {
            const { POST } = await import("@/app/api/cursos/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom({ rol: "ESTUDIANTE" })

            const res = await POST(
                new Request("http://localhost/api/cursos", {
                    method: "POST",
                    body: JSON.stringify({ nombre: "Curso X", ayudante_id: "a1" }),
                })
            )

            expect(res.status).toBe(400)
        })

        it("retorna 400 si el profesor_id no corresponde a un PROFESOR", async () => {
            const { POST } = await import("@/app/api/cursos/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom({ rol: "ESTUDIANTE" })

            const res = await POST(
                new Request("http://localhost/api/cursos", {
                    method: "POST",
                    body: JSON.stringify({ nombre: "Curso X", profesor_id: "p1" }),
                })
            )

            expect(res.status).toBe(400)
        })

        it("crea el curso correctamente con ayudante y profesor válidos", async () => {
            const { POST } = await import("@/app/api/cursos/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom({ rol: "PROFESOR" })
            mock.queueFrom({ id: "c1", nombre: "Curso X", ayudante_id: "a1", profesor_id: "p1" })

            const res = await POST(
                new Request("http://localhost/api/cursos", {
                    method: "POST",
                    body: JSON.stringify({ nombre: "Curso X", ayudante_id: "a1", profesor_id: "p1" }),
                })
            )
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body.id).toBe("c1")
        })

        it("retorna 500 si falla el insert", async () => {
            const { POST } = await import("@/app/api/cursos/route")
            mock.setUser({ id: "u1" })
            mock.queueFrom({ rol: "AYUDANTE" })
            mock.queueFrom(null, { message: "insert failed" })

            const res = await POST(
                new Request("http://localhost/api/cursos", {
                    method: "POST",
                    body: JSON.stringify({ nombre: "Curso X" }),
                })
            )

            expect(res.status).toBe(500)
        })
    })
})
/* eslint-enable @typescript-eslint/naming-convention */
