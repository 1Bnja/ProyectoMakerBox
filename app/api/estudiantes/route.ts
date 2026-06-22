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

    if (!perfil || perfil.rol !== "AYUDANTE") {
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

    const { error: perfilError } = await supabase
        .from("perfiles")
        .insert([estudianteData])

    if (perfilError) {
        await adminClient.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json({ error: perfilError.message }, { status: 500 })
    }

    if (cursoId) {
        const { error: cursoEstudianteError } = await supabase
            .from("curso_estudiantes")
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .insert([{ curso_id: cursoId, estudiante_id: authData.user.id }])

        if (cursoEstudianteError) {
            return NextResponse.json({ error: cursoEstudianteError.message }, { status: 500 })
        }
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

    const cursoEstudiantesSelect = "curso_estudiantes(curso_id, cursos(nombre))"
    let query = supabase
        .from("perfiles")
        .select(
            cursoId
                ? `id, nombre, apellido, email, rol, activo, curso_estudiantes!inner(curso_id, cursos(nombre))`
                : `id, nombre, apellido, email, rol, activo, ${cursoEstudiantesSelect}`
        )
        .eq("rol", "ESTUDIANTE")

    if (cursoId) {
        query = query.eq("curso_estudiantes.curso_id", cursoId)
    }

    const { data: estudiantes, error } = await query.order("nombre", { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    interface EstudianteRow {
        id: string
        nombre: string
        apellido: string
        email: string
        rol: string
        activo: boolean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        curso_estudiantes: { curso_id: string; cursos: { nombre: string } | null }[] | null
    }

    const estudiantesPlanos = ((estudiantes ?? []) as unknown as EstudianteRow[]).map((e) => {
        const relacion = e.curso_estudiantes?.[0] ?? null
        return {
            id: e.id,
            nombre: e.nombre,
            apellido: e.apellido,
            email: e.email,
            rol: e.rol,
            activo: e.activo,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            curso_id: relacion?.curso_id ?? null,
            cursos: relacion?.cursos ?? null,
        }
    })

    return NextResponse.json(estudiantesPlanos)
}
