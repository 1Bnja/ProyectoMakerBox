import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { esFechaValida, obtenerDiaDeFecha } from "@/lib/sala/diasSemana"
import { requireRol, requireUsuario } from "@/lib/auth/requireRol"

export async function GET() {
    const supabase = await createSupabaseServerClient()
    const { error: authError, user } = await requireUsuario(supabase)
    if (authError) return authError

    const { error: rolError } = await requireRol(supabase, user, ["AYUDANTE"], "No tienes permisos para ver las reservas de la sala")
    if (rolError) return rolError

    const { data, error } = await supabase
        .from("reservas_sala")
        .select(
            "id, fecha, actividad, created_at, bloque:bloque_id(dia, hora_inicio, hora_fin), solicitante:solicitante_id(nombre, apellido)"
        )
        .order("fecha", { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const supabase = await createSupabaseServerClient()
    const { error: authError, user } = await requireUsuario(supabase)
    if (authError) return authError

    const { error: rolError } = await requireRol(supabase, user, ["SOLICITANTE", "AYUDANTE"], "Solo un solicitante o el ayudante puede reservar la sala")
    if (rolError) return rolError

    const body = await request.json()
    const bodyRecord = body as Record<string, unknown>
    const bloqueId = bodyRecord.bloque_id as string | undefined
    const fecha = bodyRecord.fecha as string | undefined
    const actividad = bodyRecord.actividad as string | undefined

    if (!bloqueId || !fecha) {
        return NextResponse.json({ error: "bloque_id y fecha son requeridos" }, { status: 400 })
    }

    if (!esFechaValida(fecha)) {
        return NextResponse.json({ error: "Fecha inválida" }, { status: 400 })
    }

    const { data: bloque, error: bloqueError } = await supabase
        .from("bloques_disponibilidad")
        .select("id, dia, disponible")
        .eq("id", bloqueId)
        .single()

    if (bloqueError || !bloque) {
        return NextResponse.json({ error: "Bloque no encontrado" }, { status: 404 })
    }

    if (!bloque.disponible) {
        return NextResponse.json({ error: "Este bloque no está disponible" }, { status: 409 })
    }

    if (bloque.dia !== obtenerDiaDeFecha(fecha)) {
        return NextResponse.json({ error: "El bloque no corresponde al día de la fecha indicada" }, { status: 400 })
    }

    const { data: existente } = await supabase
        .from("reservas_sala")
        .select("id")
        .eq("bloque_id", bloqueId)
        .eq("fecha", fecha)
        .maybeSingle()

    if (existente) {
        return NextResponse.json({ error: "Ese bloque ya está reservado para esa fecha" }, { status: 409 })
    }

    const { data, error } = await supabase
        .from("reservas_sala")
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .insert([{ bloque_id: bloqueId, fecha, actividad: actividad ?? null, solicitante_id: user.id }])
        .select("id, fecha, actividad, created_at")
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
