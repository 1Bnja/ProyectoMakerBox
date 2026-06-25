"use client"

import { useEffect, useState } from "react"
import { diaLabel, obtenerDiaDeFecha } from "@/lib/sala/diasSemana"
import { ActivoToggle } from "./ActivoToggle"
import type { BloqueGestion } from "@/app/hooks/useDisponibilidadSala"

function formatHora(hora: string) {
    return hora.slice(0, 5)
}

function obtenerLunes(fecha: Date): Date {
    const lunes = new Date(fecha)
    const offset = (lunes.getUTCDay() + 6) % 7
    lunes.setUTCDate(lunes.getUTCDate() - offset)
    return lunes
}

function obtenerFechasSemana(lunes: Date): string[] {
    return Array.from({ length: 5 }, (_, i) => {
        const d = new Date(lunes)
        d.setUTCDate(d.getUTCDate() + i)
        return d.toISOString().slice(0, 10)
    })
}

interface CalendarioSemanaProps {
    bloquesSemana: Record<string, BloqueGestion[]>
    cargando: boolean
    error: string | null
    onCargarSemana: (fechas: string[]) => void
    onBloquear: (bloqueId: string, fecha: string) => void
    onLiberar: (reservaId: string, bloqueId: string) => void
    fechaInicial?: string
}

export function CalendarioSemana({
    bloquesSemana,
    cargando,
    error,
    onCargarSemana,
    onBloquear,
    onLiberar,
    fechaInicial,
}: CalendarioSemanaProps) {
    const [lunesActual, setLunesActual] = useState(() =>
        obtenerLunes(fechaInicial ? new Date(`${fechaInicial}T00:00:00Z`) : new Date())
    )

    const fechas = obtenerFechasSemana(lunesActual)

    useEffect(() => {
        onCargarSemana(fechas)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lunesActual.getTime()])

    function cambiarSemana(deltaDias: number) {
        const nuevo = new Date(lunesActual)
        nuevo.setUTCDate(nuevo.getUTCDate() + deltaDias)
        setLunesActual(nuevo)
    }

    return (
        <div>
            <div className="mb-3 flex items-center gap-2">
                <button
                    onClick={() => cambiarSemana(-7)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                    aria-label="Semana anterior"
                >
                    ←
                </button>
                <button
                    onClick={() => cambiarSemana(7)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                    aria-label="Semana siguiente"
                >
                    →
                </button>
                <p className="text-sm font-medium text-slate-700">
                    {fechas[0]} al {fechas[4]}
                </p>
            </div>

            {error && (
                <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
            )}

            {cargando ? (
                <div className="flex items-center justify-center py-8 text-sm text-slate-500">
                    Cargando semana...
                </div>
            ) : (
                <div className="grid grid-cols-5 gap-3">
                    {fechas.map((fecha) => {
                        const dia = obtenerDiaDeFecha(fecha)
                        const bloques = bloquesSemana[fecha] ?? []
                        return (
                            <div key={fecha} className="rounded-2xl border border-slate-200 bg-white p-3">
                                <p className="mb-2 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                                    {diaLabel[dia]} {fecha.slice(8, 10)}
                                </p>
                                <div className="space-y-2">
                                    {bloques.length === 0 ? (
                                        <p className="text-center text-xs text-slate-400">Sin bloques</p>
                                    ) : (
                                        bloques.map((b) => (
                                            <div
                                                key={b.id}
                                                className={`flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-xs ${
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
                                                            ? onLiberar(b.reservaId, b.id)
                                                            : onBloquear(b.id, fecha)
                                                    }
                                                />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
