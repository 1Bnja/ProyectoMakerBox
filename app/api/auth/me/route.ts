import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

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
