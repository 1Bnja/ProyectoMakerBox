"use client"

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { validarDatosImpresion } from "@/lib/flujo/validacionesImpresion"
import { esDiaOperativo } from "@/lib/sala/diasSemana"
import { StatusBadge } from "@/app/components/StatusBadge"
import { DataTable, type Column } from "@/app/components/DataTable"
import { DashboardShell } from "@/app/components/DashboardShell"

interface SolicitudHist {
    id: string
    tipo: string
    estado: string
    comentario: string | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    created_at: string
}

const colsHistorial: Column<SolicitudHist>[] = [
    {
        key: "comentario",
        header: "Comentario",
        render: (s) => s.comentario ?? "—",
    },
    {
        key: "estado",
        header: "Estado",
        render: (s) => <StatusBadge status={s.estado} />,
    },
    {
        key: "created_at",
        header: "Fecha",
        render: (s) => new Date(s.created_at).toLocaleDateString("es-CL"),
    },
]

/* ---------- form types ---------- */

interface FormDatos {
    nombre: string
    descripcion: string
    comentarios: string
}

interface BloqueDisponible {
    id: string
    dia: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    hora_inicio: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    hora_fin: string
}

export default function SolicitantePage() {
    const supabase = getSupabaseClient()
    const [tab, setTab] = useState("nueva-solicitud")

    /* ---------- form state ---------- */

    const [datos, setDatos] = useState<FormDatos>({
        nombre: "",
        descripcion: "",
        comentarios: "",
    })
    const [archivo, setArchivo] = useState<File | null>(null)
    const [cargando, setCargando] = useState(false)
    const [mensaje, setMensaje] = useState<{
        tipo: "exito" | "error"
        texto: string
    } | null>(null)

    /* ---------- historial state ---------- */

    const [historial, setHistorial] = useState<SolicitudHist[]>([])
    const [loadingHistorial, setLoadingHistorial] = useState(true)
    const [errorHistorial, setErrorHistorial] = useState("")

    async function cargarHistorial() {
        setLoadingHistorial(true)
        setErrorHistorial("")
        const res = await fetch("/api/solicitudes")
        const data = await res.json()

        if (!res.ok) {
            setErrorHistorial(data.error ?? "No se pudo cargar tu historial de solicitudes")
            setLoadingHistorial(false)
            return
        }

        setHistorial(data)
        setLoadingHistorial(false)
    }

    useEffect(() => {
        cargarHistorial()
    }, [])

    /* ---------- reserva sala state ---------- */

    const [fechaSala, setFechaSala] = useState("")
    const [bloquesDisponibles, setBloquesDisponibles] = useState<BloqueDisponible[]>([])
    const [diaCerrado, setDiaCerrado] = useState(false)
    const [loadingBloques, setLoadingBloques] = useState(false)
    const [bloqueId, setBloqueId] = useState("")
    const [actividadSala, setActividadSala] = useState("")
    const [enviandoReserva, setEnviandoReserva] = useState(false)
    const [mensajeSala, setMensajeSala] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null)

    const handleFechaSalaChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const nuevaFecha = e.target.value
        setFechaSala(nuevaFecha)
        setBloqueId("")
        setMensajeSala(null)
        setDiaCerrado(false)

        if (!nuevaFecha) {
            setBloquesDisponibles([])
            return
        }

        if (!esDiaOperativo(nuevaFecha)) {
            setBloquesDisponibles([])
            setDiaCerrado(true)
            return
        }

        setLoadingBloques(true)
        const res = await fetch(`/api/disponibilidad-sala?fecha=${nuevaFecha}`)
        const data = await res.json()
        setBloquesDisponibles(res.ok ? data : [])
        setLoadingBloques(false)
    }

    const handleSubmitReserva = async (e: FormEvent) => {
        e.preventDefault()
        if (!fechaSala || !bloqueId) {
            setMensajeSala({ tipo: "error", texto: "Selecciona una fecha y un bloque horario disponible." })
            return
        }

        setEnviandoReserva(true)
        setMensajeSala(null)

        try {
            /* eslint-disable @typescript-eslint/naming-convention */
            const res = await fetch("/api/reservas-sala", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bloque_id: bloqueId, fecha: fechaSala, actividad: actividadSala || undefined }),
            })
            /* eslint-enable @typescript-eslint/naming-convention */
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || "Error al reservar la sala")

            setMensajeSala({ tipo: "exito", texto: "¡Reserva de sala creada exitosamente!" })
            setBloqueId("")
            setActividadSala("")
            const refresco = await fetch(`/api/disponibilidad-sala?fecha=${fechaSala}`)
            const refrescoData = await refresco.json()
            setBloquesDisponibles(refresco.ok ? refrescoData : [])
        } catch (error) {
            const message = error instanceof Error ? error.message : "Hubo un problema al procesar la reserva."
            setMensajeSala({ tipo: "error", texto: message })
        } finally {
            setEnviandoReserva(false)
        }
    }

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setDatos((prev) => ({ ...prev, [name]: value }))
    }

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const file = files[0]
        if (!file) return

        setMensaje(null)

        const { calcularVolumenSTL } = await import("@/lib/flujo/validacionesImpresion")

        const reader = new FileReader()

        reader.onload = (event: ProgressEvent<FileReader>): void => {
            const buffer = event.target?.result as ArrayBuffer
            if (!buffer) return

            const volumenCalculado = file.name.toLowerCase().endsWith(".stl")
                ? calcularVolumenSTL(buffer)
                : 10

            const validacion = validarDatosImpresion({
                nombreArchivo: file.name,
                material: "PLA",
                volumenCm3: volumenCalculado,
            })

            if (!validacion.valido) {
                setMensaje({ tipo: "error", texto: validacion.error ?? "Archivo no válido." })
                setArchivo(null)
                e.target.value = ""
                return
            }

            setMensaje(null)
            setArchivo(file)
        }

        reader.onerror = (): void => {
            setMensaje({ tipo: "error", texto: "Error al leer el contenido binario del archivo." })
        }

        reader.readAsArrayBuffer(file)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!archivo) {
            setMensaje({
                tipo: "error",
                texto: "Por favor, sube un archivo de impresión (.stl, .obj).",
            })
            return
        }

        setCargando(true)
        setMensaje(null)

        try {
            const filePath = `modelos/${archivo.name}`

            const { error: uploadError } = await supabase.storage
                .from("solicitudes-impresion")
                .upload(filePath, archivo)

            if (uploadError)
                throw new Error(
                    `Error al subir archivo: ${uploadError.message}`
                )

            const comentario = `Proyecto: ${datos.nombre}. Descripción: ${datos.descripcion}. Notas: ${datos.comentarios}`

            /* eslint-disable @typescript-eslint/naming-convention */
            const res = await fetch("/api/solicitudes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stl_path: filePath, comentario }),
            })
            /* eslint-enable @typescript-eslint/naming-convention */

            const data = await res.json()

            if (!res.ok)
                throw new Error(
                    data.error || "Error al crear la solicitud"
                )

            setMensaje({
                tipo: "exito",
                texto: "¡Solicitud creada exitosamente en el sistema!",
            })
            setDatos({ nombre: "", descripcion: "", comentarios: "" })
            setArchivo(null)
            cargarHistorial()
        } catch (error) {
            const message = error instanceof Error ? error.message : "Hubo un problema al procesar la solicitud."
            setMensaje({ tipo: "error", texto: message })
        } finally {
            setCargando(false)
        }
    }

    /* ---------- render ---------- */

    return (
        <DashboardShell
            rol="SOLICITANTE"
            tab={tab}
            onTabChange={setTab}
            title={tab === "nueva-solicitud" ? "Nueva Solicitud" : tab === "sala" ? "Reservar Sala" : "Mis Solicitudes"}
        >
                    {tab === "nueva-solicitud" && (
                        <div
                            style={{
                                maxWidth: "600px",
                                margin: "0 auto",
                            }}
                        >
                            {mensaje && (
                                <div
                                    style={{
                                        padding: "12px",
                                        borderRadius: "6px",
                                        marginBottom: "20px",
                                        backgroundColor:
                                            mensaje.tipo === "exito"
                                                ? "rgba(34,197,94,0.1)"
                                                : "rgba(239,68,68,0.1)",
                                        color:
                                            mensaje.tipo === "exito"
                                                ? "#22c55e"
                                                : "#ef4444",
                                        border: `1px solid ${
                                            mensaje.tipo === "exito"
                                                ? "rgba(34,197,94,0.3)"
                                                : "rgba(239,68,68,0.3)"
                                        }`,
                                        fontSize: "14px",
                                    }}
                                >
                                    {mensaje.texto}
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(188,54,123,0.06)]"
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "16px",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "6px",
                                    }}
                                >
                                    <label
                                        htmlFor="nombre"
                                        style={{
                                            fontWeight: "bold",
                                            color: "#4A2775",
                                            fontSize: "14px",
                                        }}
                                    >
                                        Nombre de la Pieza / Proyecto *
                                    </label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        required
                                        value={datos.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Engranaje de ..."
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#4A2775] focus:ring-4 focus:ring-[#4A2775]/15"
                                    />
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "6px",
                                    }}
                                >
                                    <label
                                        htmlFor="descripcion"
                                        style={{
                                            fontWeight: "bold",
                                            color: "#4A2775",
                                            fontSize: "14px",
                                        }}
                                    >
                                        Descripción técnica *
                                    </label>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        required
                                        rows={3}
                                        value={datos.descripcion}
                                        onChange={handleInputChange}
                                        placeholder="Detalla las dimensiones aproximadas o el propósito de la pieza..."
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#4A2775] focus:ring-4 focus:ring-[#4A2775]/15"
                                    />
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "6px",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontWeight: "bold",
                                            color: "#4A2775",
                                            fontSize: "14px",
                                        }}
                                    >
                                        Modelo 3D (Formatos admitidos: .stl,
                                        .obj) *
                                    </span>

                                    <input
                                        type="file"
                                        id="archivo"
                                        accept=".stl,.obj"
                                        onChange={handleFileChange}
                                        style={{ display: "none" }}
                                    />

                                    <label
                                        htmlFor="archivo"
                                        className="block cursor-pointer rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 transition-all hover:border-[#4A2775]/40 hover:bg-[#4A2775]/[0.04]"
                                    >
                                        {archivo
                                            ? `Archivo seleccionado: ${archivo.name}`
                                            : "Haz click aquí para buscar tu archivo 3D"}
                                    </label>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "6px",
                                    }}
                                >
                                    <label
                                        htmlFor="comentarios"
                                        style={{
                                            fontWeight: "bold",
                                            color: "#4A2775",
                                            fontSize: "14px",
                                        }}
                                    >
                                        Comentarios adicionales
                                    </label>
                                    <textarea
                                        id="comentarios"
                                        name="comentarios"
                                        rows={2}
                                        value={datos.comentarios}
                                        onChange={handleInputChange}
                                        placeholder="Especificaciones de color, relleno o material si tienes alguna preferencia..."
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#4A2775] focus:ring-4 focus:ring-[#4A2775]/15"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={cargando}
                                    className={`w-full rounded-lg py-3 text-sm font-bold text-white shadow-sm transition-colors ${
                                        cargando
                                            ? "cursor-not-allowed bg-slate-300 text-slate-500"
                                            : "bg-[#BC367B] shadow-[#BC367B]/20 hover:bg-[#a12d69]"
                                    }`}
                                >
                                    {cargando
                                        ? "Procesando..."
                                        : "Enviar Solicitud"}
                                </button>
                            </form>
                        </div>
                    )}

                    {tab === "solicitudes" && (
                        <section>
                            <p className="mb-4 text-sm text-slate-500">
                                Historial de tus solicitudes de impresión.
                            </p>
                            {errorHistorial && (
                                <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{errorHistorial}</p>
                            )}
                            {loadingHistorial ? (
                                <div className="flex items-center justify-center py-16 text-sm text-slate-500">
                                    Cargando solicitudes...
                                </div>
                            ) : (
                                <DataTable
                                    columns={colsHistorial}
                                    data={historial}
                                />
                            )}
                        </section>
                    )}

                    {tab === "sala" && (
                        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                            {mensajeSala && (
                                <div
                                    className={`mb-5 rounded-lg border px-3 py-2 text-sm ${
                                        mensajeSala.tipo === "exito"
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                            : "border-rose-200 bg-rose-50 text-rose-600"
                                    }`}
                                >
                                    {mensajeSala.texto}
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmitReserva}
                                className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(188,54,123,0.06)]"
                            >
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="fechaSala" className="text-sm font-bold text-[#4A2775]">
                                        Fecha *
                                    </label>
                                    <input
                                        type="date"
                                        id="fechaSala"
                                        required
                                        value={fechaSala}
                                        onChange={handleFechaSalaChange}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#4A2775] focus:ring-4 focus:ring-[#4A2775]/15"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <span className="text-sm font-bold text-[#4A2775]">Bloque horario *</span>
                                    {!fechaSala ? (
                                        <p className="text-sm text-slate-500">Selecciona una fecha para ver los bloques disponibles.</p>
                                    ) : diaCerrado ? (
                                        <p className="text-sm text-slate-500">La sala no opera ese día (solo de lunes a viernes).</p>
                                    ) : loadingBloques ? (
                                        <p className="text-sm text-slate-500">Cargando disponibilidad...</p>
                                    ) : bloquesDisponibles.length === 0 ? (
                                        <p className="text-sm text-slate-500">No hay bloques disponibles para esa fecha.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {bloquesDisponibles.map((b) => (
                                                <label
                                                    key={b.id}
                                                    className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                                                        bloqueId === b.id
                                                            ? "border-[#4A2775] bg-[#4A2775]/5"
                                                            : "border-slate-200 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <span>
                                                        {b.hora_inicio.slice(0, 5)} - {b.hora_fin.slice(0, 5)}
                                                    </span>
                                                    <input
                                                        type="radio"
                                                        name="bloque"
                                                        value={b.id}
                                                        checked={bloqueId === b.id}
                                                        onChange={() => setBloqueId(b.id)}
                                                        className="accent-[#BC367B]"
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="actividadSala" className="text-sm font-bold text-[#4A2775]">
                                        Actividad (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        id="actividadSala"
                                        value={actividadSala}
                                        onChange={(e) => setActividadSala(e.target.value)}
                                        placeholder="Ej: Reunión de grupo"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#4A2775] focus:ring-4 focus:ring-[#4A2775]/15"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={enviandoReserva}
                                    className={`w-full rounded-lg py-3 text-sm font-bold text-white shadow-sm transition-colors ${
                                        enviandoReserva
                                            ? "cursor-not-allowed bg-slate-300 text-slate-500"
                                            : "bg-[#BC367B] shadow-[#BC367B]/20 hover:bg-[#a12d69]"
                                    }`}
                                >
                                    {enviandoReserva ? "Procesando..." : "Solicitar Reserva"}
                                </button>
                            </form>
                        </div>
                    )}
        </DashboardShell>
    )
}
