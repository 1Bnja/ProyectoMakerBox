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
        return NextResponse.json({ error: "No tienes permisos para editar estudiantes" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.nombre !== undefined) updates.nombre = body.nombre
    if (body.apellido !== undefined) updates.apellido = body.apellido
    if (body.activo !== undefined) updates.activo = body.activo

    if (Object.keys(updates).length === 0 && body.curso_id === undefined) {
        return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
            .from("perfiles")
            .update(updates)
            .eq("id", id)
            .eq("rol", "ESTUDIANTE")

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 })
        }
    }

    if (body.curso_id !== undefined) {
        const { error: deleteError } = await supabase
            .from("curso_estudiantes")
            .delete()
            .eq("estudiante_id", id)

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 })
        }

        if (body.curso_id) {
            const { error: insertError } = await supabase
                .from("curso_estudiantes")
                // eslint-disable-next-line @typescript-eslint/naming-convention
                .insert([{ curso_id: body.curso_id, estudiante_id: id }])

            if (insertError) {
                return NextResponse.json({ error: insertError.message }, { status: 500 })
            }
        }
    }

    const { data, error } = await supabase
        .from("perfiles")
        .select("id, nombre, apellido, email, rol, activo, curso_estudiantes(curso_id)")
        .eq("id", id)
        .eq("rol", "ESTUDIANTE")
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    interface PerfilConCurso {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        curso_estudiantes: { curso_id: string }[] | null
    }

    const relacion = (data as unknown as PerfilConCurso).curso_estudiantes?.[0]

    return NextResponse.json({
        id: data.id,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        rol: data.rol,
        activo: data.activo,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        curso_id: relacion?.curso_id ?? null,
    })
}
