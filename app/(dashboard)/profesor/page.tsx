"use client"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/app/components/DashboardShell"
import { EstudiantesSection } from "@/app/components/EstudiantesSection"
import { GruposPorCursoSection } from "@/app/components/GruposPorCursoSection"
import { StatusBadge } from "@/app/components/StatusBadge"
import { DataTable, type Column } from "@/app/components/DataTable"
import type { Curso } from "@/app/hooks/useCursos"

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
        </DashboardShell>
    )
}
