"use client"

import { useState } from "react"
import { StatusBadge } from "@/app/components/StatusBadge"
import { StatCard } from "@/app/components/StatCard"
import { DataTable, type Column } from "@/app/components/DataTable"
import { DashboardShell } from "@/app/components/DashboardShell"
import { EstudiantesSection } from "@/app/components/EstudiantesSection"
import { SectionToolbar } from "@/app/components/SectionToolbar"
import { FilterPill } from "@/app/components/FilterPill"
import { Button } from "@/app/components/Button"
import {
    aprobarSolicitud,
    puedeGestionarSolicitud,
    rechazarSolicitud,
    type EstadoSolicitudImpresion,
} from "@/lib/impresion/gestionarSolicitud"

interface Solicitud {
    id: string
    nombre: string
    solicitante: string
    tipo: string
    estado: EstadoSolicitudImpresion
    comentarioRetroalimentacion?: string | null
    fecha: string
    prioridad: string
}

interface Bloque {
    dia: string
    hora: string
    disponible: boolean
}

const horarios: Bloque[] = [
    { dia: "Lun", hora: "09:00-10:00", disponible: true },
    { dia: "Lun", hora: "10:00-11:00", disponible: false },
    { dia: "Lun", hora: "11:00-12:00", disponible: true },
    { dia: "Mar", hora: "09:00-10:00", disponible: true },
    { dia: "Mar", hora: "10:00-11:00", disponible: true },
    { dia: "Mar", hora: "11:00-12:00", disponible: false },
    { dia: "Mié", hora: "09:00-10:00", disponible: false },
    { dia: "Mié", hora: "10:00-11:00", disponible: true },
    { dia: "Mié", hora: "11:00-12:00", disponible: true },
    { dia: "Jue", hora: "09:00-10:00", disponible: true },
    { dia: "Jue", hora: "10:00-11:00", disponible: true },
    { dia: "Jue", hora: "11:00-12:00", disponible: true },
    { dia: "Vie", hora: "09:00-10:00", disponible: true },
    { dia: "Vie", hora: "10:00-11:00", disponible: false },
    { dia: "Vie", hora: "11:00-12:00", disponible: false },
]

interface RegistroFilamento {
    fecha: string
    solicitud: string
    material: string
    gramos: number
    usuario: string
}

const filamentos: RegistroFilamento[] = [
    { fecha: "2026-06-14", solicitud: "S-001", material: "PLA Negro", gramos: 45, usuario: "Lukas Avello" },
    { fecha: "2026-06-13", solicitud: "S-002", material: "PLA Blanco", gramos: 120, usuario: "Camila Rojas" },
    { fecha: "2026-06-12", solicitud: "S-003", material: "PETG Transparente", gramos: 78, usuario: "Lukas Avello" },
    { fecha: "2026-06-11", solicitud: "S-004", material: "PLA Rojo", gramos: 32, usuario: "Camila Rojas" },
]

const colsFilamento: Column<RegistroFilamento>[] = [
    { key: "fecha", header: "Fecha" },
    { key: "solicitud", header: "Solicitud" },
    { key: "material", header: "Material" },
    { key: "gramos", header: "Gramos" },
    { key: "usuario", header: "Registrado por" },
]

