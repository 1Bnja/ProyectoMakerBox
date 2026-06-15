"use client"

import { useState } from "react"
import { Sidebar } from "@/app/components/Sidebar"
import { StatusBadge } from "@/app/components/StatusBadge"
import { DataTable, type Column } from "@/app/components/DataTable"

interface Solicitud {
    id: string
    nombre: string
    solicitante: string
    tipo: string
    estado: string
    fecha: string
    prioridad: string
}

interface Bloque {
    dia: string
    hora: string
    disponible: boolean
}

const solicitudes: Solicitud[] = [
    { id: "S-001", nombre: "Engranaje", solicitante: "Benjamín Silva", tipo: "Personal", estado: "PENDIENTE", fecha: "2026-06-14", prioridad: "Alta" },
    { id: "S-002", nombre: "Soporte Monitor", solicitante: "Ana Torres", tipo: "Curso", estado: "APROBADA", fecha: "2026-06-13", prioridad: "Media" },
    { id: "S-003", nombre: "Carcasa Arduino", solicitante: "Pedro Soto", tipo: "Personal", estado: "EN_PROGRESO", fecha: "2026-06-12", prioridad: "Alta" },
    { id: "S-004", nombre: "Clip Sujeción", solicitante: "María García", tipo: "Curso", estado: "RECHAZADA", fecha: "2026-06-11", prioridad: "Baja" },
    { id: "S-005", nombre: "Soporte Teléfono", solicitante: "Camila Rojas", tipo: "Personal", estado: "PENDIENTE", fecha: "2026-06-10", prioridad: "Media" },
    { id: "S-006", nombre: "Base Laptop", solicitante: "Lukas Avello", tipo: "Curso", estado: "PENDIENTE", fecha: "2026-06-09", prioridad: "Alta" },
]

const horarios: Bloque[] = [
    { dia: "Lun", hora: "09:00-10:00", disponible: true },
    { dia: "Lun", hora: "10:00-11:00", disponible: false },
    { dia: "Lun", hora: "11:00-12:00", disponible: true },
    { dia: "Mar", hora: "09:00-10:00", disponible: true },
    { dia: "Mar", hora: "10:00-11:00", disponible: true },
    { dia: "Mar", hora: "11:00-12:00", disponible: false },
    { dia: "Mié", hora: "09:00-10:00", disponible: false },
    { dia: "Mié", hora: "10:00-11:00", disponible: true },
    { dia: "Mié", hora: "11:00-12:00", disponible: true },
    { dia: "Jue", hora: "09:00-10:00", disponible: true },
    { dia: "Jue", hora: "10:00-11:00", disponible: true },
    { dia: "Jue", hora: "11:00-12:00", disponible: true },
    { dia: "Vie", hora: "09:00-10:00", disponible: true },
    { dia: "Vie", hora: "10:00-11:00", disponible: false },
    { dia: "Vie", hora: "11:00-12:00", disponible: false },
]

interface RegistroFilamento {
    fecha: string
    solicitud: string
    material: string
    gramos: number
    usuario: string
}

const filamentos: RegistroFilamento[] = [
    { fecha: "2026-06-14", solicitud: "S-001", material: "PLA Negro", gramos: 45, usuario: "Lukas Avello" },
    { fecha: "2026-06-13", solicitud: "S-002", material: "PLA Blanco", gramos: 120, usuario: "Camila Rojas" },
    { fecha: "2026-06-12", solicitud: "S-003", material: "PETG Transparente", gramos: 78, usuario: "Lukas Avello" },
    { fecha: "2026-06-11", solicitud: "S-004", material: "PLA Rojo", gramos: 32, usuario: "Camila Rojas" },
]

