"use client"

import { useEffect, useState } from "react"
import { StatusBadge } from "@/app/components/StatusBadge"
import { DataTable, type Column } from "@/app/components/DataTable"
import { DashboardShell } from "@/app/components/DashboardShell"
import { SectionToolbar } from "@/app/components/SectionToolbar"
import { Button } from "@/app/components/Button"
import { useAyudantias, type Ayudantia } from "@/app/hooks/useAyudantias"
import { diaLabel } from "@/lib/sala/diasSemana"
import FormularioSolicitudEstudiante from './FormularioSolicitud'

interface Solicitud {
    id: string
    tipo: string
    estado: string
    comentario: string | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    created_at: string
}

function formatHora(hora: string) {
    return hora.slice(0, 5)
}

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

export default function EstudiantePage() {
    const [tab, setTab] = useState("solicitudes")
    const [mostrarModal, setMostrarModal] = useState(false)
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true)
    const [errorSolicitudes, setErrorSolicitudes] = useState("")
    const { ayudantias, loading: loadingAyudantias, error: errorAyudantias, inscribirse, desinscribirse } = useAyudantias()
    const [errorInscripcion, setErrorInscripcion] = useState("")

    async function handleInscribirse(id: string) {
        setErrorInscripcion("")
        const resultado = await inscribirse(id)
        if (resultado.error) setErrorInscripcion(resultado.error)
    }

    const colsAyudantias: Column<Ayudantia>[] = [
        { key: "curso", header: "Curso", render: (a) => a.curso?.nombre ?? "—" },
        {
            key: "ayudante",
            header: "Ayudante",
            render: (a) => (a.ayudante ? `${a.ayudante.nombre} ${a.ayudante.apellido}` : "—"),
        },
        {
            key: "horario",
            header: "Horario",
            render: (a) => `${diaLabel[a.dia] ?? a.dia} ${formatHora(a.hora_inicio)}-${formatHora(a.hora_fin)}`,
        },
        { key: "cupos", header: "Cupos", render: (a) => `${a.inscritos}/${a.cupos}` },
        {
            key: "accion",
            header: "",
            render: (a) =>
                a.inscrito ? (
                    <button
                        onClick={() => desinscribirse(a.id)}
                        className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                    >
                        Desinscribirse
                    </button>
                ) : a.inscritos >= a.cupos ? (
                    <span className="text-xs text-rose-600">Sin cupos</span>
                ) : (
                    <button
                        onClick={() => handleInscribirse(a.id)}
                        className="rounded-md bg-[#4A2775] px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-[#4A2775]/20 transition-colors hover:bg-[#3a1e5e]"
                    >
                        Inscribirse
                    </button>
                ),
        },
    ]

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

                    {errorAyudantias && (
                        <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{errorAyudantias}</p>
                    )}
                    {errorInscripcion && (
                        <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{errorInscripcion}</p>
                    )}

                    {loadingAyudantias ? (
                        <div className="flex items-center justify-center py-16 text-sm text-slate-500">
                            Cargando ayudantías...
                        </div>
                    ) : (
                        <DataTable columns={colsAyudantias} data={ayudantias.filter((a) => a.activo)} />
                    )}

                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                        <span className="text-lg">📌</span>
                        <p className="text-sm text-amber-700">
                            Puedes inscribirte en hasta 2 ayudantías por semestre.
                        </p>
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
