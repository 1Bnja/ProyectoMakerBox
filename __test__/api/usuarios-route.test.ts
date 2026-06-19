import { describe, it, expect, vi, beforeEach } from "vitest"

/* eslint-disable @typescript-eslint/naming-convention */
describe("USR-03 - Llamadas a API de usuarios", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("retorna error si el servidor responde 401 (no autenticado)", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: "No autorizado" }),
        } as Response)

        const res = await fetch("/api/usuarios", { method: "GET" })
        expect(res.status).toBe(401)
    })

    it("retorna error si el servidor responde 403 (sin permisos)", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 403,
            json: async () => ({ error: "No tienes permisos" }),
        } as Response)

        const res = await fetch("/api/usuarios", { method: "GET" })
        expect(res.status).toBe(403)
    })

    it("retorna lista de usuarios cuando hay datos", async () => {
        const mockUsuarios = [
            { id: "1", nombre: "Lukas", apellido: "Avello", email: "lukas@utalca.cl", rol: "AYUDANTE", activo: true },
            { id: "2", nombre: "María", apellido: "García", email: "maria@utalca.cl", rol: "PROFESOR", activo: true },
        ]

        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => mockUsuarios,
        } as Response)

        const res = await fetch("/api/usuarios")
        const data = await res.json()

        expect(res.ok).toBe(true)
        expect(data).toHaveLength(2)
        expect(data[0].rol).toBe("AYUDANTE")
        expect(data[1].rol).toBe("PROFESOR")
    })

    it("envía datos correctos al crear un usuario", async () => {
        const mockResponse = {
            id: "new-id",
            nombre: "Nuevo",
            apellido: "Ayudante",
            email: "nuevo@utalca.cl",
            rol: "AYUDANTE",
            activo: true,
        }

        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => mockResponse,
        } as Response)

        const res = await fetch("/api/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: "Nuevo",
                apellido: "Ayudante",
                email: "nuevo@utalca.cl",
                password: "password123",
                rol: "AYUDANTE",
            }),
        })

        const data = await res.json()
        expect(data.rol).toBe("AYUDANTE")
        expect(data.activo).toBe(true)
    })

    it("retorna error si el servidor falla al crear usuario", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: "User already registered" }),
        } as Response)

        const res = await fetch("/api/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: "Test",
                apellido: "User",
                email: "existente@utalca.cl",
                password: "123456",
                rol: "PROFESOR",
            }),
        })

        const data = await res.json()
        expect(data.error).toBe("User already registered")
    })

    it("envía actualización correcta al deshabilitar un usuario", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ id: "1", nombre: "Lukas", activo: false }),
        } as Response)

        const res = await fetch("/api/usuarios/1", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activo: false }),
        })

        const data = await res.json()
        expect(data.activo).toBe(false)
    })
})
/* eslint-enable @typescript-eslint/naming-convention */
