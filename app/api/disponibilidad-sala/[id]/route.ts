import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { requireRol, requireUsuario } from "@/lib/auth/requireRol"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createSupabaseServerClient()
    const { error: authError, user } = await requireUsuario(supabase)
    if (authError) return authError

    const { error: rolError } = await requireRol(supabase, user, ["AYUDANTE"], "No tienes permisos para gestionar la disponibilidad de la sala")
    if (rolError) return rolError

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
