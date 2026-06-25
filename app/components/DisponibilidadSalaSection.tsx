"use client"

import { useEffect, useState } from "react"
import { useDisponibilidadSala } from "@/app/hooks/useDisponibilidadSala"
import { DataTable, type Column } from "./DataTable"
import { ActivoToggle } from "./ActivoToggle"
import { SectionToolbar } from "./SectionToolbar"
import { CalendarioMes } from "./CalendarioMes"
import { CalendarioSemana } from "./CalendarioSemana"
import { diaLabel, esDiaOperativo } from "@/lib/sala/diasSemana"
import type { Bloque, ReservaSala } from "@/app/hooks/useDisponibilidadSala"

const dias = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"]
const vistas = ["mes", "semana", "dia"] as const
type Vista = (typeof vistas)[number]
const vistaLabel: Record<Vista, string> = { mes: "Mes", semana: "Semana", dia: "Día" }

function formatHora(hora: string) {
    return hora.slice(0, 5)
}

function sumarDias(fecha: string, delta: number): string {
    const d = new Date(`${fecha}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() + delta)
    return d.toISOString().slice(0, 10)
}

export function DisponibilidadSalaSection() {
    const {
        bloques,
        reservas,
        cargando,
        error,
        cargar,
        toggleDisponible,
        bloquesGestion,
        cargandoGestion,
        errorGestion,
        cargarGestion,
        bloquearFecha,
        liberarReserva,
        bloquesSemana,
        cargandoSemana,
        errorSemana,
        cargarGestionSemana,
    } = useDisponibilidadSala()

    const [vista, setVista] = useState<Vista>("mes")
    const [fechaGestion, setFechaGestion] = useState("")
    const [diaCerrado, setDiaCerrado] = useState(false)

    useEffect(() => {
        cargar()
    }, [cargar])

    function handleFechaGestionChange(fecha: string) {
        setFechaGestion(fecha)
        setDiaCerrado(false)

        if (!fecha) return

        if (!esDiaOperativo(fecha)) {
            setDiaCerrado(true)
            return
        }

        cargarGestion(fecha)
    }

    function handleSeleccionarDiaDesdeMes(fecha: string) {
        setVista("dia")
        handleFechaGestionChange(fecha)
    }

    const colsReservas: Column<ReservaSala>[] = [
        { key: "fecha", header: "Fecha", render: (r) => `${r.fecha.slice(8, 10)}-${r.fecha.slice(5, 7)}-${r.fecha.slice(0, 4)}` },
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
            <SectionToolbar descripcion="Gestiona las reservas y la disponibilidad de la sala interactiva." />

            <div className="mb-4 flex gap-2">
                {vistas.map((v) => (
                    <button
                        key={v}
                        onClick={() => setVista(v)}
                        className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                            vista === v
                                ? "border-violet-300 bg-violet-50 text-violet-700"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        {vistaLabel[v]}
                    </button>
                ))}
            </div>

            {vista === "mes" && (
                <CalendarioMes reservas={reservas} onSeleccionarDia={handleSeleccionarDiaDesdeMes} />
            )}

            {vista === "semana" && (
                <CalendarioSemana
                    bloquesSemana={bloquesSemana}
                    cargando={cargandoSemana}
                    error={errorSemana}
                    onCargarSemana={cargarGestionSemana}
                    onBloquear={bloquearFecha}
                    onLiberar={liberarReserva}
                    fechaInicial={fechaGestion || undefined}
                />
            )}

            {vista === "dia" && (
                <div>
                    <div className="mb-4 flex items-end gap-2">
                        <div>
                            <label htmlFor="fechaGestion" className="mb-2 block text-xs font-medium text-slate-600">
                                Fecha a gestionar
                            </label>
                            <input
                                id="fechaGestion"
                                type="date"
                                value={fechaGestion}
                                onChange={(e) => handleFechaGestionChange(e.target.value)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                        </div>
                        <button
                            onClick={() => handleFechaGestionChange(sumarDias(fechaGestion || new Date().toISOString().slice(0, 10), -1))}
                            className="rounded-md border border-slate-200 px-2 py-2 text-xs hover:bg-slate-50"
                            aria-label="Día anterior"
                        >
                            ←
                        </button>
                        <button
                            onClick={() => handleFechaGestionChange(sumarDias(fechaGestion || new Date().toISOString().slice(0, 10), 1))}
                            className="rounded-md border border-slate-200 px-2 py-2 text-xs hover:bg-slate-50"
                            aria-label="Día siguiente"
                        >
                            →
                        </button>
                    </div>

                    {errorGestion && (
                        <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{errorGestion}</p>
                    )}

                    {fechaGestion && (
                        diaCerrado ? (
                            <p className="text-sm text-slate-500">La sala no opera ese día (solo de lunes a viernes).</p>
                        ) : cargandoGestion ? (
                            <div className="flex items-center justify-center py-8 text-sm text-slate-500">
                                Cargando bloques de la fecha...
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {bloquesGestion.length === 0 ? (
                                    <p className="text-sm text-slate-500">No hay bloques disponibles para ese día.</p>
                                ) : (
                                    bloquesGestion.map((b) => (
                                        <div
                                            key={b.id}
                                            className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${
                                                b.reservaId
                                                    ? "border-rose-200 bg-rose-50 text-rose-600"
                                                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                            }`}
                                        >
                                            <span>{formatHora(b.hora_inicio)}-{formatHora(b.hora_fin)}</span>
                                            <ActivoToggle
                                                activo={!!b.reservaId}
                                                labels={["Liberar", "Bloquear"]}
                                                onClick={() =>
                                                    b.reservaId
                                                        ? liberarReserva(b.reservaId, b.id)
                                                        : bloquearFecha(b.id, fechaGestion)
                                                }
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        )
                    )}
                </div>
            )}

            <div className="mt-8">
                <SectionToolbar descripcion="Horarios disponibles: habilita o deshabilita bloques de forma permanente, sin importar la fecha." />

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
            </div>

            <div className="mt-8">
                <SectionToolbar descripcion="Reservas realizadas por los solicitantes." />
                <DataTable columns={colsReservas} data={reservas} />
            </div>
        </section>
    )
}

export type { Bloque, ReservaSala }
