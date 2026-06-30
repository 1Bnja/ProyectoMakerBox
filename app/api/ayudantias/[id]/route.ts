import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
        return NextResponse.json({ error: "No tienes permisos para editar ayudantías" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.dia !== undefined) updates.dia = body.dia
    if (body.hora_inicio !== undefined) updates.hora_inicio = body.hora_inicio
    if (body.hora_fin !== undefined) updates.hora_fin = body.hora_fin
    if (body.cupos !== undefined) updates.cupos = Number(body.cupos)
    if (body.activo !== undefined) updates.activo = Boolean(body.activo)

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    const { data, error } = await supabase
        .from("ayudantias")
        .update(updates)
        .eq("id", id)
        .select("id, dia, hora_inicio, hora_fin, cupos, activo")
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
