import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

/* eslint-disable @typescript-eslint/naming-convention */

function mapRpcError(error: { message: string; code?: string }): NextResponse {
    const { message, code } = error

    if (code === "42501") {
        const isUnauth =
            message.toLowerCase().includes("no autorizado") ||
            message.toLowerCase().includes("not authorized")
        return NextResponse.json(
            { error: message },
            { status: isUnauth ? 401 : 403 }
        )
    }
    if (code === "22023") {
        return NextResponse.json({ error: message }, { status: 400 })
    }
    if (code === "P0002") {
        return NextResponse.json({ error: message }, { status: 404 })
    }
    if (code === "23514") {
        return NextResponse.json({ error: message }, { status: 409 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
}

export async function GET() {
    const supabase = await createSupabaseServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data, error } = await supabase
        .from("uso_impresion")
        .select(
            `id,
             impresion_id,
             articulo_id,
             cantidad,
             stock_anterior,
             stock_restante,
             creado_en,
             articulo:articulo_id (nombre, unidad_medida),
             impresion:impresion_id (tipo, estado, comentario, created_at, solicitante:user_id (nombre, apellido))`
        )
        .order("creado_en", { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    type MaybeArray<T> = T | T[] | null

    function firstRelation<T>(value: MaybeArray<T>): T | null {
        if (Array.isArray(value)) {
            return value[0] ?? null
        }
        return value
    }

    type ArticuloRelation = {
        nombre: string
        unidad_medida: string
    }

    type SolicitanteRelation = {
        nombre: string
        apellido: string
    }

    type ImpresionRelation = {
        tipo: string
        estado: string
        comentario: string | null
        created_at: string
        solicitante: MaybeArray<SolicitanteRelation>
    }

    type RawRowData = {
        id: string
        impresion_id: string
        articulo_id: string
        cantidad: number
        stock_anterior: number | null
        stock_restante: number | null
        creado_en: string | null
        articulo: MaybeArray<ArticuloRelation>
        impresion: MaybeArray<ImpresionRelation>
    }

    const normalizado = (data as RawRowData[] | null ?? []).map((row) => {
        const articulo = firstRelation(row.articulo)
        const impresion = firstRelation(row.impresion)
        const solicitante = firstRelation(impresion?.solicitante ?? null)

        const impresionNormalized = impresion
            ? {
                  ...impresion,
                  solicitante,
              }
            : null

        return {
            id: row.id,
            impresionId: row.impresion_id,
            articuloId: row.articulo_id,
            cantidad: row.cantidad,
            stockAnterior: row.stock_anterior ?? null,
            stockRestante: row.stock_restante ?? null,
            creadoEn: row.creado_en ?? null,
            articuloNombre: articulo?.nombre ?? null,
            unidadMedida: articulo?.unidad_medida ?? null,
            impresionLabel: buildImpresionLabel(impresionNormalized),
        }
    })

    return NextResponse.json(normalizado)
}
export async function POST(request: Request) {
    const supabase = await createSupabaseServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    let body: unknown
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: "Cuerpo de la solicitud invalido" }, { status: 400 })
    }

    if (!body || typeof body !== "object") {
        return NextResponse.json({ error: "Datos invalidos" }, { status: 400 })
    }

    const raw = body as Record<string, unknown>

    // Validar impresionId
    if (typeof raw.impresionId !== "string" || !raw.impresionId.trim()) {
        return NextResponse.json({ error: "impresionId es obligatorio" }, { status: 400 })
    }

    // Validar articuloId
    if (typeof raw.articuloId !== "string" || !raw.articuloId.trim()) {
        return NextResponse.json({ error: "articuloId es obligatorio" }, { status: 400 })
    }

    // Validar cantidad
    const cantidad = Number(raw.cantidad)
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
        return NextResponse.json(
            { error: "La cantidad debe ser un entero mayor que cero" },
            { status: 400 }
        )
    }

    // Llamar a la RPC (snake_case solo en la llamada a Supabase)
    const { data, error } = await supabase.rpc("registrar_uso_filamento", {
        p_impresion_id: raw.impresionId,
        p_articulo_id: raw.articuloId,
        p_cantidad: cantidad,
    })

    if (error) {
        return mapRpcError(error as { message: string; code?: string })
    }

    const resultado = data as Record<string, unknown> | null
    return NextResponse.json(
        {
            id: resultado?.id ?? null,
            stockAnterior: resultado?.stock_anterior ?? null,
            cantidad: resultado?.cantidad ?? cantidad,
            stockRestante: resultado?.stock_restante ?? null,
        },
        { status: 201 }
    )
}

// Helpers

interface SolicitanteDataHelper {
    nombre: string
    apellido: string
}

interface ImpresionDataHelper {
    tipo?: string
    estado?: string
    solicitante?: SolicitanteDataHelper | null
}

function buildImpresionLabel(impresion: ImpresionDataHelper | null): string {
    if (!impresion) return "Impresión desconocida"
    const solicitante = impresion.solicitante
        ? `${impresion.solicitante.nombre} ${impresion.solicitante.apellido}`
        : null
    const tipo = impresion.tipo ?? impresion.estado ?? ""
    if (solicitante) return `${tipo} — ${solicitante}`
    return tipo || "Impresión sin identificar"
}
