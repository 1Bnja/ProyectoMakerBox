"use client"

import { useEffect, useState } from "react"
import { StatusBadge } from "@/app/components/StatusBadge"
import { StatCard } from "@/app/components/StatCard"
import { DataTable, type Column } from "@/app/components/DataTable"
import { DashboardShell } from "@/app/components/DashboardShell"
import { EstudiantesSection } from "@/app/components/EstudiantesSection"
import { CursosSection } from "@/app/components/CursosSection"
import { GruposPorCursoSection } from "@/app/components/GruposPorCursoSection"
import { AyudantiasSection } from "@/app/components/AyudantiasSection"
import { InventarioSection } from "@/app/components/InventarioSection"
import { DisponibilidadSalaSection } from "@/app/components/DisponibilidadSalaSection"
import { useCursos } from "@/app/hooks/useCursos"
import { SectionToolbar } from "@/app/components/SectionToolbar"
import { FilterPill } from "@/app/components/FilterPill"
import { SolicitudDetalleModal } from "@/app/components/SolicitudDetalleModal"
import { RegistroFilamentoSection } from "@/app/components/RegistroFilamentoSection"

interface Solicitud {
    id: string
    tipo: string
    estado: string
    comentario: string | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    motivo_rechazo: string | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    created_at: string
    solicitante: { nombre: string; apellido: string } | null
}

const estadosFiltrables = ["PENDIENTE", "APROBADA", "RECHAZADA", "EN_PROCESO", "FINALIZADA"]



export default function AyudantePage() {
    const [tab, setTab] = useState("solicitudes")
    const [filtroEstado, setFiltroEstado] = useState<string | null>(null)
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true)
    const [errorSolicitudes, setErrorSolicitudes] = useState("")
    const [detalleId, setDetalleId] = useState<string | null>(null)
    const { cursos } = useCursos()

    async function cargarSolicitudes(estado: string | null) {
        setLoadingSolicitudes(true)
        setErrorSolicitudes("")
        const url = estado ? `/api/solicitudes?estado=${estado}` : "/api/solicitudes"
        const res = await fetch(url)
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
        cargarSolicitudes(filtroEstado)
    }, [filtroEstado])

    const colsSolicitudes: Column<Solicitud>[] = [
        {
            key: "solicitante",
            header: "Solicitante",
            render: (s) => (s.solicitante ? `${s.solicitante.nombre} ${s.solicitante.apellido}` : "—"),
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
        {
            key: "acciones",
            header: "",
            render: (s) => (
                <button
                    onClick={() => setDetalleId(s.id)}
                    className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-50"
                >
                    Ver detalle
                </button>
            ),
        },
    ]

    return (
        <DashboardShell rol="AYUDANTE" tab={tab} onTabChange={setTab} title={tab}>
            {tab === "solicitudes" && (
                <section>
                    <div className="mb-6 grid grid-cols-4 gap-4">
                        <StatCard
                            label="Pendientes"
                            value={String(solicitudes.filter((s) => s.estado === "PENDIENTE").length)}
                            accent="pink"
                        />
                        <StatCard
                            label="En proceso"
                            value={String(solicitudes.filter((s) => s.estado === "EN_PROCESO").length)}
                            accent="blue"
                        />
                        <StatCard
                            label="Aprobadas"
                            value={String(solicitudes.filter((s) => s.estado === "APROBADA").length)}
                            accent="purple"
                        />
                        <StatCard
                            label="Rechazadas"
                            value={String(solicitudes.filter((s) => s.estado === "RECHAZADA").length)}
                            accent="pink"
                        />
                    </div>

                    <SectionToolbar descripcion={filtroEstado ? "Resultados filtrados" : "Todas las solicitudes de impresión."}>
                        <div className="flex gap-2 items-center">
                            <span className="text-xs font-medium text-slate-500 w-16">Estado:</span>
                            <FilterPill label="Todos" accent="pink" active={!filtroEstado} onClick={() => setFiltroEstado(null)} />
                            {estadosFiltrables.map((e) => (
                                <FilterPill
                                    key={e}
                                    label={e.replace("_", " ")}
                                    accent="pink"
                                    active={filtroEstado === e}
                                    onClick={() => setFiltroEstado(e)}
                                />
                            ))}
                        </div>
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

                    {detalleId && (
                        <SolicitudDetalleModal
                            id={detalleId}
                            onClose={() => setDetalleId(null)}
                            onCambioEstado={() => cargarSolicitudes(filtroEstado)}
                        />
                    )}
                </section>
            )}

            {tab === "cursos" && <CursosSection />}

            {tab === "estudiantes" && (
                <EstudiantesSection
                    accent="pink"
                    descripcion="Estudiantes registrados en el sistema."
                    botonLabel="+ Nuevo Estudiante"
                    modalTitle="Inscribir nuevo estudiante"
                />
            )}

            {tab === "grupos" && <GruposPorCursoSection accent="pink" cursos={cursos} />}

            {tab === "ayudantias" && <AyudantiasSection cursos={cursos} />}

            {tab === "inventario" && <InventarioSection />}

            {tab === "sala" && <DisponibilidadSalaSection />}

            {tab === "filamento" && <RegistroFilamentoSection />}
        </DashboardShell>
    )
}