export default function AyudantePage() {
    const [tab, setTab] = useState("solicitudes")
    
    // CAMBIO: Manejo de filtros múltiples (estado y prioridad)
    const [filtros, setFiltros] = useState<{ estado: string | null; prioridad: string | null }>({
        estado: null,
        prioridad: null,
    })
    
    const [comentariosRechazo, setComentariosRechazo] = useState<Record<string, string>>({})
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([
        { id: "S-001", nombre: "Engranaje", solicitante: "Benjamín Silva", tipo: "Personal", estado: "PENDIENTE", fecha: "2026-06-14", prioridad: "Alta" },
        { id: "S-002", nombre: "Soporte Monitor", solicitante: "Ana Torres", tipo: "Curso", estado: "APROBADA", fecha: "2026-06-13", prioridad: "Media" },
        { id: "S-003", nombre: "Carcasa Arduino", solicitante: "Pedro Soto", tipo: "Personal", estado: "EN_PROGRESO", fecha: "2026-06-12", prioridad: "Alta" },
        { id: "S-004", nombre: "Clip Sujeción", solicitante: "María García", tipo: "Curso", estado: "RECHAZADA", comentarioRetroalimentacion: "La pieza no cumple con las medidas de seguridad requeridas.", fecha: "2026-06-11", prioridad: "Baja" },
        { id: "S-005", nombre: "Soporte Teléfono", solicitante: "Camila Rojas", tipo: "Personal", estado: "PENDIENTE", fecha: "2026-06-10", prioridad: "Media" },
        { id: "S-006", nombre: "Base Laptop", solicitante: "Lukas Avello", tipo: "Curso", estado: "PENDIENTE", fecha: "2026-06-09", prioridad: "Alta" },
    ])

    const colsSolicitudes: Column<Solicitud>[] = [
        { key: "id", header: "ID" },
        { key: "nombre", header: "Nombre" },
        { key: "solicitante", header: "Solicitante" },
        { key: "tipo", header: "Tipo" },
        { key: "prioridad", header: "Prioridad" },
        {
            key: "estado",
            header: "Estado",
            render: (s) => <StatusBadge status={s.estado} />,
        },
        { key: "fecha", header: "Fecha" },
        {
            key: "acciones",
            header: "",
            render: (s) =>
                puedeGestionarSolicitud(s.estado) ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setSolicitudes((actuales) =>
                                        actuales.map((solicitud) =>
                                            solicitud.id === s.id
                                                ? { ...solicitud, estado: aprobarSolicitud(solicitud.estado) }
                                                : solicitud,
                                        ),
                                    )
                                }}
                                className="rounded-md border border-emerald-200 px-2.5 py-1 text-xs text-emerald-700 transition-colors hover:bg-emerald-50"
                            >
                                Aprobar
                            </button>
                            <button
                                onClick={() => {
                                    const comentario = comentariosRechazo[s.id] ?? ""

                                    if (!comentario.trim()) {
                                        alert("Debe ingresar una retroalimentación para rechazar la solicitud")
                                        return
                                    }

                                    const resultado = rechazarSolicitud(s.estado, comentario)

                                    setSolicitudes((actuales) =>
                                        actuales.map((solicitud) =>
                                            solicitud.id === s.id
                                                ? {
                                                      ...solicitud,
                                                      estado: resultado.estado,
                                                      comentarioRetroalimentacion: resultado.comentarioRetroalimentacion,
                                                  }
                                                : solicitud,
                                        ),
                                    )

                                    setComentariosRechazo((actuales) => {
                                        const resto = { ...actuales }
                                        delete resto[s.id]
                                        return resto
                                    })
                                }}
                                className="rounded-md border border-rose-200 px-2.5 py-1 text-xs text-rose-600 transition-colors hover:bg-rose-50"
                            >
                                Rechazar
                            </button>
                        </div>
                        <textarea
                            value={comentariosRechazo[s.id] ?? ""}
                            onChange={(event) =>
                                setComentariosRechazo((actuales) => ({
                                    ...actuales,
                                    [s.id]: event.target.value,
                                }))
                            }
                            placeholder="Retroalimentación para rechazar"
                            rows={2}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 outline-none transition-colors placeholder:text-slate-400 focus:border-[#BC367B]/40 focus:ring-2 focus:ring-[#BC367B]/10"
                        />
                    </div>
                ) : (
                    <div className="space-y-1 text-xs text-slate-400">
                        <span>—</span>
                        {s.comentarioRetroalimentacion ? (
                            <p className="max-w-xs rounded-lg bg-rose-50 px-3 py-2 text-rose-700">
                                {s.comentarioRetroalimentacion}
                            </p>
                        ) : null}
                    </div>
                ),
        },
    ]

    
    const visibles = solicitudes.filter((s) => {
        const coincideEstado = filtros.estado ? s.estado === filtros.estado : true
        const coincidePrioridad = filtros.prioridad ? s.prioridad === filtros.prioridad : true
        return coincideEstado && coincidePrioridad
    })

    return (
        <DashboardShell rol="AYUDANTE" tab={tab} onTabChange={setTab} title={tab}>
            {tab === "solicitudes" && (
                <section>
                    <div className="mb-6 grid grid-cols-4 gap-4">
                        <StatCard label="Pendientes" value="3" accent="pink" />
                        <StatCard label="En progreso" value="1" accent="blue" />
                        <StatCard label="Aprobadas hoy" value="2" accent="purple" />
                        <StatCard label="Por revisar" value="4" accent="pink" />
                    </div>
                    
                   
                    <SectionToolbar
                        descripcion={(filtros.estado || filtros.prioridad) ? "Resultados filtrados" : "Todas las solicitudes de impresión."}
                    >
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2 items-center">
                                <span className="text-xs font-medium text-slate-500 w-16">Estado:</span>
                                <FilterPill label="Todos" accent="pink" active={!filtros.estado} onClick={() => setFiltros({...filtros, estado: null})} />
                                {["PENDIENTE", "APROBADA", "RECHAZADA", "EN_PROGRESO"].map((e) => (
                                    <FilterPill
                                        key={e}
                                        label={e.replace("_", " ")}
                                        accent="pink"
                                        active={filtros.estado === e}
                                        onClick={() => setFiltros({...filtros, estado: e})}
                                    />
                                ))}
                            </div>
                            
                            <div className="flex gap-2 items-center">
                                <span className="text-xs font-medium text-slate-500 w-16">Prioridad:</span>
                                <FilterPill label="Todas" accent="blue" active={!filtros.prioridad} onClick={() => setFiltros({...filtros, prioridad: null})} />
                                {["Alta", "Media", "Baja"].map((p) => (
                                    <FilterPill
                                        key={p}
                                        label={p}
                                        accent="blue"
                                        active={filtros.prioridad === p}
                                        onClick={() => setFiltros({...filtros, prioridad: p})}
                                    />
                                ))}
                            </div>
                        </div>
                    </SectionToolbar>
                    
                    <DataTable columns={colsSolicitudes} data={visibles} />
                </section>
            )}

            {tab === "estudiantes" && (
                <EstudiantesSection
                    accent="pink"
                    descripcion="Estudiantes registrados en el sistema."
                    botonLabel="+ Nuevo Estudiante"
                    modalTitle="Inscribir nuevo estudiante"
                />
            )}

            {tab === "sala" && (
                <section>
                    <p className="mb-6 text-sm text-slate-500">Disponibilidad de la sala para la semana.</p>
                    <div className="grid grid-cols-5 gap-3">
                        {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].map((dia, di) => (
                            <div key={dia} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(74,39,117,0.05)]">
                                <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                                    {dia}
                                </p>
                                <div className="space-y-2">
                                    {horarios
                                        .filter((b) => b.dia === ["Lun", "Mar", "Mié", "Jue", "Vie"][di])
                                        .map((b, i) => (
                                            <div
                                                key={i}
                                                className={`rounded-lg border px-3 py-2 text-center text-xs ${
                                                    b.disponible
                                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                        : "border-rose-200 bg-rose-50 text-rose-600"
                                                }`}
                                            >
                                                {b.hora}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {tab === "filamento" && (
                <section>
                    <div className="mb-6 grid grid-cols-3 gap-4">
                        <StatCard label="Filamento usado hoy" value="165g" accent="pink" />
                        <StatCard label="Filamento usado esta semana" value="720g" accent="purple" />
                        <StatCard label="Rollos activos" value="6" accent="blue" />
                    </div>
                    <SectionToolbar descripcion="Registro de uso de filamento.">
                        <Button accent="pink">+ Registrar Uso</Button>
                    </SectionToolbar>
                    <DataTable columns={colsFilamento} data={filamentos} />
                </section>
            )}
        </DashboardShell>
    )
}