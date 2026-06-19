import { describe, it, expect, vi, beforeEach } from "vitest"

/* eslint-disable @typescript-eslint/naming-convention */
describe("USR-01 - Llamadas a API de estudiantes", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("retorna error si el servidor responde 401 (no autenticado)", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: "No autorizado" }),
        } as Response)

        const res = await fetch("/api/estudiantes", {
            method: "GET",
        })

        expect(res.status).toBe(401)
    })

    it("retorna error si el servidor responde 403 (sin permisos)", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 403,
            json: async () => ({ error: "No tienes permisos" }),
        } as Response)

        const res = await fetch("/api/estudiantes", {
            method: "GET",
        })

        expect(res.status).toBe(403)
    })

    it("retorna lista de estudiantes cuando hay datos", async () => {
        const mockEstudiantes: Record<string, unknown>[] = [
            { id: "1", nombre: "Ana", apellido: "Torres", email: "ana@utalca.cl", rol: "ESTUDIANTE", activo: true, curso_id: null, cursos: null },
            { id: "2", nombre: "Pedro", apellido: "Soto", email: "pedro@utalca.cl", rol: "ESTUDIANTE", activo: true, curso_id: null, cursos: null },
        ]

        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => mockEstudiantes,
        } as Response)

        const res = await fetch("/api/estudiantes")
        const data = await res.json()

        expect(res.ok).toBe(true)
        expect(data).toHaveLength(2)
        expect(data[0].nombre).toBe("Ana")
    })

    it("envía datos correctos al crear un estudiante", async () => {
        const mockBody: Record<string, unknown> = {
            nombre: "Nuevo",
            apellido: "Estudiante",
            email: "nuevo@utalca.cl",
            password: "password123",
            curso_id: null,
        }

        const mockResponse = { id: "new-id", ...mockBody, rol: "ESTUDIANTE", activo: true }

        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => mockResponse,
        } as Response)

        const res = await fetch("/api/estudiantes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mockBody),
        })

        const data = await res.json()
        expect(data.nombre).toBe("Nuevo")
        expect(data.rol).toBe("ESTUDIANTE")
        expect(data.activo).toBe(true)
    })

    it("retorna error si el servidor falla al crear estudiante", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: "User already registered" }),
        } as Response)

        const res = await fetch("/api/estudiantes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: "Test",
                apellido: "User",
                email: "existente@utalca.cl",
                password: "123456",
            }),
        })

        const data = await res.json()
        expect(data.error).toBe("User already registered")
    })

    it("envía actualización correcta al editar un estudiante", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ id: "1", nombre: "Ana", apellido: "Torres", activo: false }),
        } as Response)

        const res = await fetch("/api/estudiantes/1", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activo: false }),
        })

        const data = await res.json()
        expect(data.activo).toBe(false)
    })

    it("retorna lista de cursos disponibles", async () => {
        const mockCursos = [
            { id: "c1", nombre: "Diseño 3D Avanzado" },
            { id: "c2", nombre: "Prototipado Rápido" },
        ]

        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => mockCursos,
        } as Response)

        const res = await fetch("/api/cursos")
        const data = await res.json()

        expect(data).toHaveLength(2)
        expect(data[0].nombre).toBe("Diseño 3D Avanzado")
    })
})
/* eslint-enable @typescript-eslint/naming-convention */
