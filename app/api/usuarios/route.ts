import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

const rolesPermitidos = ["AYUDANTE", "PROFESOR"] as const

export async function POST(request: Request) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: perfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", user.id)
        .single()

    if (!perfil || perfil.rol !== "ADMIN") {
        return NextResponse.json({ error: "No tienes permisos para gestionar usuarios" }, { status: 403 })
    }

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

    if (!rolesPermitidos.includes(rol as typeof rolesPermitidos[number])) {
        return NextResponse.json({
            error: `Rol inválido. Debe ser: ${rolesPermitidos.join(" o ")}`,
        }, { status: 400 })
    }

    const adminClient = createSupabaseAdminClient()

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        email_confirm: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        user_metadata: { nombre, apellido, rol },
    })

    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    const usuarioData: Record<string, unknown> = {
        id: authData.user.id,
        nombre,
        apellido,
        email,
        rol,
        activo: true,
    }

    const { error: perfilError } = await supabase
        .from("perfiles")
        .insert([usuarioData])

    if (perfilError) {
        await adminClient.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json({ error: perfilError.message }, { status: 500 })
    }

    return NextResponse.json({
        id: authData.user.id,
        nombre,
        apellido,
        email,
        rol,
        activo: true,
    })
}

export async function GET() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: perfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", user.id)
        .single()

    if (!perfil || perfil.rol !== "ADMIN") {
        return NextResponse.json({ error: "No tienes permisos para ver usuarios" }, { status: 403 })
    }

    const { data: usuarios, error } = await supabase
        .from("perfiles")
        .select("id, nombre, apellido, email, rol, activo")
        .in("rol", rolesPermitidos)
        .order("nombre", { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(usuarios)
}
