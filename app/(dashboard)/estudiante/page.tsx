"use client"

import { useState } from "react"
import { StatusBadge } from "@/app/components/StatusBadge"
import { DataTable, type Column } from "@/app/components/DataTable"
import { DashboardShell } from "@/app/components/DashboardShell"
import { SectionToolbar } from "@/app/components/SectionToolbar"
import { Button } from "@/app/components/Button"
import { FormField, FormSelect } from "@/app/components/FormField"

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
        render: () => <Button variant="outline">Ver detalle</Button>,
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

    return (
        <DashboardShell rol="ESTUDIANTE" tab={tab} onTabChange={setTab} title={tab}>
            {tab === "solicitudes" && (
                <section>
                    <SectionToolbar descripcion="Historial de tus solicitudes de impresión.">
                        <Button>+ Nueva Solicitud</Button>
                    </SectionToolbar>
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
        </DashboardShell>
    )
}
