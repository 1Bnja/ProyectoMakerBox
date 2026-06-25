import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import type { Rol } from "@/lib/auth/roles"

type AdminClient = ReturnType<typeof createSupabaseAdminClient>
type PerfilClient = { from: AdminClient["from"] }

interface DatosUsuario {
    email: string
    password: string
    nombre: string
    apellido: string
    rol: Rol
}

interface UsuarioCreado {
    id: string
    nombre: string
    apellido: string
    email: string
    rol: Rol
    activo: boolean
}

/* Crea el usuario de auth y su fila en perfiles; si la fila falla, revierte el usuario de auth. */
export async function crearUsuarioConPerfil(
    adminClient: AdminClient,
    perfilClient: PerfilClient,
    datos: DatosUsuario
): Promise<{ usuario: UsuarioCreado; error?: undefined } | { usuario?: undefined; error: string }> {
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: datos.email,
        password: datos.password,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        email_confirm: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        user_metadata: { nombre: datos.nombre, apellido: datos.apellido, rol: datos.rol },
    })

    if (authError || !authData.user) {
        return { error: authError?.message ?? "Error al crear el usuario" }
    }

    const usuario: UsuarioCreado = {
        id: authData.user.id,
        nombre: datos.nombre,
        apellido: datos.apellido,
        email: datos.email,
        rol: datos.rol,
        activo: true,
    }

    const { error: perfilError } = await perfilClient.from("perfiles").insert([usuario])

    if (perfilError) {
        await adminClient.auth.admin.deleteUser(authData.user.id)
        return { error: perfilError.message }
    }

    return { usuario }
}
