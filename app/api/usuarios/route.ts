import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { requireRol, requireUsuario } from "@/lib/auth/requireRol"
import { crearUsuarioConPerfil } from "@/lib/auth/crearUsuario"
import { rolesGestionables, type Rol } from "@/lib/auth/roles"

export async function POST(request: Request) {
    const supabase = await createSupabaseServerClient()
    const { error: authError, user } = await requireUsuario(supabase)
    if (authError) return authError

    const { error: rolError, rol: rolDeQuienCrea } = await requireRol(supabase, user, ["ADMIN", "AYUDANTE"], "No tienes permisos para gestionar usuarios")
    if (rolError) return rolError

    const body = await request.json()
    const bodyRecord = body as Record<string, unknown>
    const email = bodyRecord.email as string | undefined
    const password = bodyRecord.password as string | undefined
    const nombre = bodyRecord.nombre as string | undefined
    const apellido = bodyRecord.apellido as string | undefined
    const rol = bodyRecord.rol as string | undefined

    if (!email || !password || !nombre || !apellido || !rol) {
        return NextResponse.json({
            error: "Email, contraseña, nombre, apellido y rol son requeridos",
        }, { status: 400 })
    }

    if (!rolesGestionables.includes(rol as Rol)) {
        return NextResponse.json({
            error: `Rol inválido. Debe ser: ${rolesGestionables.join(" o ")}`,
        }, { status: 400 })
    }

    if (rolDeQuienCrea === "AYUDANTE" && rol !== "PROFESOR") {
        return NextResponse.json({ error: "Como ayudante solo puedes crear profesores" }, { status: 403 })
    }

    const adminClient = createSupabaseAdminClient()
    const resultado = await crearUsuarioConPerfil(adminClient, supabase, { email, password, nombre, apellido, rol: rol as Rol })

    if (resultado.error !== undefined) {
        return NextResponse.json({ error: resultado.error }, { status: 500 })
    }

    return NextResponse.json(resultado.usuario)
}

export async function GET() {
    const supabase = await createSupabaseServerClient()
    const { error: authError, user } = await requireUsuario(supabase)
    if (authError) return authError

    const { error: rolError, rol } = await requireRol(supabase, user, ["ADMIN", "AYUDANTE"], "No tienes permisos para ver usuarios")
    if (rolError) return rolError

    const rolesVisibles = rol === "AYUDANTE" ? ["PROFESOR"] : rolesGestionables

    const { data: usuarios, error } = await supabase
        .from("perfiles")
        .select("id, nombre, apellido, email, rol, activo")
        .in("rol", rolesVisibles)
        .order("nombre", { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(usuarios)
}
