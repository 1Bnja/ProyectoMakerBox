import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const url = new URL(request.url)
    const cursoId = url.searchParams.get("curso_id")

    if (!cursoId) {
        return NextResponse.json({ error: "curso_id es requerido" }, { status: 400 })
    }

    const { data: grupos, error } = await supabase
        .from("grupos")
        .select("id, nombre, curso_id")
        .eq("curso_id", cursoId)
        .order("nombre", { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(grupos)
}
