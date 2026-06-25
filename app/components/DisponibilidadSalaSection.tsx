"use client"

import { useEffect } from "react"
import { useDisponibilidadSala } from "@/app/hooks/useDisponibilidadSala"
import { DataTable, type Column } from "./DataTable"
import { ActivoToggle } from "./ActivoToggle"
import { SectionToolbar } from "./SectionToolbar"
import type { Bloque, ReservaSala } from "@/app/hooks/useDisponibilidadSala"

const dias = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"]
/* eslint-disable @typescript-eslint/naming-convention */
const diaLabel: Record<string, string> = {
    LUNES: "Lunes",
    MARTES: "Martes",
    MIERCOLES: "Miércoles",
    JUEVES: "Jueves",
    VIERNES: "Viernes",
}
/* eslint-enable @typescript-eslint/naming-convention */

function formatHora(hora: string) {
    return hora.slice(0, 5)
}

export function DisponibilidadSalaSection() {
    const { bloques, reservas, cargando, error, cargar, toggleDisponible } = useDisponibilidadSala()

    useEffect(() => {
        cargar()
    }, [cargar])

    const colsReservas: Column<ReservaSala>[] = [
        { key: "fecha", header: "Fecha", render: (r) => new Date(`${r.fecha}T00:00:00Z`).toLocaleDateString("es-CL") },
        {
            key: "bloque",
            header: "Bloque",
            render: (r) =>
                r.bloque ? `${diaLabel[r.bloque.dia] ?? r.bloque.dia} ${formatHora(r.bloque.hora_inicio)}-${formatHora(r.bloque.hora_fin)}` : "—",
        },
        {
            key: "solicitante",
            header: "Solicitante",
            render: (r) => (r.solicitante ? `${r.solicitante.nombre} ${r.solicitante.apellido}` : "—"),
        },
        { key: "actividad", header: "Actividad", render: (r) => r.actividad ?? "—" },
    ]

    return (
        <section>
            <SectionToolbar descripcion="Disponibilidad de la sala interactiva para la semana." />

            {error && (
                <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
            )}

            {cargando && bloques.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-sm text-slate-500">
                    Cargando disponibilidad...
                </div>
            ) : (
                <div className="grid grid-cols-5 gap-3">
                    {dias.map((dia) => (
                        <div key={dia} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(74,39,117,0.05)]">
                            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                                {diaLabel[dia]}
                            </p>
                            <div className="space-y-2">
                                {bloques
                                    .filter((b) => b.dia === dia)
                                    .map((b) => (
                                        <div
                                            key={b.id}
                                            className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${
                                                b.disponible
                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                    : "border-rose-200 bg-rose-50 text-rose-600"
                                            }`}
                                        >
                                            <span>{formatHora(b.hora_inicio)}-{formatHora(b.hora_fin)}</span>
                                            <ActivoToggle
                                                activo={b.disponible}
                                                labels={["Deshabilitar", "Habilitar"]}
                                                onClick={() => toggleDisponible(b)}
                                            />
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8">
                <SectionToolbar descripcion="Reservas realizadas por los solicitantes." />
                <DataTable columns={colsReservas} data={reservas} />
            </div>
        </section>
    )
}

export type { Bloque, ReservaSala }
