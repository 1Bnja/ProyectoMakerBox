"use client"

import { useState } from "react"
import { Sidebar } from "@/app/components/Sidebar"
import { StatusBadge } from "@/app/components/StatusBadge"
import { DataTable, type Column } from "@/app/components/DataTable"

/* ---------- mock typings ---------- */

interface Usuario {
    nombre: string
    email: string
    rol: string
    estado: string
}

interface Curso {
    nombre: string
    sigla: string
    ayudante: string
    estudiantes: number
}

interface ItemInv {
    articulo: string
    color: string
    stock: number
    minimo: number
}

interface Solicitud {
    id: string
    nombre: string
    solicitante: string
    tipo: string
    estado: string
    fecha: string
}

const usuarios: Usuario[] = [
    { nombre: "Lukas Avello", email: "lukas@utalca.cl", rol: "Ayudante", estado: "Activo" },
    { nombre: "María García", email: "maria@utalca.cl", rol: "Profesor", estado: "Activo" },
    { nombre: "Pedro Soto", email: "pedro@utalca.cl", rol: "Estudiante", estado: "Inactivo" },
    { nombre: "Ana Torres", email: "ana@utalca.cl", rol: "Estudiante", estado: "Activo" },
    { nombre: "Camila Rojas", email: "camila@utalca.cl", rol: "Ayudante", estado: "Activo" },
]

const cursos: Curso[] = [
    { nombre: "Diseño 3D Avanzado", sigla: "ING-301", ayudante: "Lukas Avello", estudiantes: 24 },
    { nombre: "Prototipado Rápido", sigla: "ING-204", ayudante: "Camila Rojas", estudiantes: 18 },
    { nombre: "Introducción a Impresión 3D", sigla: "ING-101", ayudante: "Lukas Avello", estudiantes: 30 },
]

const inventario: ItemInv[] = [
    { articulo: "Filamento PLA 1.75mm", color: "Negro", stock: 12, minimo: 5 },
    { articulo: "Filamento PLA 1.75mm", color: "Blanco", stock: 3, minimo: 5 },
    { articulo: "Filamento PLA 1.75mm", color: "Rojo", stock: 8, minimo: 5 },
    { articulo: "Filamento PETG 1.75mm", color: "Transparente", stock: 6, minimo: 3 },
    { articulo: "Resina UV", color: "Gris", stock: 2, minimo: 4 },
]

const solicitudes: Solicitud[] = [
    { id: "S-001", nombre: "Engranaje", solicitante: "Benjamín Silva", tipo: "Personal", estado: "PENDIENTE", fecha: "2026-06-14" },
    { id: "S-002", nombre: "Soporte Monitor", solicitante: "Ana Torres", tipo: "Curso", estado: "APROBADA", fecha: "2026-06-13" },
    { id: "S-003", nombre: "Carcasa Arduino", solicitante: "Pedro Soto", tipo: "Personal", estado: "EN_PROGRESO", fecha: "2026-06-12" },
    { id: "S-004", nombre: "Clip Sujeción", solicitante: "María García", tipo: "Curso", estado: "RECHAZADA", fecha: "2026-06-11" },
]

/* ---------- column definitions ---------- */

const colsUsuarios: Column<Usuario>[] = [
    { key: "nombre", header: "Nombre" },
    { key: "email", header: "Email" },
    { key: "rol", header: "Rol" },
    {
        key: "estado",
        header: "Estado",
        render: (u) => <StatusBadge status={u.estado} />,
    },
    {
        key: "acciones",
        header: "",
        render: () => (
            <div className="flex gap-2">
                <button className="rounded-md border border-[#1e2235] px-2.5 py-1 text-xs text-[#64748b] transition-colors hover:border-cyan-500/30 hover:text-cyan-400">
                    Editar
                </button>
                <button className="rounded-md border border-[#1e2235] px-2.5 py-1 text-xs text-[#64748b] transition-colors hover:border-red-500/30 hover:text-red-400">
                    Deshabilitar
                </button>
            </div>
        ),
    },
]

