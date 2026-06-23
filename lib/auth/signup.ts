interface SignupResponse {
    error?: string
    success?: boolean
}

export async function signup(email: string, password: string, nombre: string, apellido: string) {
    const res = await fetch("/api/auth/signup", {
        method: "POST",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nombre, apellido }),
    })

    const data: SignupResponse = await res.json()

    if (!res.ok) {
        return { error: data.error ?? "Error al crear la cuenta" }
    }

    return { success: true }
}
