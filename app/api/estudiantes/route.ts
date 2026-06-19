import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

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

    if (!perfil || (perfil.rol !== "PROFESOR" && perfil.rol !== "AYUDANTE" && perfil.rol !== "ADMIN")) {
        return NextResponse.json({ error: "No tienes permisos para crear estudiantes" }, { status: 403 })
    }

    const body = await request.json()
    const bodyRecord = body as Record<string, unknown>
    const email = bodyRecord.email as string | undefined
    const password = bodyRecord.password as string | undefined
    const nombre = bodyRecord.nombre as string | undefined
    const apellido = bodyRecord.apellido as string | undefined
    const cursoId = bodyRecord.curso_id as string | undefined

    if (!email || !password || !nombre || !apellido) {
        return NextResponse.json({ error: "Email, contraseña, nombre y apellido son requeridos" }, { status: 400 })
    }

    const adminClient = createSupabaseAdminClient()

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        email_confirm: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        user_metadata: { nombre, apellido, rol: "ESTUDIANTE" },
    })

    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    const estudianteData: Record<string, unknown> = {
        id: authData.user.id,
        nombre,
        apellido,
        email,
        rol: "ESTUDIANTE",
        activo: true,
    }

    if (cursoId) {
        estudianteData.curso_id = cursoId
    }

    const { error: perfilError } = await supabase
        .from("perfiles")
        .insert([estudianteData])

    if (perfilError) {
        await adminClient.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json({ error: perfilError.message }, { status: 500 })
    }

    return NextResponse.json({
        id: authData.user.id,
        nombre,
        apellido,
        email,
        rol: "ESTUDIANTE",
        activo: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        curso_id: cursoId ?? null,
    })
}

export async function GET(request: Request) {
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

    if (!perfil || (perfil.rol !== "PROFESOR" && perfil.rol !== "AYUDANTE" && perfil.rol !== "ADMIN")) {
        return NextResponse.json({ error: "No tienes permisos para ver estudiantes" }, { status: 403 })
    }

    const url = new URL(request.url)
    const cursoId = url.searchParams.get("curso_id")

    let query = supabase
        .from("perfiles")
        .select("id, nombre, apellido, email, rol, activo, curso_id, cursos:curso_id(nombre)")
        .eq("rol", "ESTUDIANTE")

    if (cursoId) {
        query = query.eq("curso_id", cursoId)
    }

    const { data: estudiantes, error } = await query.order("nombre", { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(estudiantes)
}
