import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { crearUsuarioConPerfil } from "@/lib/auth/crearUsuario"

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
    const resultado = await crearUsuarioConPerfil(adminClient, adminClient, { email, password, nombre, apellido, rol: "SOLICITANTE" })

    if (resultado.error) {
        return NextResponse.json({ error: resultado.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
