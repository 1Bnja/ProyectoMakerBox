"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { validarDatosImpresion } from "@/lib/flujo/validacionesImpresion"
import { StatusBadge } from "@/app/components/StatusBadge"
import { DataTable, type Column } from "@/app/components/DataTable"
import { DashboardShell } from "@/app/components/DashboardShell"
import { Button } from "@/app/components/Button"

/* ---------- mock history ---------- */

interface SolicitudHist {
    id: string
    nombre: string
    estado: string
    fecha: string
}

const historial: SolicitudHist[] = [
    { id: "S-001", nombre: "Engranaje", estado: "PENDIENTE", fecha: "2026-06-14" },
    { id: "S-005", nombre: "Soporte Teléfono", estado: "APROBADA", fecha: "2026-06-10" },
    { id: "S-008", nombre: "Base Lámpara", estado: "IMPRESA", fecha: "2026-05-28" },
]

const colsHistorial: Column<SolicitudHist>[] = [
    { key: "id", header: "ID" },
    { key: "nombre", header: "Nombre" },
    {
        key: "estado",
        header: "Estado",
        render: (s) => <StatusBadge status={s.estado} />,
    },
    { key: "fecha", header: "Fecha" },
    {
        key: "detalle",
        header: "",
        render: () => (
            <Button variant="outline" accent="pink">
                Ver detalle
            </Button>
        ),
    },
]

/* ---------- form types ---------- */

interface FormDatos {
    nombre: string
    descripcion: string
    comentarios: string
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
            const fileExt = archivo.name.split(".").pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `modelos/${fileName}`

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
            title={tab === "nueva-solicitud" ? "Nueva Solicitud" : "Mis Solicitudes"}
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
                            <DataTable
                                columns={colsHistorial}
                                data={historial}
                            />
                        </section>
                    )}
        </DashboardShell>
    )
}
