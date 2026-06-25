"use client"

import { useMemo, useState } from "react"
import { esDiaOperativo } from "@/lib/sala/diasSemana"
import type { ReservaSala } from "@/app/hooks/useDisponibilidadSala"

const diasCabecera = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const mesesLabel = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

function obtenerDiasDelMes(anio: number, mes: number): string[] {
    const primerDia = new Date(Date.UTC(anio, mes, 1))
    const ultimoDia = new Date(Date.UTC(anio, mes + 1, 0))

    const inicio = new Date(primerDia)
    inicio.setUTCDate(inicio.getUTCDate() - inicio.getUTCDay())

    const fin = new Date(ultimoDia)
    fin.setUTCDate(fin.getUTCDate() + (6 - fin.getUTCDay()))

    const dias: string[] = []
    const cursor = new Date(inicio)
    while (cursor.getTime() <= fin.getTime()) {
        dias.push(cursor.toISOString().slice(0, 10))
        cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    return dias
}

interface CalendarioMesProps {
    reservas: ReservaSala[]
    onSeleccionarDia: (fecha: string) => void
}

export function CalendarioMes({ reservas, onSeleccionarDia }: CalendarioMesProps) {
    const [mesActual, setMesActual] = useState(() => {
        const hoy = new Date()
        return new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), 1))
    })

    const anio = mesActual.getUTCFullYear()
    const mes = mesActual.getUTCMonth()
    const hoyStr = new Date().toISOString().slice(0, 10)

    const dias = useMemo(() => obtenerDiasDelMes(anio, mes), [anio, mes])

    const conteoPorFecha = useMemo(() => {
        const conteo: Record<string, number> = {}
        for (const r of reservas) {
            conteo[r.fecha] = (conteo[r.fecha] ?? 0) + 1
        }
        return conteo
    }, [reservas])

    function cambiarMes(delta: number) {
        setMesActual(new Date(Date.UTC(anio, mes + delta, 1)))
    }

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => cambiarMes(-1)}
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                        aria-label="Mes anterior"
                    >
                        ←
                    </button>
                    <button
                        onClick={() => cambiarMes(1)}
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                        aria-label="Mes siguiente"
                    >
                        →
                    </button>
                    <button
                        onClick={() => setMesActual(new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)))}
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                    >
                        Hoy
                    </button>
                </div>
                <p className="text-sm font-medium text-slate-700">{mesesLabel[mes]} {anio}</p>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                {diasCabecera.map((d) => (
                    <div key={d} className="py-1">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {dias.map((fecha) => {
                    const fechaMes = Number(fecha.slice(5, 7)) - 1
                    const fueraDeMes = fechaMes !== mes
                    const operativo = esDiaOperativo(fecha)
                    const cantidad = conteoPorFecha[fecha] ?? 0
                    const esHoy = fecha === hoyStr

                    return (
                        <button
                            key={fecha}
                            onClick={() => onSeleccionarDia(fecha)}
                            disabled={fueraDeMes}
                            className={`flex min-h-16 flex-col items-center justify-start gap-1 rounded-lg border p-1.5 text-xs ${
                                fueraDeMes
                                    ? "border-transparent text-slate-300"
                                    : operativo
                                        ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                        : "border-slate-100 bg-slate-50 text-slate-400"
                            } ${esHoy ? "ring-2 ring-violet-300" : ""}`}
                        >
                            <span>{Number(fecha.slice(8, 10))}</span>
                            {!fueraDeMes && cantidad > 0 && (
                                <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
                                    {cantidad}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
