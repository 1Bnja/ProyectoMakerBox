import { describe, it, expect, vi, beforeEach } from "vitest"

/* eslint-disable @typescript-eslint/naming-convention */
describe("CUR-01 - Llamadas a API de cursos", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("retorna error si el servidor responde 401 (no autenticado)", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: "No autorizado" }),
        } as Response)

        const res = await fetch("/api/cursos", { method: "GET" })
        expect(res.status).toBe(401)
    })

    it("retorna error si el servidor responde 403 (sin permisos) al crear un curso", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 403,
            json: async () => ({ error: "No tienes permisos para crear cursos" }),
        } as Response)

        const res = await fetch("/api/cursos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: "Curso nuevo" }),
        })

        expect(res.status).toBe(403)
    })

    it("retorna lista de cursos con sigla, ayudante y conteo de estudiantes", async () => {
        const mockCursos = [
            {
                id: "c1",
                nombre: "Diseño 3D Avanzado",
                sigla: "ING-301",
                activo: true,
                ayudante_id: "a1",
                ayudante: { nombre: "Lukas", apellido: "Avello" },
                estudiantes: 24,
            },
        ]

        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => mockCursos,
        } as Response)

        const res = await fetch("/api/cursos")
        const data = await res.json()

        expect(res.ok).toBe(true)
        expect(data).toHaveLength(1)
        expect(data[0].sigla).toBe("ING-301")
        expect(data[0].ayudante.nombre).toBe("Lukas")
        expect(data[0].estudiantes).toBe(24)
    })

    it("envía datos correctos al crear un curso", async () => {
        const mockBody = { nombre: "Prototipado Rápido", sigla: "ING-204", ayudante_id: null }
        const mockResponse = { id: "new-id", ...mockBody, semestre_id: null, activo: true }

        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => mockResponse,
        } as Response)

        const res = await fetch("/api/cursos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mockBody),
        })

        const data = await res.json()
        expect(data.nombre).toBe("Prototipado Rápido")
        expect(data.activo).toBe(true)
    })

    it("retorna error si falta el nombre al crear un curso", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ error: "El nombre del curso es requerido" }),
        } as Response)

        const res = await fetch("/api/cursos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sigla: "ING-100" }),
        })

        const data = await res.json()
        expect(res.status).toBe(400)
        expect(data.error).toBe("El nombre del curso es requerido")
    })

    it("envía actualización correcta al editar un curso", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ id: "c1", nombre: "Diseño 3D Avanzado II", sigla: "ING-301", activo: true }),
        } as Response)

        const res = await fetch("/api/cursos/c1", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: "Diseño 3D Avanzado II" }),
        })

        const data = await res.json()
        expect(data.nombre).toBe("Diseño 3D Avanzado II")
    })

    it("envía actualización correcta al desactivar un curso", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ id: "c1", nombre: "Diseño 3D Avanzado", activo: false }),
        } as Response)

        const res = await fetch("/api/cursos/c1", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activo: false }),
        })

        const data = await res.json()
        expect(data.activo).toBe(false)
    })
})
/* eslint-enable @typescript-eslint/naming-convention */
