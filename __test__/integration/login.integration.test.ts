import { describe, it, expect, vi, beforeEach } from "vitest"
import { login } from "@/lib/auth/login"

describe("AUTH-01 - login()", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("retorna error si las credenciales son inválidas", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: "Invalid login credentials" }),
    } as Response)

    const resultado = await login("usuario@ejemplo.com", "malacontrasena")

    expect(resultado).toEqual({ error: "Invalid login credentials" })
  })

  it("retorna error si no se encuentra el perfil del usuario", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: "No rows found" }),
    } as Response)

    const resultado = await login("usuario@ejemplo.com", "contrasena123")

    expect(resultado).toEqual({ error: "No rows found" })
  })

  it("retorna error genérico si la API no envía mensaje", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response)

    const resultado = await login("usuario@ejemplo.com", "contrasena123")

    expect(resultado).toEqual({ error: "Error al iniciar sesión" })
  })

  it("retorna el rol del usuario cuando el login es exitoso", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ rol: "ESTUDIANTE" }),
    } as Response)

    const resultado = await login("usuario@ejemplo.com", "contrasena123")

    expect(resultado).toEqual({ rol: "ESTUDIANTE" })
  })
})