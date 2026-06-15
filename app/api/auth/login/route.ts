import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
    const { email, password } = await request.json()

    if (!email || !password) {
        return NextResponse.json(
            { error: "Email y contraseña son requeridos" },
            { status: 400 }
        )
    }

    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 })
    }

    const { data: perfil, error: perfilError } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", data.user.id)
        .single()

    if (perfilError || !perfil) {
        return NextResponse.json(
            { error: "No se encontró el perfil del usuario" },
            { status: 404 }
        )
    }

    return NextResponse.json({ rol: (perfil as { rol: string }).rol })
}
