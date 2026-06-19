import type { Rol } from "@/lib/auth/roles"

interface LoginResponse {
    error?: string
    rol?: Rol
}

export async function login(email: string, password: string) {
    /* eslint-disable @typescript-eslint/naming-convention */
    const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    })
    /* eslint-enable @typescript-eslint/naming-convention */

    const data: LoginResponse = await res.json()

    if (!res.ok) {
        return { error: data.error ?? "Error al iniciar sesión" }
    }

    return { rol: data.rol as Rol }
}