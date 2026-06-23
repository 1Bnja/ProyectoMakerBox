import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
    const body = await request.json()
    const email = body.email as string | undefined
    const password = body.password as string | undefined
    const nombre = body.nombre as string | undefined
    const apellido = body.apellido as string | undefined

    if (!email || !password || !nombre || !apellido) {
        return NextResponse.json(
            { error: "Email, contraseña, nombre y apellido son requeridos" },
            { status: 400 }
        )
    }

    if (password.length < 6) {
        return NextResponse.json(
            { error: "La contraseña debe tener al menos 6 caracteres" },
            { status: 400 }
        )
    }

    const adminClient = createSupabaseAdminClient()

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        email_confirm: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        user_metadata: { nombre, apellido, rol: "SOLICITANTE" },
    })

    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    const { error: perfilError } = await adminClient
        .from("perfiles")
        .insert([{
            id: authData.user.id,
            nombre,
            apellido,
            email,
            rol: "SOLICITANTE",
            activo: true,
        }])

    if (perfilError) {
        await adminClient.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json({ error: perfilError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
