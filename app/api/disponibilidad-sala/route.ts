import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { esFechaValida, obtenerDiaDeFecha } from "@/lib/sala/diasSemana"
import { requireRol, requireUsuario } from "@/lib/auth/requireRol"

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
    const { error: authError, user } = await requireUsuario(supabase)
    if (authError) return authError

    const url = new URL(request.url)
    const fecha = url.searchParams.get("fecha")
    const vista = url.searchParams.get("vista")

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

    if (!esFechaValida(fecha)) {
        return NextResponse.json({ error: "Fecha inválida" }, { status: 400 })
    }

    if (vista === "gestion") {
        const { error: rolError } = await requireRol(supabase, user, ["AYUDANTE"], "No tienes permisos para gestionar la disponibilidad de la sala")
        if (rolError) return rolError
    }

    const dia = obtenerDiaDeFecha(fecha)

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

    // eslint-disable-next-line @typescript-eslint/naming-convention
    let reservas: { id: string; bloque_id: string }[] = []
    if (bloqueIds.length > 0) {
        const { data, error: reservasError } = await supabase
            .from("reservas_sala")
            .select("id, bloque_id")
            .eq("fecha", fecha)
            .in("bloque_id", bloqueIds)

        if (reservasError) {
            return NextResponse.json({ error: reservasError.message }, { status: 500 })
        }

        reservas = data ?? []
    }

    if (vista === "gestion") {
        const resultado = ((bloques ?? []) as BloqueRow[]).map((b) => {
            const reserva = reservas.find((r) => r.bloque_id === b.id)
            return { ...b, reservaId: reserva?.id ?? null }
        })
        return NextResponse.json(resultado)
    }

    const reservadosIds = reservas.map((r) => r.bloque_id)
    const disponibles = ((bloques ?? []) as BloqueRow[]).filter((b) => !reservadosIds.includes(b.id))

    return NextResponse.json(disponibles)
}
