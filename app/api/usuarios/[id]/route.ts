import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const rolesPermitidos = ["AYUDANTE", "PROFESOR"]

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

    if (!perfil || perfil.rol !== "ADMIN") {
        return NextResponse.json({ error: "No tienes permisos para editar usuarios" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.nombre !== undefined) updates.nombre = body.nombre
    if (body.apellido !== undefined) updates.apellido = body.apellido
    if (body.activo !== undefined) updates.activo = body.activo

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    const { data, error } = await supabase
        .from("perfiles")
        .update(updates)
        .eq("id", id)
        .in("rol", rolesPermitidos)
        .select("id, nombre, apellido, email, rol, activo")
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
