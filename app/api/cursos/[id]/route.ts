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
        return NextResponse.json({ error: "No tienes permisos para editar cursos" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.nombre !== undefined) updates.nombre = body.nombre
    if (body.sigla !== undefined) updates.sigla = body.sigla
    if (body.activo !== undefined) updates.activo = body.activo
    if (body.ayudante_id !== undefined) {
        if (body.ayudante_id) {
            const { data: ayudante } = await supabase
                .from("perfiles")
                .select("rol")
                .eq("id", body.ayudante_id)
                .single()

            if (!ayudante || ayudante.rol !== "AYUDANTE") {
                return NextResponse.json({ error: "El ayudante seleccionado no es válido" }, { status: 400 })
            }
        }
        updates.ayudante_id = body.ayudante_id
    }

    if (body.profesor_id !== undefined) {
        if (body.profesor_id) {
            const { data: profesor } = await supabase
                .from("perfiles")
                .select("rol")
                .eq("id", body.profesor_id)
                .single()

            if (!profesor || profesor.rol !== "PROFESOR") {
                return NextResponse.json({ error: "El profesor seleccionado no es válido" }, { status: 400 })
            }
        }
        updates.profesor_id = body.profesor_id
    }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    const { data, error } = await supabase
        .from("cursos")
        .update(updates)
        .eq("id", id)
        .select("id, nombre, sigla, semestre_id, activo, ayudante_id, profesor_id")
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
