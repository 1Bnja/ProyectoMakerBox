"use client"

import { useState } from "react"
import { DashboardShell } from "@/app/components/DashboardShell"
import { EstudiantesSection } from "@/app/components/EstudiantesSection"
import { FormField, FormSelect } from "@/app/components/FormField"
import { Button } from "@/app/components/Button"

interface SalaDisp {
    dia: string
    hora: string
    disponible: boolean
}

const horarios: SalaDisp[] = [
    { dia: "Lunes", hora: "09:00-10:00", disponible: true },
    { dia: "Lunes", hora: "10:00-11:00", disponible: false },
    { dia: "Lunes", hora: "11:00-12:00", disponible: true },
    { dia: "Martes", hora: "09:00-10:00", disponible: true },
    { dia: "Martes", hora: "10:00-11:00", disponible: true },
    { dia: "Martes", hora: "11:00-12:00", disponible: false },
]

export default function ProfesorPage() {
    const [tab, setTab] = useState("ayudantias")

    return (
        <DashboardShell rol="PROFESOR" tab={tab} onTabChange={setTab} title={tab}>
            {tab === "ayudantias" && (
                <EstudiantesSection
                    accent="blue"
                    descripcion="Estudiantes inscritos en ayudantías de diseño 3D."
                    botonLabel="+ Inscribir Estudiante"
                    modalTitle="Inscribir nuevo estudiante"
                    soloLectura
                >
                    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(80,212,242,0.06)]">
                        <h3 className="mb-2 text-sm font-semibold text-slate-900">
                            Próximas ayudantías
                        </h3>
                        <div className="space-y-3">
                            {[
                                { curso: "Diseño 3D Avanzado", fecha: "2026-06-17", hora: "14:30", sala: "Lab MakerBox 1" },
                                { curso: "Prototipado Rápido", fecha: "2026-06-19", hora: "10:00", sala: "Lab MakerBox 2" },
                            ].map((a, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{a.curso}</p>
                                        <p className="text-xs text-slate-500">
                                            {a.fecha} · {a.hora} · {a.sala}
                                        </p>
                                    </div>
                                    <span className="text-xs font-medium text-[#1c7f99]">
                                        {a.fecha === "2026-06-17" ? "Mañana" : "En 3 días"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </EstudiantesSection>
            )}

            {tab === "sala" && (
                <section>
                    <p className="mb-6 text-sm text-slate-500">
                        Reserva la sala interactiva para tus actividades.
                    </p>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(80,212,242,0.06)]">
                            <h3 className="mb-4 text-sm font-semibold text-slate-900">
                                Nueva reserva
                            </h3>
                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <FormField label="Fecha" accent="blue" type="date" className="bg-white text-slate-900" />
                                <div className="grid grid-cols-2 gap-3">
                                    <FormSelect label="Desde" accent="blue" className="text-slate-900">
                                        <option>09:00</option>
                                        <option>10:00</option>
                                        <option>11:00</option>
                                        <option>14:00</option>
                                        <option>15:00</option>
                                    </FormSelect>
                                    <FormSelect label="Hasta" accent="blue" className="text-slate-900">
                                        <option>10:00</option>
                                        <option>11:00</option>
                                        <option>12:00</option>
                                        <option>15:00</option>
                                        <option>16:00</option>
                                    </FormSelect>
                                </div>
                                <FormField
                                    label="Curso / Actividad"
                                    accent="blue"
                                    type="text"
                                    placeholder="Ej: Ayudantía Diseño 3D"
                                    className="bg-white text-slate-900 placeholder:text-slate-400"
                                />
                                <Button type="submit" accent="blue" fullWidth>
                                    Solicitar Reserva
                                </Button>
                            </form>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(80,212,242,0.06)]">
                            <h3 className="mb-4 text-sm font-semibold text-slate-900">
                                Disponibilidad hoy
                            </h3>
                            <div className="space-y-2">
                                {horarios.map((b, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                                            b.disponible
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                : "border-rose-200 bg-rose-50 text-rose-600"
                                        }`}
                                    >
                                        <span className="text-sm">{b.hora}</span>
                                        <span className="text-xs font-medium">
                                            {b.disponible ? "Disponible" : "Ocupado"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </DashboardShell>
    )
}
