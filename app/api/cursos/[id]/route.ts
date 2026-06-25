import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { idTieneRol, requireRol, requireUsuario } from "@/lib/auth/requireRol"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createSupabaseServerClient()
    const { error: authError, user } = await requireUsuario(supabase)
    if (authError) return authError

    const { error: rolError } = await requireRol(supabase, user, ["AYUDANTE"], "No tienes permisos para editar cursos")
    if (rolError) return rolError

    const { id } = await params
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.nombre !== undefined) updates.nombre = body.nombre
    if (body.sigla !== undefined) updates.sigla = body.sigla
    if (body.activo !== undefined) updates.activo = body.activo
    if (body.ayudante_id !== undefined) {
        if (body.ayudante_id && !(await idTieneRol(supabase, body.ayudante_id, "AYUDANTE"))) {
            return NextResponse.json({ error: "El ayudante seleccionado no es válido" }, { status: 400 })
        }
        updates.ayudante_id = body.ayudante_id
    }

    if (body.profesor_id !== undefined) {
        if (body.profesor_id && !(await idTieneRol(supabase, body.profesor_id, "PROFESOR"))) {
            return NextResponse.json({ error: "El profesor seleccionado no es válido" }, { status: 400 })
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