const colsCursos: Column<Curso>[] = [
    { key: "nombre", header: "Curso" },
    { key: "sigla", header: "Sigla" },
    { key: "ayudante", header: "Ayudante" },
    { key: "estudiantes", header: "Estudiantes" },
    {
        key: "acciones",
        header: "",
        render: () => (
            <button className="rounded-md border border-[#1e2235] px-2.5 py-1 text-xs text-[#64748b] transition-colors hover:border-cyan-500/30 hover:text-cyan-400">
                Gestionar
            </button>
        ),
    },
]

const colsInv: Column<ItemInv>[] = [
    { key: "articulo", header: "Artículo" },
    { key: "color", header: "Color" },
    { key: "stock", header: "Stock" },
    { key: "minimo", header: "Stock Mín." },
    {
        key: "alerta",
        header: "Alerta",
        render: (i) =>
            i.stock <= i.minimo ? (
                <span className="text-xs font-medium text-red-400">Stock bajo</span>
            ) : (
                <span className="text-xs text-[#64748b]">OK</span>
            ),
    },
]

const colsSolicitudes: Column<Solicitud>[] = [
    { key: "id", header: "ID" },
    { key: "nombre", header: "Nombre" },
    { key: "solicitante", header: "Solicitante" },
    { key: "tipo", header: "Tipo" },
    {
        key: "estado",
        header: "Estado",
        render: (s) => <StatusBadge status={s.estado} />,
    },
    { key: "fecha", header: "Fecha" },
]

/* ---------- component ---------- */

export default function AdminPage() {
    const [tab, setTab] = useState("usuarios")

    return (
        <div className="flex w-full">
            <Sidebar rol="ADMIN" activeTab={tab} onTabChange={setTab} />

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
                    <div className="mb-8 grid grid-cols-4 gap-4">
                        <StatCard label="Usuarios totales" value="5" />
                        <StatCard label="Cursos activos" value="3" />
                        <StatCard label="Items en stock" value="5" />
                        <StatCard label="Solicitudes pendientes" value="1" />
                    </div>

                    {tab === "usuarios" && (
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-[#64748b]">Lista de usuarios registrados en el sistema.</p>
                                <button className="rounded-lg bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20">
                                    + Nuevo Usuario
                                </button>
                            </div>
                            <DataTable columns={colsUsuarios} data={usuarios} />
                        </section>
                    )}

                    {tab === "cursos" && (
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-[#64748b]">Cursos con ayudantías activas.</p>
                                <button className="rounded-lg bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20">
                                    + Nuevo Curso
                                </button>
                            </div>
                            <DataTable columns={colsCursos} data={cursos} />
                        </section>
                    )}

                    {tab === "inventario" && (
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-[#64748b]">Artículos disponibles en inventario.</p>
                                <button className="rounded-lg bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20">
                                    + Agregar Artículo
                                </button>
                            </div>
                            <DataTable columns={colsInv} data={inventario} />
                        </section>
                    )}

                    {tab === "solicitudes" && (
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-[#64748b]">Todas las solicitudes de impresión.</p>
                                <div className="flex gap-2">
                                    <FilterPill label="Pendientes" />
                                    <FilterPill label="Aprobadas" />
                                    <FilterPill label="Rechazadas" />
                                </div>
                            </div>
                            <DataTable columns={colsSolicitudes} data={solicitudes} />
                        </section>
                    )}
                </div>
            </main>
        </div>
    )
}

/* ---------- sub-components ---------- */

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-[#1e2235] bg-[#151821] p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">{label}</p>
            <p className="mt-2 text-2xl font-bold text-[#e2e8f0]">{value}</p>
        </div>
    )
}

function FilterPill({ label }: { label: string }) {
    return (
        <button className="rounded-full border border-[#1e2235] px-3 py-1 text-xs text-[#64748b] transition-colors hover:border-cyan-500/30 hover:text-cyan-400">
            {label}
        </button>
    )
}
