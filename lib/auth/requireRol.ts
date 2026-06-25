import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Rol } from "@/lib/auth/roles"

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>
type Usuario = { id: string }

export async function requireUsuario(supabase: Supabase) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }), user: null }
    }
    return { error: null, user }
}

export async function requireRol(supabase: Supabase, user: Usuario, roles: Rol[], mensajeProhibido: string) {
    const { data: perfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", user.id)
        .single()

    if (!perfil || !roles.includes(perfil.rol as Rol)) {
        return { error: NextResponse.json({ error: mensajeProhibido }, { status: 403 }), rol: null }
    }
    return { error: null, rol: perfil.rol as Rol }
}

export async function idTieneRol(supabase: Supabase, id: string, rol: Rol): Promise<boolean> {
    const { data: perfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", id)
        .single()

    return perfil?.rol === rol
}
