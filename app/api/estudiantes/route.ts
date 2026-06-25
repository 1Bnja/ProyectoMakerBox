/* eslint-disable @typescript-eslint/naming-convention */
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { requireRol, requireUsuario } from "@/lib/auth/requireRol"
import { crearUsuarioConPerfil } from "@/lib/auth/crearUsuario"

interface CursoRelacion {
     
    curso_id: string
    cursos: { id: string; nombre: string } | null
}

interface GrupoRelacion {
     
    grupo_id: string
    grupos: { id: string; nombre: string; curso_id: string } | null
}

interface EstudianteRow {
    id: string
    nombre: string
    apellido: string
    email: string
    rol: string
    activo: boolean
     
    curso_estudiantes: CursoRelacion[] | null
     
    grupo_estudiantes: GrupoRelacion[] | null
}

export async function POST(request: Request) {
    const supabase = await createSupabaseServerClient()
    const { error: authError, user } = await requireUsuario(supabase)
    if (authError) return authError

    const { error: rolError } = await requireRol(supabase, user, ["AYUDANTE"], "No tienes permisos para crear estudiantes")
    if (rolError) return rolError

    const body = await request.json()
    const bodyRecord = body as Record<string, unknown>
    const email = bodyRecord.email as string | undefined
    const password = bodyRecord.password as string | undefined
    const nombre = bodyRecord.nombre as string | undefined
    const apellido = bodyRecord.apellido as string | undefined
    const cursoId = bodyRecord.curso_id as string | undefined

    if (!email || !password || !nombre || !apellido) {
        return NextResponse.json({ error: "Email, contraseña, nombre y apellido son requeridos" }, { status: 400 })
    }

    const adminClient = createSupabaseAdminClient()
    const resultado = await crearUsuarioConPerfil(adminClient, supabase, { email, password, nombre, apellido, rol: "ESTUDIANTE" })

    if (resultado.error !== undefined) {
        return NextResponse.json({ error: resultado.error }, { status: 500 })
    }

    if (cursoId) {
        const { error: cursoEstudianteError } = await supabase
            .from("curso_estudiantes")

            .insert([{ curso_id: cursoId, estudiante_id: resultado.usuario.id }])

        if (cursoEstudianteError) {
            return NextResponse.json({ error: cursoEstudianteError.message }, { status: 500 })
        }
    }

    return NextResponse.json({
        ...resultado.usuario,

        curso_id: cursoId ?? null,
    })
}

export async function GET(request: Request) {
    const supabase = await createSupabaseServerClient()
    const { error: authError, user } = await requireUsuario(supabase)
    if (authError) return authError

    const { error: rolError } = await requireRol(supabase, user, ["PROFESOR", "AYUDANTE", "ADMIN"], "No tienes permisos para ver estudiantes")
    if (rolError) return rolError

    const url = new URL(request.url)
    const cursoId = url.searchParams.get("curso_id")

    const cursoEstudiantesSelect = "curso_estudiantes(curso_id, cursos(id, nombre))"
    const grupoEstudiantesSelect = "grupo_estudiantes(grupo_id, grupos(id, nombre, curso_id))"
    let query = supabase
        .from("perfiles")
        .select(
            cursoId
                ? `id, nombre, apellido, email, rol, activo, curso_estudiantes!inner(curso_id, cursos(id, nombre)), ${grupoEstudiantesSelect}`
                : `id, nombre, apellido, email, rol, activo, ${cursoEstudiantesSelect}, ${grupoEstudiantesSelect}`
        )
        .eq("rol", "ESTUDIANTE")

    if (cursoId) {
        query = query.eq("curso_estudiantes.curso_id", cursoId)
    }

    const { data: estudiantes, error } = await query.order("nombre", { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const estudiantesPlanos = ((estudiantes ?? []) as unknown as EstudianteRow[]).map((e) => {
        const relacionCurso = e.curso_estudiantes?.[0] ?? null
        const relacionGrupo = e.grupo_estudiantes?.[0] ?? null
        return {
            id: e.id,
            nombre: e.nombre,
            apellido: e.apellido,
            email: e.email,
            rol: e.rol,
            activo: e.activo,
             
            curso_id: relacionCurso?.curso_id ?? null,
            cursos: relacionCurso?.cursos ?? null,
             
            grupo_id: relacionGrupo?.grupo_id ?? null,
            grupos: relacionGrupo?.grupos ?? null,
             
            cursos_asociados: (e.curso_estudiantes ?? []).map((relacion) => relacion.cursos).filter(Boolean),
             
            grupos_asociados: (e.grupo_estudiantes ?? []).map((relacion) => relacion.grupos).filter(Boolean),
        }
    })

    return NextResponse.json(estudiantesPlanos)
}
