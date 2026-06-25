import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { requireRol, requireUsuario } from "@/lib/auth/requireRol"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createSupabaseServerClient()
    const { error: authError, user } = await requireUsuario(supabase)
    if (authError) return authError

    const { error: rolError } = await requireRol(supabase, user, ["AYUDANTE"], "No tienes permisos para gestionar solicitudes")
    if (rolError) return rolError

    const { id } = await params
    const body = await request.json()
    const estado = body.estado as string | undefined
     
    const motivoRechazo = (body.motivo_rechazo as string | undefined)?.trim()

    if (estado !== "APROBADA" && estado !== "RECHAZADA") {
        return NextResponse.json({ error: "El estado debe ser APROBADA o RECHAZADA" }, { status: 400 })
    }

    if (estado === "RECHAZADA" && !motivoRechazo) {
        return NextResponse.json({ error: "Debe ingresar un motivo de rechazo" }, { status: 400 })
    }

    const { data: actual, error: actualError } = await supabase
        .from("impresiones")
        .select("estado")
        .eq("id", id)
        .single()

    if (actualError || !actual) {
        return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    if (actual.estado !== "PENDIENTE") {
        return NextResponse.json(
            { error: "La solicitud no puede cambiar de estado desde su estado actual" },
            { status: 400 }
        )
    }

    const updates: Record<string, unknown> = {
        estado,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ayudante_id: user.id,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        motivo_rechazo: estado === "RECHAZADA" ? motivoRechazo : null,
    }

    const { data, error } = await supabase
        .from("impresiones")
        .update(updates)
        .eq("id", id)
        .select("id, estado, motivo_rechazo, ayudante_id")
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createSupabaseServerClient()
    const { error: authError, user } = await requireUsuario(supabase)
    if (authError) return authError

    const { error: rolError } = await requireRol(supabase, user, ["AYUDANTE"], "No tienes permisos para ver esta solicitud")
    if (rolError) return rolError

    const { id } = await params

    const { data: solicitud, error } = await supabase
        .from("impresiones")
        .select(
            "id, tipo, estado, comentario, motivo_rechazo, created_at, stl_path, diseno_path, diseno_url, colores, tiempo_estimado, observacion_ayudante, ayudante_id, solicitante:user_id(nombre, apellido)"
        )
        .eq("id", id)
        .single()

    if (error || !solicitud) {
        return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    let archivoUrl: string | null = null
    if (solicitud.stl_path) {
        const { data: firmada } = await supabase.storage
            .from("solicitudes-impresion")
            .createSignedUrl(solicitud.stl_path, 3600)
        archivoUrl = firmada?.signedUrl ?? null
    }

    return NextResponse.json({
        id: solicitud.id,
        tipo: solicitud.tipo,
        estado: solicitud.estado,
        comentario: solicitud.comentario,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        motivo_rechazo: solicitud.motivo_rechazo,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        created_at: solicitud.created_at,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        diseno_path: solicitud.diseno_path,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        diseno_url: solicitud.diseno_url,
        colores: solicitud.colores,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        tiempo_estimado: solicitud.tiempo_estimado,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        observacion_ayudante: solicitud.observacion_ayudante,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ayudante_id: solicitud.ayudante_id,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        archivo_url: archivoUrl,
        solicitante: solicitud.solicitante,
    })
}
