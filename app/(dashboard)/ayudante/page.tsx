"use client"

import { useState } from "react"
import { Sidebar } from "@/app/components/Sidebar"
import { StatusBadge } from "@/app/components/StatusBadge"
import { StatCard } from "@/app/components/StatCard"
import { DataTable, type Column } from "@/app/components/DataTable"
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
    const [filtro, setFiltro] = useState<string | null>(null)
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
                                        const { [s.id]: _, ...resto } = actuales
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
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 outline-none transition-colors placeholder:text-slate-400 focus:border-[#E94E77]/40 focus:ring-2 focus:ring-[#E94E77]/10"
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

    const visibles = filtro
        ? solicitudes.filter((s) => s.estado === filtro)
        : solicitudes

    return (
        <div className="flex w-full">
            <Sidebar rol="AYUDANTE" activeTab={tab} onTabChange={setTab} />

            <main className="flex-1 overflow-auto">
                <header className="flex items-center justify-between border-b border-slate-200 bg-white/70 px-8 py-5 backdrop-blur-sm">
                    <h1 className="text-lg font-semibold text-slate-900 capitalize">{tab}</h1>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Conectado
                        </span>
                    </div>
                </header>

                <div className="p-8">
                    {tab === "solicitudes" && (
                        <section>
                            <div className="mb-6 grid grid-cols-4 gap-4">
                                <StatCard label="Pendientes" value="3" accent="pink" />
                                <StatCard label="En progreso" value="1" accent="blue" />
                                <StatCard label="Aprobadas hoy" value="2" accent="purple" />
                                <StatCard label="Por revisar" value="4" accent="pink" />
                            </div>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-slate-500">
                                    {filtro ? `Filtrado por: ${filtro}` : "Todas las solicitudes de impresión."}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFiltro(null)}
                                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                            !filtro
                                                ? "border-[#E94E77]/30 bg-[#E94E77]/10 text-[#E94E77]"
                                                : "border-slate-200 bg-white text-slate-500 hover:border-[#E94E77]/40 hover:text-[#E94E77]"
                                        }`}
                                    >
                                        Todas
                                    </button>
                                    {["PENDIENTE", "APROBADA", "RECHAZADA", "EN_PROGRESO"].map((e) => (
                                        <button
                                            key={e}
                                            onClick={() => setFiltro(e)}
                                            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                                filtro === e
                                                    ? "border-[#E94E77]/30 bg-[#E94E77]/10 text-[#E94E77]"
                                                    : "border-slate-200 bg-white text-slate-500 hover:border-[#E94E77]/40 hover:text-[#E94E77]"
                                            }`}
                                        >
                                            {e.replace("_", " ")}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <DataTable columns={colsSolicitudes} data={visibles} />
                        </section>
                    )}

                    {tab === "sala" && (
                        <section>
                            <p className="mb-6 text-sm text-slate-500">Disponibilidad de la sala para la semana.</p>
                            <div className="grid grid-cols-5 gap-3">
                                {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].map((dia, di) => (
                                    <div key={dia} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(107,63,160,0.05)]">
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
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-slate-500">Registro de uso de filamento.</p>
                                <button className="rounded-lg bg-[#E94E77] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#E94E77]/25 transition-colors hover:bg-[#d83d66]">
                                    + Registrar Uso
                                </button>
                            </div>
                            <DataTable columns={colsFilamento} data={filamentos} />
                        </section>
                    )}
                </div>
            </main>
        </div>
    )
}
