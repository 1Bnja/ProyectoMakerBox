import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

interface CursoRow {
    id: string
    nombre: string
    sigla: string | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    semestre_id: string | null
    activo: boolean
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ayudante_id: string | null
    ayudante: { nombre: string; apellido: string } | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    profesor_id: string | null
    profesor: { nombre: string; apellido: string } | null
    estudiantes: { count: number }[] | null
}

export async function GET() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: cursos, error } = await supabase
        .from("cursos")
        .select(
            "id, nombre, sigla, semestre_id, activo, ayudante_id, ayudante:ayudante_id(nombre, apellido), profesor_id, profesor:profesor_id(nombre, apellido), estudiantes:curso_estudiantes(count)"
        )
        .order("nombre", { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const cursosConConteo = ((cursos ?? []) as unknown as CursoRow[]).map((curso) => ({
        ...curso,
        estudiantes: curso.estudiantes?.[0]?.count ?? 0,
    }))

    return NextResponse.json(cursosConConteo)
}

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
        return NextResponse.json({ error: "No tienes permisos para crear cursos" }, { status: 403 })
    }

    const body = await request.json()
    const bodyRecord = body as Record<string, unknown>
    const nombre = bodyRecord.nombre as string | undefined
    const sigla = bodyRecord.sigla as string | undefined
    const ayudanteId = bodyRecord.ayudante_id as string | undefined
    const profesorId = bodyRecord.profesor_id as string | undefined

    if (!nombre) {
        return NextResponse.json({ error: "El nombre del curso es requerido" }, { status: 400 })
    }

    if (ayudanteId) {
        const { data: ayudante } = await supabase
            .from("perfiles")
            .select("rol")
            .eq("id", ayudanteId)
            .single()

        if (!ayudante || ayudante.rol !== "AYUDANTE") {
            return NextResponse.json({ error: "El ayudante seleccionado no es válido" }, { status: 400 })
        }
    }

    if (profesorId) {
        const { data: profesor } = await supabase
            .from("perfiles")
            .select("rol")
            .eq("id", profesorId)
            .single()

        if (!profesor || profesor.rol !== "PROFESOR") {
            return NextResponse.json({ error: "El profesor seleccionado no es válido" }, { status: 400 })
        }
    }

    const cursoData: Record<string, unknown> = {
        nombre,
        sigla: sigla || null,
        activo: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ayudante_id: ayudanteId || null,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        profesor_id: profesorId || null,
    }

    const { data, error } = await supabase
        .from("cursos")
        .insert([cursoData])
        .select("id, nombre, sigla, semestre_id, activo, ayudante_id, profesor_id")
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