const colsSolicitudes: Column<Solicitud>[] = [
    { key: "id", header: "ID" },
    { key: "nombre", header: "Nombre" },
    { key: "solicitante", header: "Solicitante" },
    { key: "tipo", header: "Tipo" },
    { key: "prioridad", header: "Prioridad" },
    {
        key: "estado",
        header: "Estado",
        render: (s) => <StatusBadge status={s.estado} />,
    },
    { key: "fecha", header: "Fecha" },
    {
        key: "acciones",
        header: "",
        render: (s) =>
            s.estado === "PENDIENTE" ? (
                <div className="flex gap-2">
                    <button className="rounded-md border border-green-500/20 px-2.5 py-1 text-xs text-green-400 transition-colors hover:bg-green-500/10">
                        Aprobar
                    </button>
                    <button className="rounded-md border border-red-500/20 px-2.5 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10">
                        Rechazar
                    </button>
                </div>
            ) : (
                <span className="text-xs text-[#64748b]">—</span>
            ),
    },
]

const colsFilamento: Column<RegistroFilamento>[] = [
    { key: "fecha", header: "Fecha" },
    { key: "solicitud", header: "Solicitud" },
    { key: "material", header: "Material" },
    { key: "gramos", header: "Gramos" },
    { key: "usuario", header: "Registrado por" },
]

export default function AyudantePage() {
    const [tab, setTab] = useState("solicitudes")
    const [filtro, setFiltro] = useState<string | null>(null)

    const visibles = filtro
        ? solicitudes.filter((s) => s.estado === filtro)
        : solicitudes

    return (
        <div className="flex w-full">
            <Sidebar rol="AYUDANTE" activeTab={tab} onTabChange={setTab} />

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
                            <div className="mb-6 grid grid-cols-4 gap-4">
                                <StatCard label="Pendientes" value="3" />
                                <StatCard label="En progreso" value="1" />
                                <StatCard label="Aprobadas hoy" value="2" />
                                <StatCard label="Por revisar" value="4" />
                            </div>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-[#64748b]">
                                    {filtro ? `Filtrado por: ${filtro}` : "Todas las solicitudes de impresión."}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFiltro(null)}
                                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                            !filtro
                                                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                                                : "border-[#1e2235] text-[#64748b] hover:border-cyan-500/30 hover:text-cyan-400"
                                        }`}
                                    >
                                        Todas
                                    </button>
                                    {["PENDIENTE", "APROBADA", "RECHAZADA", "EN_PROGRESO"].map((e) => (
                                        <button
                                            key={e}
                                            onClick={() => setFiltro(e)}
                                            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                                filtro === e
                                                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                                                    : "border-[#1e2235] text-[#64748b] hover:border-cyan-500/30 hover:text-cyan-400"
                                            }`}
                                        >
                                            {e.replace("_", " ")}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <DataTable columns={colsSolicitudes} data={visibles} />
                        </section>
                    )}

                    {tab === "sala" && (
                        <section>
                            <p className="mb-6 text-sm text-[#64748b]">Disponibilidad de la sala para la semana.</p>
                            <div className="grid grid-cols-5 gap-3">
                                {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].map((dia, di) => (
                                    <div key={dia} className="rounded-xl border border-[#1e2235] bg-[#151821] p-4">
                                        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-[#64748b]">
                                            {dia}
                                        </p>
                                        <div className="space-y-2">
                                            {horarios
                                                .filter((b) => b.dia === ["Lun", "Mar", "Mié", "Jue", "Vie"][di])
                                                .map((b, i) => (
                                                    <div
                                                        key={i}
                                                        className={`rounded-lg px-3 py-2 text-center text-xs ${
                                                            b.disponible
                                                                ? "bg-green-500/10 text-green-400"
                                                                : "bg-red-500/10 text-red-400"
                                                        }`}
                                                    >
                                                        {b.hora}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {tab === "filamento" && (
                        <section>
                            <div className="mb-6 grid grid-cols-3 gap-4">
                                <StatCard label="Filamento usado hoy" value="165g" />
                                <StatCard label="Filamento usado esta semana" value="720g" />
                                <StatCard label="Rollos activos" value="6" />
                            </div>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-[#64748b]">Registro de uso de filamento.</p>
                                <button className="rounded-lg bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20">
                                    + Registrar Uso
                                </button>
                            </div>
                            <DataTable columns={colsFilamento} data={filamentos} />
                        </section>
                    )}
                </div>
            </main>
        </div>
    )
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-[#1e2235] bg-[#151821] p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">{label}</p>
            <p className="mt-2 text-2xl font-bold text-[#e2e8f0]">{value}</p>
        </div>
    )
}
