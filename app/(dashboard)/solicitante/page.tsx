"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { validarDatosImpresion } from "@/lib/flujo/validacionesImpresion"
import { Sidebar } from "@/app/components/Sidebar"
import { StatusBadge } from "@/app/components/StatusBadge"
import { DataTable, type Column } from "@/app/components/DataTable"

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
            <button className="rounded-md border border-[#1e2235] px-2.5 py-1 text-xs text-[#64748b] transition-colors hover:border-cyan-500/30 hover:text-cyan-400">
                Ver detalle
            </button>
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

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const handleFileChange = async (
        e: ChangeEvent<HTMLInputElement>
    ): Promise<void> => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const file = files[0]
        if (!file) return

        setMensaje(null)

        const { calcularVolumenSTL: extractorVolumen } = await import(
            "@/lib/flujo/validacionesImpresion"
        )

        const reader = new FileReader()

        reader.onload = (
            event: ProgressEvent<FileReader>
        ): void => {
            const target = event.target
            if (!target) return

            const buffer = target.result as ArrayBuffer
            if (!buffer) return

            let volumenCalculado = 0

            if (file.name.toLowerCase().endsWith(".stl")) {
                volumenCalculado = extractorVolumen(buffer)
            } else {
                volumenCalculado = 10
            }

            const datosSolicitudParaValidar = {
                nombreArchivo: file.name,
                material: "PLA",
                volumenCm3: volumenCalculado,
            }

            const validacion = validarDatosImpresion(
                datosSolicitudParaValidar
            )

            if (!validacion.valido) {
                setMensaje({
                    tipo: "error",
                    texto:
                        validacion.error || "Archivo no válido.",
                })
                setArchivo(null)
                e.target.value = ""
                return
            }

            setMensaje(null)
            setArchivo(file)
        }

        reader.onerror = (): void => {
            setMensaje({
                tipo: "error",
                texto: "Error al leer el contenido binario del archivo.",
            })
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
        } catch (error: any) {
            setMensaje({
                tipo: "error",
                texto:
                    error.message ||
                    "Hubo un problema al procesar la solicitud.",
            })
        } finally {
            setCargando(false)
        }
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    /* ---------- render ---------- */

    return (
        <div className="flex w-full">
            <Sidebar
                rol="SOLICITANTE"
                activeTab={tab}
                onTabChange={setTab}
            />

            <main className="flex-1 overflow-auto">
                <header className="flex items-center justify-between border-b border-[#1e2235] px-8 py-5">
                    <h1 className="text-lg font-semibold text-[#e2e8f0] capitalize">
                        {tab === "nueva-solicitud"
                            ? "Nueva Solicitud"
                            : "Mis Solicitudes"}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-[#64748b]">
                        <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            Conectado
                        </span>
                    </div>
                </header>

                <div className="p-8">
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
                                            color: "#06b6d4",
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
                                        className="w-full rounded-lg border border-[#1e2235] bg-[#151821] px-3 py-2.5 text-sm text-[#e2e8f0] outline-none placeholder:text-[#475569] focus:border-cyan-500/50"
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
                                            color: "#06b6d4",
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
                                        className="w-full rounded-lg border border-[#1e2235] bg-[#151821] px-3 py-2.5 text-sm text-[#e2e8f0] outline-none placeholder:text-[#475569] focus:border-cyan-500/50"
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
                                            color: "#06b6d4",
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
                                        className="block cursor-pointer rounded-lg border-2 border-dashed border-[#1e2235] bg-[#0f1119] px-4 py-6 text-center text-sm text-[#64748b] transition-all hover:border-cyan-500/30 hover:bg-cyan-500/5"
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
                                            color: "#06b6d4",
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
                                        className="w-full rounded-lg border border-[#1e2235] bg-[#151821] px-3 py-2.5 text-sm text-[#e2e8f0] outline-none placeholder:text-[#475569] focus:border-cyan-500/50"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={cargando}
                                    className={`w-full rounded-lg py-3 text-sm font-bold text-white transition-colors ${
                                        cargando
                                            ? "bg-[#1e2235] text-[#64748b]"
                                            : "bg-cyan-500 hover:bg-cyan-600"
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
                            <p className="mb-4 text-sm text-[#64748b]">
                                Historial de tus solicitudes de impresión.
                            </p>
                            <DataTable
                                columns={colsHistorial}
                                data={historial}
                            />
                        </section>
                    )}
                </div>
            </main>
        </div>
    )
}
