"use client"

import { useEffect, useState } from "react"
import { Modal } from "./Modal"
import { StatusBadge } from "./StatusBadge"
import { Button } from "./Button"

interface SolicitudDetalle {
    id: string
    tipo: string
    estado: string
    comentario: string | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    motivo_rechazo: string | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    created_at: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    diseno_path: string | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    diseno_url: string | null
    colores: string[] | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    tiempo_estimado: string | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    observacion_ayudante: string | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    archivo_url: string | null
    solicitante: { nombre: string; apellido: string } | null
}

interface SolicitudDetalleModalProps {
    id: string
    onClose: () => void
    onCambioEstado: () => void
}

/* Modal de detalle de una solicitud de impresión (IMP-05): trae el detalle
   completo (incluyendo URL firmada del archivo STL) y permite aprobar o
   rechazar la solicitud si está pendiente. */
export function SolicitudDetalleModal({ id, onClose, onCambioEstado }: SolicitudDetalleModalProps) {
    const [detalle, setDetalle] = useState<SolicitudDetalle | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [motivoRechazo, setMotivoRechazo] = useState("")
    const [enviando, setEnviando] = useState(false)
    const [errorAccion, setErrorAccion] = useState("")

    useEffect(() => {
        async function cargarDetalle() {
            const res = await fetch(`/api/solicitudes/${id}`)
            const data = await res.json()

            if (!res.ok) {
                setError(data.error ?? "No se pudo cargar la solicitud")
                setLoading(false)
                return
            }

            setDetalle(data)
            setLoading(false)
        }
        cargarDetalle()
    }, [id])

    async function cambiarEstado(estado: "APROBADA" | "RECHAZADA") {
        if (estado === "RECHAZADA" && !motivoRechazo.trim()) {
            alert("Debe ingresar un motivo para rechazar la solicitud")
            return
        }

        setEnviando(true)
        setErrorAccion("")

        const res = await fetch(`/api/solicitudes/${id}`, {
            method: "PATCH",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
                // eslint-disable-next-line @typescript-eslint/naming-convention
                estado === "RECHAZADA" ? { estado, motivo_rechazo: motivoRechazo } : { estado }
            ),
        })
        const data = await res.json()

        setEnviando(false)

        if (!res.ok) {
            setErrorAccion(data.error ?? "No se pudo actualizar la solicitud")
            return
        }

        onCambioEstado()
        onClose()
    }

    return (
        <Modal title="Detalle de solicitud">
            {loading ? (
                <p className="text-sm text-slate-500">Cargando...</p>
            ) : error ? (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
            ) : detalle ? (
                <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">
                            {detalle.solicitante ? `${detalle.solicitante.nombre} ${detalle.solicitante.apellido}` : "—"}
                        </span>
                        <StatusBadge status={detalle.estado} />
                    </div>
                    <p className="text-xs text-slate-500">
                        {detalle.tipo} · {new Date(detalle.created_at).toLocaleDateString("es-CL")}
                    </p>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Comentario</p>
                        <p className="text-slate-700">{detalle.comentario ?? "—"}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Archivo</p>
                        {detalle.archivo_url ? (
                            <a
                                href={detalle.archivo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#BC367B] underline"
                            >
                                Ver archivo STL
                            </a>
                        ) : (
                            <p className="text-slate-500">Archivo no disponible</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Diseño</p>
                            <p className="text-slate-700">{detalle.diseno_url ?? "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Colores</p>
                            <p className="text-slate-700">{detalle.colores?.join(", ") ?? "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Tiempo estimado</p>
                            <p className="text-slate-700">{detalle.tiempo_estimado ?? "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Observación del ayudante</p>
                            <p className="text-slate-700">{detalle.observacion_ayudante ?? "—"}</p>
                        </div>
                    </div>
                    {detalle.estado === "RECHAZADA" && detalle.motivo_rechazo && (
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Motivo de rechazo</p>
                            <p className="rounded-lg bg-rose-50 px-3 py-2 text-rose-700">{detalle.motivo_rechazo}</p>
                        </div>
                    )}

                    {detalle.estado === "PENDIENTE" && (
                        <div className="space-y-2 border-t border-slate-200 pt-3">
                            <textarea
                                value={motivoRechazo}
                                onChange={(e) => setMotivoRechazo(e.target.value)}
                                placeholder="Motivo de rechazo"
                                rows={2}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 outline-none transition-colors placeholder:text-slate-400 focus:border-[#BC367B]/40 focus:ring-2 focus:ring-[#BC367B]/10"
                            />
                            {errorAccion && (
                                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{errorAccion}</p>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => cambiarEstado("APROBADA")}
                                    disabled={enviando}
                                    className="rounded-md border border-emerald-200 px-2.5 py-1 text-xs text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50"
                                >
                                    Aprobar
                                </button>
                                <button
                                    onClick={() => cambiarEstado("RECHAZADA")}
                                    disabled={enviando}
                                    className="rounded-md border border-rose-200 px-2.5 py-1 text-xs text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
                                >
                                    Rechazar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : null}

            <div className="mt-4 flex justify-end">
                <Button type="button" variant="secondary" onClick={onClose}>
                    Cerrar
                </Button>
            </div>
        </Modal>
    )
}
