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
        return NextResponse.json({ error: "No tienes permisos para gestionar la disponibilidad de la sala" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const bodyRecord = body as Record<string, unknown>
    const disponible = bodyRecord.disponible

    if (typeof disponible !== "boolean") {
        return NextResponse.json({ error: "disponible es requerido" }, { status: 400 })
    }

    const { data, error } = await supabase
        .from("bloques_disponibilidad")
        .update({ disponible })
        .eq("id", id)
        .select("id, dia, hora_inicio, hora_fin, disponible")
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
