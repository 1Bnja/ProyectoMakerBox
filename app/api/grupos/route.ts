import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { requireRol, requireUsuario } from "@/lib/auth/requireRol"

export async function POST(request: Request) {
    const supabase = await createSupabaseServerClient()
    const { error: authError, user } = await requireUsuario(supabase)
    if (authError) return authError

    const { error: rolError, rol } = await requireRol(supabase, user, ["AYUDANTE", "PROFESOR"], "No tienes permisos para crear grupos")
    if (rolError) return rolError

    const body = await request.json()
    const bodyRecord = body as Record<string, unknown>
    const nombre = bodyRecord.nombre as string | undefined
     
    const cursoId = bodyRecord.curso_id as string | undefined

    if (!nombre || !cursoId) {
        return NextResponse.json({ error: "nombre y curso_id son requeridos" }, { status: 400 })
    }

    const { data: curso, error: cursoError } = await supabase
        .from("cursos")
        .select("id, profesor_id")
        .eq("id", cursoId)
        .single()

    if (cursoError || !curso) {
        return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    if (rol === "PROFESOR" && curso.profesor_id !== user.id) {
        return NextResponse.json({ error: "Solo puedes crear grupos en tus propios cursos" }, { status: 403 })
    }

    const { data: grupo, error } = await supabase
        .from("grupos")
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .insert([{ nombre, curso_id: cursoId }])
         
        .select("id, nombre, curso_id")
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(grupo)
}

export async function GET(request: Request) {
    const supabase = await createSupabaseServerClient()
    const { error: authError } = await requireUsuario(supabase)
    if (authError) return authError

    const url = new URL(request.url)
    const cursoId = url.searchParams.get("curso_id")

    if (!cursoId) {
        return NextResponse.json({ error: "curso_id es requerido" }, { status: 400 })
    }

    const { data: grupos, error } = await supabase
        .from("grupos")
        .select("id, nombre, curso_id")
        .eq("curso_id", cursoId)
        .order("nombre", { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(grupos)
}
