import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { requireUsuario } from "@/lib/auth/requireRol"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createSupabaseServerClient()
    const { error: authError } = await requireUsuario(supabase)
    if (authError) return authError

    const { data, error } = await supabase
        .from("articulos")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !data) {
        return NextResponse.json({ error: "Artículo no encontrado" }, { status: 404 })
    }

    return NextResponse.json(data)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createSupabaseServerClient()
    const { error: authError } = await requireUsuario(supabase)
    if (authError) return authError

    try {
        const body = await request.json()
        const updates: Record<string, unknown> = {}

        if (typeof body.nombre === 'string') {
            const nombre = body.nombre.trim()
            if (!nombre) return NextResponse.json({ error: "El nombre no puede estar vacío" }, { status: 400 })
            updates.nombre = nombre
        }

        if (typeof body.unidad_medida === 'string') {
            const unidad = body.unidad_medida.trim()
            if (!unidad) return NextResponse.json({ error: "La unidad de medida no puede estar vacía" }, { status: 400 })
            updates.unidad_medida = unidad
        }

        if (body.cantidad_actual !== undefined) {
            const qty = Number(body.cantidad_actual)
            if (!Number.isInteger(qty) || qty < 0) {
                return NextResponse.json({ error: "La cantidad actual debe ser un entero mayor o igual a 0" }, { status: 400 })
            }
            updates.cantidad_actual = qty
        }

        if (body.stock_minimo !== undefined) {
            const minQty = Number(body.stock_minimo)
            if (!Number.isInteger(minQty) || minQty < 0) {
                return NextResponse.json({ error: "El stock mínimo debe ser un entero mayor o igual a 0" }, { status: 400 })
            }
            updates.stock_minimo = minQty
        }

        if (body.notificar_stock !== undefined) {
            updates.notificar_stock = Boolean(body.notificar_stock)
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
        }

        // First check if exists
        const { data: existing, error: errExist } = await supabase
            .from("articulos")
            .select("id")
            .eq("id", id)
            .single()

        if (errExist || !existing) {
            return NextResponse.json({ error: "Artículo no encontrado" }, { status: 404 })
        }

        const { data, error } = await supabase
            .from("articulos")
            .update(updates)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }
}
