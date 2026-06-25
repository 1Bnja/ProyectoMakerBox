import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const dias = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"]

interface BloqueRow {
    id: string
    dia: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    hora_inicio: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    hora_fin: string
    disponible: boolean
}

export async function GET(request: Request) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const url = new URL(request.url)
    const fecha = url.searchParams.get("fecha")

    if (!fecha) {
        const { data, error } = await supabase
            .from("bloques_disponibilidad")
            .select("id, dia, hora_inicio, hora_fin, disponible")
            .order("dia", { ascending: true })
            .order("hora_inicio", { ascending: true })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    }

    const fechaDate = new Date(`${fecha}T00:00:00Z`)
    if (Number.isNaN(fechaDate.getTime())) {
        return NextResponse.json({ error: "Fecha inválida" }, { status: 400 })
    }

    const dia = dias[fechaDate.getUTCDay()]

    const { data: bloques, error: bloquesError } = await supabase
        .from("bloques_disponibilidad")
        .select("id, dia, hora_inicio, hora_fin, disponible")
        .eq("dia", dia)
        .eq("disponible", true)
        .order("hora_inicio", { ascending: true })

    if (bloquesError) {
        return NextResponse.json({ error: bloquesError.message }, { status: 500 })
    }

    const bloqueIds = ((bloques ?? []) as BloqueRow[]).map((b) => b.id)

    let reservadosIds: string[] = []
    if (bloqueIds.length > 0) {
        const { data: reservas, error: reservasError } = await supabase
            .from("reservas_sala")
            .select("bloque_id")
            .eq("fecha", fecha)
            .in("bloque_id", bloqueIds)

        if (reservasError) {
            return NextResponse.json({ error: reservasError.message }, { status: 500 })
        }

        reservadosIds = (reservas ?? []).map((r) => r.bloque_id)
    }

    const disponibles = ((bloques ?? []) as BloqueRow[]).filter((b) => !reservadosIds.includes(b.id))

    return NextResponse.json(disponibles)
}
