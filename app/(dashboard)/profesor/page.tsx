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
                <button className="rounded-md border border-[#1e2235] px-2.5 py-1 text-xs text-[#64748b] transition-colors hover:border-cyan-500/30 hover:text-cyan-400">
                    Ver
                </button>
                <button className="rounded-md border border-red-500/20 px-2.5 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10">
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
                    {tab === "ayudantias" && (
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[#64748b]">
                                        Estudiantes inscritos en ayudantías de diseño 3D.
                                    </p>
                                </div>
                                <button className="rounded-lg bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20">
                                    + Inscribir Estudiante
                                </button>
                            </div>
                            <DataTable columns={colsEstudiantes} data={estudiantes} />

                            <div className="mt-8 rounded-xl border border-[#1e2235] bg-[#151821] p-6">
                                <h3 className="mb-2 text-sm font-semibold text-[#e2e8f0]">
                                    Próximas ayudantías
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { curso: "Diseño 3D Avanzado", fecha: "2026-06-17", hora: "14:30", sala: "Lab MakerBox 1" },
                                        { curso: "Prototipado Rápido", fecha: "2026-06-19", hora: "10:00", sala: "Lab MakerBox 2" },
                                    ].map((a, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between rounded-lg border border-[#1e2235] px-4 py-3"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-[#e2e8f0]">{a.curso}</p>
                                                <p className="text-xs text-[#64748b]">
                                                    {a.fecha} · {a.hora} · {a.sala}
                                                </p>
                                            </div>
                                            <span className="text-xs text-cyan-400">
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
                            <p className="mb-6 text-sm text-[#64748b]">
                                Reserva la sala interactiva para tus actividades.
                            </p>
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div className="rounded-xl border border-[#1e2235] bg-[#151821] p-6">
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
                                                    <option>15:00</option>
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
                                                    <option>16:00</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
                                                Curso / Actividad
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Ej: Ayudantía Diseño 3D"
                                                className="w-full rounded-lg border border-[#1e2235] bg-[#0f1119] px-3 py-2 text-sm text-[#e2e8f0] outline-none placeholder:text-[#475569] focus:border-cyan-500/50"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full rounded-lg bg-cyan-500/10 py-2.5 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20"
                                        >
                                            Solicitar Reserva
                                        </button>
                                    </form>
                                </div>

                                <div className="rounded-xl border border-[#1e2235] bg-[#151821] p-6">
                                    <h3 className="mb-4 text-sm font-semibold text-[#e2e8f0]">
                                        Disponibilidad hoy
                                    </h3>
                                    <div className="space-y-2">
                                        {horarios.map((b, i) => (
                                            <div
                                                key={i}
                                                className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                                                    b.disponible
                                                        ? "bg-green-500/5 text-green-400"
                                                        : "bg-red-500/5 text-red-400"
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
