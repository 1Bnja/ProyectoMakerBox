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
        return NextResponse.json({ error: "No tienes permisos para gestionar solicitudes" }, { status: 403 })
    }

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
