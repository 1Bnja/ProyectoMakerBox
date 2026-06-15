"use client"

import { useState } from "react"
import { Sidebar } from "@/app/components/Sidebar"
import { StatusBadge } from "@/app/components/StatusBadge"
import { DataTable, type Column } from "@/app/components/DataTable"

interface Solicitud {
    id: string
    nombre: string
    estado: string
    fecha: string
    tipo: string
}

interface Ayudantia {
    curso: string
    ayudante: string
    horario: string
    cupos: number
}

const solicitudes: Solicitud[] = [
    { id: "S-001", nombre: "Engranaje", estado: "PENDIENTE", fecha: "2026-06-14", tipo: "Curso" },
    { id: "S-005", nombre: "Soporte Teléfono", estado: "APROBADA", fecha: "2026-06-10", tipo: "Personal" },
    { id: "S-007", nombre: "Caja Proyecto", estado: "IMPRESA", fecha: "2026-06-05", tipo: "Curso" },
]

const ayudantias: Ayudantia[] = [
    { curso: "Diseño 3D Avanzado", ayudante: "Lukas Avello", horario: "Lun 14:30-16:00", cupos: 5 },
    { curso: "Prototipado Rápido", ayudante: "Camila Rojas", horario: "Mié 10:00-11:30", cupos: 2 },
    { curso: "Introducción Impresión 3D", ayudante: "Lukas Avello", horario: "Vie 15:00-16:30", cupos: 8 },
]

const colsSolicitudes: Column<Solicitud>[] = [
    { key: "id", header: "ID" },
    { key: "nombre", header: "Nombre" },
    { key: "tipo", header: "Tipo" },
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
                <button className="rounded-md bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20">
                    Inscribirse
                </button>
            ) : (
                <span className="text-xs text-red-400">Sin cupos</span>
            ),
    },
]

export default function EstudiantePage() {
    const [tab, setTab] = useState("solicitudes")

    return (
        <div className="flex w-full">
            <Sidebar rol="ESTUDIANTE" activeTab={tab} onTabChange={setTab} />

            <main className="flex-1 overflow-auto">
                <header className="flex items-center justify-between border-b border-[#1e2235] px-8 py-5">
                    <h1 className="text-lg font-semibold text-[#e2e8f0] capitalize">{tab}</h1>
                    <div className="flex items-center gap-3 text-sm text-[#64748b]">
                        <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            Conectado
                        </span>
                    </div>
                </header>

                <div className="p-8">
                    {tab === "solicitudes" && (
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-[#64748b]">Historial de tus solicitudes de impresión.</p>
                                <button className="rounded-lg bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20">
                                    + Nueva Solicitud
                                </button>
                            </div>
                            <DataTable columns={colsSolicitudes} data={solicitudes} />
                        </section>
                    )}

                    {tab === "ayudantias" && (
                        <section>
                            <p className="mb-4 text-sm text-[#64748b]">
                                Ayudantías disponibles para inscripción.
                            </p>
                            <DataTable columns={colsAyudantias} data={ayudantias} />

                            <div className="mt-6 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
                                <span className="text-lg">📌</span>
                                <p className="text-sm text-amber-400">
                                    Puedes inscribirte en hasta 2 ayudantías por semestre.
                                </p>
                            </div>
                        </section>
                    )}

                    {tab === "sala" && (
                        <section>
                            <p className="mb-6 text-sm text-[#64748b]">
                                Reserva un bloque en la sala interactiva para trabajar en tus proyectos.
                            </p>
                            <div className="mx-auto max-w-lg rounded-xl border border-[#1e2235] bg-[#151821] p-6">
                                <h3 className="mb-4 text-sm font-semibold text-[#e2e8f0]">
                                    Nueva reserva
                                </h3>
                                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
                                            Fecha
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full rounded-lg border border-[#1e2235] bg-[#0f1119] px-3 py-2 text-sm text-[#e2e8f0] outline-none focus:border-cyan-500/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
                                                Desde
                                            </label>
                                            <select className="w-full rounded-lg border border-[#1e2235] bg-[#0f1119] px-3 py-2 text-sm text-[#e2e8f0] outline-none focus:border-cyan-500/50">
                                                <option>09:00</option>
                                                <option>10:00</option>
                                                <option>11:00</option>
                                                <option>14:00</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
                                                Hasta
                                            </label>
                                            <select className="w-full rounded-lg border border-[#1e2235] bg-[#0f1119] px-3 py-2 text-sm text-[#e2e8f0] outline-none focus:border-cyan-500/50">
                                                <option>10:00</option>
                                                <option>11:00</option>
                                                <option>12:00</option>
                                                <option>15:00</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full rounded-lg bg-cyan-500/10 py-2.5 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20"
                                    >
                                        Solicitar Reserva
                                    </button>
                                </form>
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    )
}
