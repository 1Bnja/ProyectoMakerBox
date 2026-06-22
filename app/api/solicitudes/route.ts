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

    if (!perfil || perfil.rol !== "AYUDANTE") {
        return NextResponse.json({ error: "No tienes permisos para ver solicitudes" }, { status: 403 })
    }

    const url = new URL(request.url)
    const estado = url.searchParams.get("estado")

    let query = supabase
        .from("impresiones")
        .select("id, tipo, estado, comentario, motivo_rechazo, created_at, user_id, solicitante:user_id(nombre, apellido)")
        .order("created_at", { ascending: false })

    if (estado) {
        query = query.eq("estado", estado)
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
