import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { requireUsuario } from "@/lib/auth/requireRol"

export async function GET() {
    const supabase = await createSupabaseServerClient()
    const { error: authError, user } = await requireUsuario(supabase)
    if (authError) return authError

    const { data: perfil, error } = await supabase
        .from("perfiles")
        .select("nombre, apellido, rol")
        .eq("id", user.id)
        .single()

    if (error || !perfil) {
        return NextResponse.json({ error: "No se encontró el perfil del usuario" }, { status: 404 })
    }

    return NextResponse.json(perfil)
}
