import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

interface AyudantiaRow {
    id: string
    dia: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    hora_inicio: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    hora_fin: string
    cupos: number
    activo: boolean
    curso: { nombre: string } | null
    ayudante: { nombre: string; apellido: string } | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ayudantia_estudiantes: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        estudiante_id: string
        estudiante: { nombre: string; apellido: string } | null
    }[] | null
}

export async function GET() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data, error } = await supabase
        .from("ayudantias")
        .select(
            "id, dia, hora_inicio, hora_fin, cupos, activo, curso:curso_id(nombre), ayudante:ayudante_id(nombre, apellido), ayudantia_estudiantes(estudiante_id, estudiante:estudiante_id(nombre, apellido))"
        )
        .order("dia", { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const resultado = ((data ?? []) as unknown as AyudantiaRow[]).map((a) => ({
        id: a.id,
        dia: a.dia,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        hora_inicio: a.hora_inicio,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        hora_fin: a.hora_fin,
        cupos: a.cupos,
        activo: a.activo,
        curso: a.curso,
        ayudante: a.ayudante,
        inscritos: a.ayudantia_estudiantes?.length ?? 0,
        inscrito: a.ayudantia_estudiantes?.some((e) => e.estudiante_id === user.id) ?? false,
        estudiantes: (a.ayudantia_estudiantes ?? []).map((e) => e.estudiante).filter((e) => e !== null),
    }))

    return NextResponse.json(resultado)
}

export async function POST(request: Request) {
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
        return NextResponse.json({ error: "No tienes permisos para crear ayudantías" }, { status: 403 })
    }

    const body = await request.json()
    const bodyRecord = body as Record<string, unknown>
    const cursoId = bodyRecord.curso_id as string | undefined
    const dia = bodyRecord.dia as string | undefined
    const horaInicio = bodyRecord.hora_inicio as string | undefined
    const horaFin = bodyRecord.hora_fin as string | undefined
    const cupos = Number(bodyRecord.cupos)

    if (!cursoId || !dia || !horaInicio || !horaFin) {
        return NextResponse.json({ error: "curso_id, dia, hora_inicio y hora_fin son requeridos" }, { status: 400 })
    }

    if (!Number.isInteger(cupos) || cupos <= 0) {
        return NextResponse.json({ error: "cupos debe ser un entero mayor a 0" }, { status: 400 })
    }

    const { data: curso, error: cursoError } = await supabase
        .from("cursos")
        .select("id")
        .eq("id", cursoId)
        .single()

    if (cursoError || !curso) {
        return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    const { data, error } = await supabase
        .from("ayudantias")
        .insert([{
            // eslint-disable-next-line @typescript-eslint/naming-convention
            curso_id: cursoId,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            ayudante_id: user.id,
            dia,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            hora_inicio: horaInicio,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            hora_fin: horaFin,
            cupos,
        }])
        .select("id, dia, hora_inicio, hora_fin, cupos, activo")
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
