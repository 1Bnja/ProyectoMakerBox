/* eslint-disable @typescript-eslint/naming-convention */
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

interface GrupoDelCurso {
    id: string
    nombre: string
     
    curso_id: string
}

interface RelacionGrupo {
     
    grupo_id: string
    grupos: GrupoDelCurso | null
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createSupabaseServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single()

    if (!perfil || (perfil.rol !== "AYUDANTE" && perfil.rol !== "PROFESOR")) {
        return NextResponse.json({ error: "No tienes permisos para asignar grupos" }, { status: 403 })
    }

    const { id: estudianteId } = await params
    const body = (await request.json()) as { curso_id?: unknown; grupo_id?: unknown }
    const cursoId = typeof body.curso_id === "string" ? body.curso_id : ""
    const grupoId = typeof body.grupo_id === "string" ? body.grupo_id : ""

    if (!cursoId || !grupoId) {
        return NextResponse.json({ error: "curso_id y grupo_id son requeridos" }, { status: 400 })
    }

    const { data: estudiante, error: estudianteError } = await supabase
        .from("perfiles")
        .select("id, nombre, apellido, email, rol, activo")
        .eq("id", estudianteId)
        .eq("rol", "ESTUDIANTE")
        .single()

    if (estudianteError || !estudiante) {
        return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    const { data: curso, error: cursoError } = await supabase
        .from("cursos")
        .select("id, nombre, profesor_id")
        .eq("id", cursoId)
        .single()

    if (cursoError || !curso) {
        return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    if (perfil.rol === "PROFESOR" && curso.profesor_id !== user.id) {
        return NextResponse.json({ error: "Solo puedes asignar grupos en tus propios cursos" }, { status: 403 })
    }

    const { data: grupo, error: grupoError } = await supabase
        .from("grupos")
        .select("id, nombre, curso_id")
        .eq("id", grupoId)
        .eq("curso_id", cursoId)
        .single()

    if (grupoError || !grupo) {
        return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 })
    }

    const { data: relacionCurso, error: relacionCursoError } = await supabase
        .from("curso_estudiantes")
        .select("curso_id")
        .eq("estudiante_id", estudianteId)
        .eq("curso_id", cursoId)
        .single()

    if (relacionCursoError || !relacionCurso) {
        return NextResponse.json({ error: "El estudiante no está asociado al curso seleccionado" }, { status: 409 })
    }

    const { data: gruposDelCurso, error: gruposDelCursoError } = await supabase
        .from("grupos")
        .select("id")
        .eq("curso_id", cursoId)

    if (gruposDelCursoError) {
        return NextResponse.json({ error: gruposDelCursoError.message }, { status: 500 })
    }

    const gruposDelCursoIds = (gruposDelCurso ?? []).map((item) => item.id)

    const { data: relacionesGrupo, error: relacionesGrupoError } = await supabase
        .from("grupo_estudiantes")
        .select("grupo_id, grupos(id, nombre, curso_id)")
        .eq("estudiante_id", estudianteId)

    if (relacionesGrupoError) {
        return NextResponse.json({ error: relacionesGrupoError.message }, { status: 500 })
    }

    const relacionesDelCurso = ((relacionesGrupo ?? []) as unknown as RelacionGrupo[]).filter((relacion) => {
        return Boolean(relacion.grupos && gruposDelCursoIds.includes(relacion.grupos.id))
    })

    const yaAsignadoAlGrupo = relacionesDelCurso.some((relacion) => relacion.grupo_id === grupoId)

    if (!yaAsignadoAlGrupo) {
        const gruposAEliminar = relacionesDelCurso
            .map((relacion) => relacion.grupo_id)
            .filter((grupoRelacionadoId) => grupoRelacionadoId !== grupoId)

        if (gruposAEliminar.length > 0) {
            const { error: deleteError } = await supabase
                .from("grupo_estudiantes")
                .delete()
                .eq("estudiante_id", estudianteId)
                .in("grupo_id", gruposAEliminar)

            if (deleteError) {
                return NextResponse.json({ error: deleteError.message }, { status: 500 })
            }
        }

        const { error: insertError } = await supabase
            .from("grupo_estudiantes")
            .insert([{ grupo_id: grupoId, estudiante_id: estudianteId }])

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 })
        }
    }

    return NextResponse.json({
        estudiante: {
            id: estudiante.id,
            nombre: estudiante.nombre,
            apellido: estudiante.apellido,
            email: estudiante.email,
            rol: estudiante.rol,
            activo: estudiante.activo,
        },
        curso: {
            id: curso.id,
            nombre: curso.nombre,
        },
        grupo: {
            id: grupo.id,
            nombre: grupo.nombre,
             
            curso_id: grupo.curso_id,
        },
    })
}