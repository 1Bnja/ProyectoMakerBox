import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
    const supabase = await createSupabaseServerClient()

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()

    /* eslint-disable @typescript-eslint/naming-convention */
    const solicitudDatos = {
        user_id: user.id,
        tipo: "PERSONAL",
        estado: "PENDIENTE",
        stl_path: body.stl_path,
        comentario: body.comentario,
        created_at: new Date().toISOString(),
        curso_id: null,
        grupo_id: null,
        ayudante_id: null,
    }
    /* eslint-enable @typescript-eslint/naming-convention */

    const { error: insertError } = await supabase
        .from("impresiones")
        .insert([solicitudDatos])

    if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
