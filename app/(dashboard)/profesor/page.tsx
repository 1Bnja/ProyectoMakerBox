"use client"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/app/components/DashboardShell"
import { EstudiantesSection } from "@/app/components/EstudiantesSection"
import { GruposPorCursoSection } from "@/app/components/GruposPorCursoSection"
import { StatusBadge } from "@/app/components/StatusBadge"
import { DataTable, type Column } from "@/app/components/DataTable"
import { FormField, FormSelect } from "@/app/components/FormField"
import { Button } from "@/app/components/Button"
import type { Curso } from "@/app/hooks/useCursos"

interface SalaDisp {
    dia: string
    hora: string
    disponible: boolean
}

const horarios: SalaDisp[] = [
    { dia: "Lunes", hora: "09:00-10:00", disponible: true },
    { dia: "Lunes", hora: "10:00-11:00", disponible: false },
    { dia: "Lunes", hora: "11:00-12:00", disponible: true },
    { dia: "Martes", hora: "09:00-10:00", disponible: true },
    { dia: "Martes", hora: "10:00-11:00", disponible: true },
    { dia: "Martes", hora: "11:00-12:00", disponible: false },
]

const columnasCursos: Column<Curso>[] = [
    { key: "nombre", header: "Curso" },
    {
        key: "sigla",
        header: "Sigla",
        render: (c) => c.sigla ?? "—",
    },
    { key: "estudiantes", header: "Estudiantes" },
    {
        key: "estado",
        header: "Estado",
        render: (c) => <StatusBadge status={c.activo ? "Activo" : "Inactivo"} />,
    },
]

interface Solicitud {
    id: string
    tipo: string
    estado: string
    comentario: string | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    created_at: string
    solicitante: { nombre: string; apellido: string } | null
}

const columnasSolicitudes: Column<Solicitud>[] = [
    {
        key: "solicitante",
        header: "Estudiante",
        render: (s) => (s.solicitante ? `${s.solicitante.nombre} ${s.solicitante.apellido}` : "—"),
    },
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

export default function ProfesorPage() {
    const [tab, setTab] = useState("cursos")

    const [cursos, setCursos] = useState<Curso[]>([])
    const [loadingCursos, setLoadingCursos] = useState(true)

    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true)
    const [errorSolicitudes, setErrorSolicitudes] = useState("")

    async function cargarCursos() {
        const res = await fetch("/api/cursos")
        if (res.ok) {
            const data = await res.json()
            setCursos(data)
        }
        setLoadingCursos(false)
    }

    async function cargarSolicitudes() {
        setLoadingSolicitudes(true)
        setErrorSolicitudes("")
        const res = await fetch("/api/solicitudes")
        const data = await res.json()

        if (!res.ok) {
            setErrorSolicitudes(data.error ?? "No se pudieron cargar las solicitudes")
            setLoadingSolicitudes(false)
            return
        }

        setSolicitudes(data)
        setLoadingSolicitudes(false)
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarCursos()
        cargarSolicitudes()
    }, [])

    return (
        <DashboardShell rol="PROFESOR" tab={tab} onTabChange={setTab} title={tab}>
            {tab === "cursos" && (
                <section>
                    <p className="mb-6 text-sm text-slate-500">Cursos donde estás asignado como profesor.</p>
                    {loadingCursos ? (
                        <div className="flex items-center justify-center py-16 text-sm text-slate-500">
                            Cargando cursos...
                        </div>
                    ) : (
                        <DataTable columns={columnasCursos} data={cursos} />
                    )}
                </section>
            )}

            {tab === "estudiantes" && (
                <EstudiantesSection
                    accent="blue"
                    descripcion="Estudiantes de los cursos donde eres profesor."
                    botonLabel=""
                    modalTitle=""
                    soloLectura
                />
            )}

            {tab === "grupos" && <GruposPorCursoSection accent="blue" cursos={cursos} />}

            {tab === "solicitudes" && (
                <section>
                    <p className="mb-6 text-sm text-slate-500">
                        Solicitudes de impresión de los estudiantes de tus cursos.
                    </p>
                    {errorSolicitudes && (
                        <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{errorSolicitudes}</p>
                    )}
                    {loadingSolicitudes ? (
                        <div className="flex items-center justify-center py-16 text-sm text-slate-500">
                            Cargando solicitudes...
                        </div>
                    ) : (
                        <DataTable columns={columnasSolicitudes} data={solicitudes} />
                    )}
                </section>
            )}

            {tab === "sala" && (
                <section>
                    <p className="mb-6 text-sm text-slate-500">
                        Reserva la sala interactiva para tus actividades.
                    </p>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(80,212,242,0.06)]">
                            <h3 className="mb-4 text-sm font-semibold text-slate-900">
                                Nueva reserva
                            </h3>
                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <FormField label="Fecha" accent="blue" type="date" className="bg-white text-slate-900" />
                                <div className="grid grid-cols-2 gap-3">
                                    <FormSelect label="Desde" accent="blue" className="text-slate-900">
                                        <option>09:00</option>
                                        <option>10:00</option>
                                        <option>11:00</option>
                                        <option>14:00</option>
                                        <option>15:00</option>
                                    </FormSelect>
                                    <FormSelect label="Hasta" accent="blue" className="text-slate-900">
                                        <option>10:00</option>
                                        <option>11:00</option>
                                        <option>12:00</option>
                                        <option>15:00</option>
                                        <option>16:00</option>
                                    </FormSelect>
                                </div>
                                <FormField
                                    label="Curso / Actividad"
                                    accent="blue"
                                    type="text"
                                    placeholder="Ej: Ayudantía Diseño 3D"
                                    className="bg-white text-slate-900 placeholder:text-slate-400"
                                />
                                <Button type="submit" accent="blue" fullWidth>
                                    Solicitar Reserva
                                </Button>
                            </form>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(80,212,242,0.06)]">
                            <h3 className="mb-4 text-sm font-semibold text-slate-900">
                                Disponibilidad hoy
                            </h3>
                            <div className="space-y-2">
                                {horarios.map((b, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                                            b.disponible
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                : "border-rose-200 bg-rose-50 text-rose-600"
                                        }`}
                                    >
                                        <span className="text-sm">{b.hora}</span>
                                        <span className="text-xs font-medium">
                                            {b.disponible ? "Disponible" : "Ocupado"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </DashboardShell>
    )
}
