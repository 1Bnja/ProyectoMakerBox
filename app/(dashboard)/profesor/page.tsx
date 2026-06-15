"use client"

import { useState } from "react"
import { Sidebar } from "@/app/components/Sidebar"
import { StatusBadge } from "@/app/components/StatusBadge"
import { DataTable, type Column } from "@/app/components/DataTable"

interface Estudiante {
    nombre: string
    email: string
    curso: string
    estado: string
}

interface SalaDisp {
    dia: string
    hora: string
    disponible: boolean
}

const estudiantes: Estudiante[] = [
    { nombre: "Ana Torres", email: "ana@utalca.cl", curso: "Diseño 3D Avanzado", estado: "Activo" },
    { nombre: "Pedro Soto", email: "pedro@utalca.cl", curso: "Prototipado Rápido", estado: "Activo" },
    { nombre: "Benjamín Silva", email: "benja@utalca.cl", curso: "Diseño 3D Avanzado", estado: "Inactivo" },
    { nombre: "Camila Rojas", email: "camila@utalca.cl", curso: "Introducción Impresión 3D", estado: "Activo" },
]

const horarios: SalaDisp[] = [
    { dia: "Lunes", hora: "09:00-10:00", disponible: true },
    { dia: "Lunes", hora: "10:00-11:00", disponible: false },
    { dia: "Lunes", hora: "11:00-12:00", disponible: true },
    { dia: "Martes", hora: "09:00-10:00", disponible: true },
    { dia: "Martes", hora: "10:00-11:00", disponible: true },
    { dia: "Martes", hora: "11:00-12:00", disponible: false },
]

const colsEstudiantes: Column<Estudiante>[] = [
    { key: "nombre", header: "Nombre" },
    { key: "email", header: "Email" },
    { key: "curso", header: "Curso" },
    {
        key: "estado",
        header: "Estado",
        render: (e) => <StatusBadge status={e.estado} />,
    },
    {
        key: "acciones",
        header: "",
        render: () => (
            <div className="flex gap-2">
                <button className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-500 transition-colors hover:border-[#3AB0FF]/50 hover:text-[#1f7fbf]">
                    Ver
                </button>
                <button className="rounded-md border border-rose-200 px-2.5 py-1 text-xs text-rose-600 transition-colors hover:bg-rose-50">
                    Retirar
                </button>
            </div>
        ),
    },
]

export default function ProfesorPage() {
    const [tab, setTab] = useState("ayudantias")

    return (
        <div className="flex w-full">
            <Sidebar rol="PROFESOR" activeTab={tab} onTabChange={setTab} />

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
                    {tab === "ayudantias" && (
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Estudiantes inscritos en ayudantías de diseño 3D.
                                    </p>
                                </div>
                                <button className="rounded-lg bg-[#3AB0FF] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#3AB0FF]/25 transition-colors hover:bg-[#2196e3]">
                                    + Inscribir Estudiante
                                </button>
                            </div>
                            <DataTable columns={colsEstudiantes} data={estudiantes} />

                            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(58,176,255,0.06)]">
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
                                            <span className="text-xs font-medium text-[#3AB0FF]">
                                                {a.fecha === "2026-06-17" ? "Mañana" : "En 3 días"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {tab === "sala" && (
                        <section>
                            <p className="mb-6 text-sm text-slate-500">
                                Reserva la sala interactiva para tus actividades.
                            </p>
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(58,176,255,0.06)]">
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
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#3AB0FF] focus:ring-4 focus:ring-[#3AB0FF]/15"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                                    Desde
                                                </label>
                                                <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#3AB0FF] focus:ring-4 focus:ring-[#3AB0FF]/15">
                                                    <option>09:00</option>
                                                    <option>10:00</option>
                                                    <option>11:00</option>
                                                    <option>14:00</option>
                                                    <option>15:00</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                                    Hasta
                                                </label>
                                                <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#3AB0FF] focus:ring-4 focus:ring-[#3AB0FF]/15">
                                                    <option>10:00</option>
                                                    <option>11:00</option>
                                                    <option>12:00</option>
                                                    <option>15:00</option>
                                                    <option>16:00</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                                Curso / Actividad
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Ej: Ayudantía Diseño 3D"
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#3AB0FF] focus:ring-4 focus:ring-[#3AB0FF]/15"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full rounded-lg bg-[#3AB0FF] py-2.5 text-sm font-medium text-white shadow-sm shadow-[#3AB0FF]/25 transition-colors hover:bg-[#2196e3]"
                                        >
                                            Solicitar Reserva
                                        </button>
                                    </form>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(58,176,255,0.06)]">
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
                </div>
            </main>
        </div>
    )
}
