import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
    const supabase = await createSupabaseServerClient()

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()

    /* eslint-disable @typescript-eslint/naming-convention */
    const solicitudDatos = {
        user_id: user.id,
        tipo: "PERSONAL",
        estado: "PENDIENTE",
        stl_path: body.stl_path,
        comentario: body.comentario,
        created_at: new Date().toISOString(),
        curso_id: null,
        grupo_id: null,
        ayudante_id: null,
    }
    /* eslint-enable @typescript-eslint/naming-convention */

    const { error: insertError } = await supabase
        .from("impresiones")
        .insert([solicitudDatos])

    if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
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

    if (!perfil) {
        return NextResponse.json({ error: "No se encontró el perfil del usuario" }, { status: 403 })
    }

    const url = new URL(request.url)
    const estado = url.searchParams.get("estado")
    const esAyudante = perfil.rol === "AYUDANTE"
    const esProfesor = perfil.rol === "PROFESOR"

    let estudianteIds: string[] = []
    if (esProfesor) {
        const { data: cursos } = await supabase
            .from("cursos")
            .select("id")
            .eq("profesor_id", user.id)

        const cursoIds = (cursos ?? []).map((c) => c.id)

        if (cursoIds.length === 0) {
            return NextResponse.json([])
        }

        const { data: relaciones } = await supabase
            .from("curso_estudiantes")
            .select("estudiante_id")
            .in("curso_id", cursoIds)

        estudianteIds = (relaciones ?? []).map((r) => r.estudiante_id)

        if (estudianteIds.length === 0) {
            return NextResponse.json([])
        }
    }

    let query = supabase
        .from("impresiones")
        .select("id, tipo, estado, comentario, motivo_rechazo, created_at, user_id, solicitante:user_id(nombre, apellido)")
        .order("created_at", { ascending: false })

    if (esProfesor) {
        query = query.in("user_id", estudianteIds)
    } else if (!esAyudante) {
        query = query.eq("user_id", user.id)
    }

    if (estado) {
        query = query.eq("estado", estado)
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
