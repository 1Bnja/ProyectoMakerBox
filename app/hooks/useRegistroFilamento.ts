import { useState, useCallback } from "react"
import { evaluarAlertaStock, type ResultadoAlertaStock } from "@/lib/inventario/alertaStock"
import type { Articulo } from "@/app/hooks/useInventario"

export interface ImpresionAprobada {
    id: string
    tipo: string
    estado: string
    comentario: string | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    created_at: string
    solicitante: { nombre: string; apellido: string } | null
}

export interface UsoRegistrado {
    id: string
    impresionId: string
    articuloId: string
    cantidad: number
    stockAnterior: number | null
    stockRestante: number | null
    creadoEn: string | null
    articuloNombre: string | null
    unidadMedida: string | null
    impresionLabel: string
}

export interface RegistrarUsoParams {
    impresionId: string
    articuloId: string
    cantidad: number
}


export function useRegistroFilamento() {
    const [impresiones, setImpresiones] = useState<ImpresionAprobada[]>([])
    const [articulos, setArticulos] = useState<Articulo[]>([])
    const [historial, setHistorial] = useState<UsoRegistrado[]>([])

    const [cargando, setCargando] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mensajeExito, setMensajeExito] = useState<string | null>(null)
    const [alertaStock, setAlertaStock] = useState<ResultadoAlertaStock | null>(null)

    const limpiarMensajes = useCallback(() => {
        setError(null)
        setMensajeExito(null)
        setAlertaStock(null)
    }, [])

    const cargarDatos = useCallback(async () => {
        setCargando(true)
        setError(null)
        try {
            const [resImpresiones, resArticulos, resHistorial] = await Promise.all([
                fetch("/api/solicitudes?estado=APROBADA"),
                fetch("/api/articulos"),
                fetch("/api/uso-impresion"),
            ])

            if (!resImpresiones.ok) {
                const d = await resImpresiones.json()
                throw new Error(d.error ?? "Error al cargar impresiones")
            }
            if (!resArticulos.ok) {
                const d = await resArticulos.json()
                throw new Error(d.error ?? "Error al cargar articulos")
            }
            if (!resHistorial.ok) {
                const d = await resHistorial.json()
                throw new Error(d.error ?? "Error al cargar historial")
            }

            const [dataImp, dataArt, dataHist] = await Promise.all([
                resImpresiones.json(),
                resArticulos.json(),
                resHistorial.json(),
            ])

            setImpresiones(dataImp as ImpresionAprobada[])
            setArticulos(dataArt as Articulo[])
            setHistorial(dataHist as UsoRegistrado[])
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message)
        } finally {
            setCargando(false)
        }
    }, [])

    const registrarUso = useCallback(
        async ({ impresionId, articuloId, cantidad }: RegistrarUsoParams) => {
            if (guardando) return // Protección anti-doble-envio
            setGuardando(true)
            limpiarMensajes()

            try {
                const res = await fetch("/api/uso-impresion", {
                    method: "POST",
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ impresionId, articuloId, cantidad }),
                })
                const data = await res.json()

                if (!res.ok) {
                    throw new Error(data.error ?? "Error al registrar uso")
                }

                const stockRestante: number = data.stockRestante ?? 0

                // Actualizar stock en la lista local de articulos
                setArticulos((prev) =>
                    prev.map((a) =>
                        a.id === articuloId
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            ? { ...a, cantidad_actual: stockRestante }
                            : a
                    )
                )

                // Construir entrada del historial local
                const articuloLocal = articulos.find((a) => a.id === articuloId)
                const impresionLocal = impresiones.find((i) => i.id === impresionId)
                const impresionLabel = impresionLocal
                    ? buildImpresionLabel(impresionLocal)
                    : impresionId

                const nuevoUso: UsoRegistrado = {
                    id: data.id ?? crypto.randomUUID(),
                    impresionId,
                    articuloId,
                    cantidad,
                    stockAnterior: data.stockAnterior ?? null,
                    stockRestante: data.stockRestante ?? null,
                    creadoEn: new Date().toISOString(),
                    articuloNombre: articuloLocal?.nombre ?? null,
                    unidadMedida: articuloLocal?.unidad_medida ?? null,
                    impresionLabel,
                }

                setHistorial((prev) => [nuevoUso, ...prev])
                setMensajeExito("Uso registrado exitosamente")

                // Evaluar alerta de stock
                if (articuloLocal) {
                    const alerta = evaluarAlertaStock(stockRestante, articuloLocal.stock_minimo)
                    if (alerta.requiereAlerta && articuloLocal.notificar_stock) {
                        setAlertaStock(alerta)
                    }
                }
            } catch (err: unknown) {
                if (err instanceof Error) setError(err.message)
                throw err
            } finally {
                setGuardando(false)
            }
        },
        [guardando, limpiarMensajes, articulos, impresiones]
    )

    return {
        impresiones,
        articulos,
        historial,
        cargando,
        guardando,
        error,
        mensajeExito,
        alertaStock,
        cargarDatos,
        registrarUso,
        limpiarMensajes,
    }
}

// Helper interno

function buildImpresionLabel(imp: ImpresionAprobada): string {
    const sol = imp.solicitante
        ? `${imp.solicitante.nombre} ${imp.solicitante.apellido}`
        : null
    const tipo = imp.tipo ?? imp.estado ?? ""
    if (sol) return `${tipo} — ${sol}`
    return tipo || "Impresión sin identificar"
}
