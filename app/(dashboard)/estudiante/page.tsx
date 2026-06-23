"use client"

import { useEffect, useState } from "react"
import { StatusBadge } from "@/app/components/StatusBadge"
import { DataTable, type Column } from "@/app/components/DataTable"
import { DashboardShell } from "@/app/components/DashboardShell"
import { SectionToolbar } from "@/app/components/SectionToolbar"
import { Button } from "@/app/components/Button"
import { FormField, FormSelect } from "@/app/components/FormField"
import FormularioSolicitudEstudiante from './FormularioSolicitud'

interface Solicitud {
    id: string
    tipo: string
    estado: string
    comentario: string | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    created_at: string
}

interface Ayudantia {
    curso: string
    ayudante: string
    horario: string
    cupos: number
}

const ayudantias: Ayudantia[] = [
    { curso: "Diseño 3D Avanzado", ayudante: "Lukas Avello", horario: "Lun 14:30-16:00", cupos: 5 },
    { curso: "Prototipado Rápido", ayudante: "Camila Rojas", horario: "Mié 10:00-11:30", cupos: 2 },
    { curso: "Introducción Impresión 3D", ayudante: "Lukas Avello", horario: "Vie 15:00-16:30", cupos: 8 },
]

const colsSolicitudes: Column<Solicitud>[] = [
    {
        key: "comentario",
        header: "Comentario",
        render: (s) => s.comentario ?? "—",
    },
    { key: "tipo", header: "Tipo" },
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

const colsAyudantias: Column<Ayudantia>[] = [
    { key: "curso", header: "Curso" },
    { key: "ayudante", header: "Ayudante" },
    { key: "horario", header: "Horario" },
    { key: "cupos", header: "Cupos" },
    {
        key: "accion",
        header: "",
        render: (a) =>
            a.cupos > 0 ? (
                <button className="rounded-md bg-[#4A2775] px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-[#4A2775]/20 transition-colors hover:bg-[#3a1e5e]">
                    Inscribirse
                </button>
            ) : (
                <span className="text-xs text-rose-600">Sin cupos</span>
            ),
    },
]

export default function EstudiantePage() {
    const [tab, setTab] = useState("solicitudes")
    const [mostrarModal, setMostrarModal] = useState(false)
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true)
    const [errorSolicitudes, setErrorSolicitudes] = useState("")

    async function cargarSolicitudes() {
        setLoadingSolicitudes(true)
        setErrorSolicitudes("")
        const res = await fetch("/api/solicitudes")
        const data = await res.json()

        if (!res.ok) {
            setErrorSolicitudes(data.error ?? "No se pudieron cargar tus solicitudes")
            setLoadingSolicitudes(false)
            return
        }

        setSolicitudes(data)
        setLoadingSolicitudes(false)
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarSolicitudes()
    }, [])

    function cerrarModal() {
        setMostrarModal(false)
        cargarSolicitudes()
    }

    return (
        <DashboardShell rol="ESTUDIANTE" tab={tab} onTabChange={setTab} title={tab}>
            {tab === "solicitudes" && (
                <section>
                    <SectionToolbar descripcion="Historial de tus solicitudes de impresión.">
                        <Button onClick={() => setMostrarModal(true)}>+ Nueva Solicitud</Button>
                    </SectionToolbar>
                    {errorSolicitudes && (
                        <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{errorSolicitudes}</p>
                    )}
                    {loadingSolicitudes ? (
                        <div className="flex items-center justify-center py-16 text-sm text-slate-500">
                            Cargando solicitudes...
                        </div>
                    ) : (
                        <DataTable columns={colsSolicitudes} data={solicitudes} />
                    )}
                </section>
            )}

            {tab === "ayudantias" && (
                <section>
                    <p className="mb-4 text-sm text-slate-500">
                        Ayudantías disponibles para inscripción.
                    </p>
                    <DataTable columns={colsAyudantias} data={ayudantias} />

                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                        <span className="text-lg">📌</span>
                        <p className="text-sm text-amber-700">
                            Puedes inscribirte en hasta 2 ayudantías por semestre.
                        </p>
                    </div>
                </section>
            )}

            {tab === "sala" && (
                <section>
                    <p className="mb-6 text-sm text-slate-500">
                        Reserva un bloque en la sala interactiva para trabajar en tus proyectos.
                    </p>
                    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(74,39,117,0.06)]">
                        <h3 className="mb-4 text-sm font-semibold text-slate-900">
                            Nueva reserva
                        </h3>
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <FormField label="Fecha" type="date" className="bg-white text-slate-900" />
                            <div className="grid grid-cols-2 gap-3">
                                <FormSelect label="Desde" className="text-slate-900">
                                    <option>09:00</option>
                                    <option>10:00</option>
                                    <option>11:00</option>
                                    <option>14:00</option>
                                </FormSelect>
                                <FormSelect label="Hasta" className="text-slate-900">
                                    <option>10:00</option>
                                    <option>11:00</option>
                                    <option>12:00</option>
                                    <option>15:00</option>
                                </FormSelect>
                            </div>
                            <Button type="submit" fullWidth>
                                Solicitar Reserva
                            </Button>
                        </form>
                    </div>
                </section>
            )}
            {mostrarModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <FormularioSolicitudEstudiante onCancelar={cerrarModal} />
            </div>
        )}
        </DashboardShell>
    )
}
