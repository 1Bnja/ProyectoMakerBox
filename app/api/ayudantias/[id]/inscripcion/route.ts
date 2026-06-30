import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const maxAyudantiasPorSemestre = 2

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    if (!perfil || perfil.rol !== "ESTUDIANTE") {
        return NextResponse.json({ error: "Solo un estudiante puede inscribirse a una ayudantía" }, { status: 403 })
    }

    const { id } = await params

    const { data: ayudantia, error: ayudantiaError } = await supabase
        .from("ayudantias")
        .select("id, activo, cupos, curso:curso_id(semestre_id)")
        .eq("id", id)
        .single()

    if (ayudantiaError || !ayudantia) {
        return NextResponse.json({ error: "Ayudantía no encontrada" }, { status: 404 })
    }

    if (!ayudantia.activo) {
        return NextResponse.json({ error: "Esta ayudantía ya no está disponible" }, { status: 409 })
    }

    const { data: existente } = await supabase
        .from("ayudantia_estudiantes")
        .select("ayudantia_id")
        .eq("ayudantia_id", id)
        .eq("estudiante_id", user.id)
        .maybeSingle()

    if (existente) {
        return NextResponse.json({ error: "Ya estás inscrito en esta ayudantía" }, { status: 409 })
    }

    const { data: inscritos } = await supabase
        .from("ayudantia_estudiantes")
        .select("estudiante_id")
        .eq("ayudantia_id", id)

    if ((inscritos?.length ?? 0) >= ayudantia.cupos) {
        return NextResponse.json({ error: "Esta ayudantía no tiene cupos disponibles" }, { status: 409 })
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const semestreId = (ayudantia.curso as unknown as { semestre_id: string | null } | null)?.semestre_id
    if (semestreId) {
        const { data: inscripciones } = await supabase
            .from("ayudantia_estudiantes")
            .select("ayudantia:ayudantia_id(curso:curso_id(semestre_id))")
            .eq("estudiante_id", user.id)

        interface InscripcionRow {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            ayudantia: { curso: { semestre_id: string | null } | null } | null
        }

        const enEsteSemestre = ((inscripciones ?? []) as unknown as InscripcionRow[]).filter(
            (i) => i.ayudantia?.curso?.semestre_id === semestreId
        ).length

        if (enEsteSemestre >= maxAyudantiasPorSemestre) {
            return NextResponse.json(
                { error: `Ya alcanzaste el máximo de ${maxAyudantiasPorSemestre} ayudantías para este semestre` },
                { status: 409 }
            )
        }
    }

    const { error } = await supabase
        .from("ayudantia_estudiantes")
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .insert([{ ayudantia_id: id, estudiante_id: user.id }])

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    const { error } = await supabase
        .from("ayudantia_estudiantes")
        .delete()
        .eq("ayudantia_id", id)
        .eq("estudiante_id", user.id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
}
