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
            <button className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-500 transition-colors hover:border-[#6B3FA0]/40 hover:text-[#6B3FA0]">
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
                <button className="rounded-md bg-[#6B3FA0] px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-[#6B3FA0]/20 transition-colors hover:bg-[#5a3488]">
                    Inscribirse
                </button>
            ) : (
                <span className="text-xs text-rose-600">Sin cupos</span>
            ),
    },
]

export default function EstudiantePage() {
    const [tab, setTab] = useState("solicitudes")

    return (
        <div className="flex w-full">
            <Sidebar rol="ESTUDIANTE" activeTab={tab} onTabChange={setTab} />

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
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-slate-500">Historial de tus solicitudes de impresión.</p>
                                <button className="rounded-lg bg-[#6B3FA0] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#6B3FA0]/20 transition-colors hover:bg-[#5a3488]">
                                    + Nueva Solicitud
                                </button>
                            </div>
                            <DataTable columns={colsSolicitudes} data={solicitudes} />
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
                            <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(107,63,160,0.06)]">
                                <h3 className="mb-4 text-sm font-semibold text-slate-900">
                                    Nueva reserva
                                </h3>
                                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                            Fecha
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#6B3FA0] focus:ring-4 focus:ring-[#6B3FA0]/15"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                                Desde
                                            </label>
                                            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#6B3FA0] focus:ring-4 focus:ring-[#6B3FA0]/15">
                                                <option>09:00</option>
                                                <option>10:00</option>
                                                <option>11:00</option>
                                                <option>14:00</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                                Hasta
                                            </label>
                                            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#6B3FA0] focus:ring-4 focus:ring-[#6B3FA0]/15">
                                                <option>10:00</option>
                                                <option>11:00</option>
                                                <option>12:00</option>
                                                <option>15:00</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full rounded-lg bg-[#6B3FA0] py-2.5 text-sm font-medium text-white shadow-sm shadow-[#6B3FA0]/20 transition-colors hover:bg-[#5a3488]"
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
