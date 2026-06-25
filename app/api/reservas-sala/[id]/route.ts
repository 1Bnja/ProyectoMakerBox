import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { requireRol, requireUsuario } from "@/lib/auth/requireRol"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createSupabaseServerClient()
    const { error: authError, user } = await requireUsuario(supabase)
    if (authError) return authError

    const { error: rolError } = await requireRol(supabase, user, ["AYUDANTE"], "Solo el ayudante puede cancelar una reserva de sala")
    if (rolError) return rolError

    const { error } = await supabase
        .from("reservas_sala")
        .delete()
        .eq("id", id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
}
