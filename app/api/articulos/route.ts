import { NextResponse } from "next/server"
/* eslint-disable @typescript-eslint/naming-convention */

import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data, error } = await supabase
        .from("articulos")
        .select("*")
        .order("nombre", { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
        const unidad_medida = typeof body.unidad_medida === 'string' ? body.unidad_medida.trim() : ''
        const cantidad_actual = Number(body.cantidad_actual)
        const stock_minimo = Number(body.stock_minimo)
        const notificar_stock = Boolean(body.notificar_stock)

        if (!nombre) {
            return NextResponse.json({ error: "El nombre es obligatorio y no puede estar vacío" }, { status: 400 })
        }
        if (!unidad_medida) {
            return NextResponse.json({ error: "La unidad de medida es obligatoria" }, { status: 400 })
        }
        if (!Number.isInteger(cantidad_actual) || cantidad_actual < 0) {
            return NextResponse.json({ error: "La cantidad actual debe ser un entero mayor o igual a 0" }, { status: 400 })
        }
        if (!Number.isInteger(stock_minimo) || stock_minimo < 0) {
            return NextResponse.json({ error: "El stock mínimo debe ser un entero mayor o igual a 0" }, { status: 400 })
        }

        const { data, error } = await supabase
            .from("articulos")
            .insert([{
                nombre,
                cantidad_actual,
                stock_minimo,
                unidad_medida,
                notificar_stock
            }])
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch {
        return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }
}
