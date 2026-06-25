import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { requireRol, requireUsuario } from "@/lib/auth/requireRol"
import { rolesGestionables } from "@/lib/auth/roles"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createSupabaseServerClient()
    const { error: authError, user } = await requireUsuario(supabase)
    if (authError) return authError

    const { error: rolError, rol } = await requireRol(supabase, user, ["ADMIN", "AYUDANTE"], "No tienes permisos para editar usuarios")
    if (rolError) return rolError

    const { id } = await params
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.nombre !== undefined) updates.nombre = body.nombre
    if (body.apellido !== undefined) updates.apellido = body.apellido
    if (body.activo !== undefined) updates.activo = body.activo

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    const rolesEditables = rol === "AYUDANTE" ? ["PROFESOR"] : rolesGestionables

    const { data, error } = await supabase
        .from("perfiles")
        .update(updates)
        .eq("id", id)
        .in("rol", rolesEditables)
        .select("id, nombre, apellido, email, rol, activo")
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
