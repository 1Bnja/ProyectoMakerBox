import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
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
        return NextResponse.json({ error: "Solo el ayudante puede cancelar una reserva de sala" }, { status: 403 })
    }

    const { error } = await supabase
        .from("reservas_sala")
        .delete()
        .eq("id", id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
}
