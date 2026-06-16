"use client"

import { useState } from "react"
import { Sidebar } from "@/app/components/Sidebar"
import { StatusBadge } from "@/app/components/StatusBadge"
import { StatCard } from "@/app/components/StatCard"
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
                <button className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-500 transition-colors hover:border-[#6B3FA0]/40 hover:text-[#6B3FA0]">
                    Editar
                </button>
                <button className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-500 transition-colors hover:border-rose-300 hover:text-rose-600">
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
            <button className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-500 transition-colors hover:border-[#6B3FA0]/40 hover:text-[#6B3FA0]">
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
                <span className="text-xs font-medium text-rose-600">Stock bajo</span>
            ) : (
                <span className="text-xs text-slate-400">OK</span>
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
                    <div className="mb-8 grid grid-cols-4 gap-4">
                        <StatCard label="Usuarios totales" value="5" accent="purple" />
                        <StatCard label="Cursos activos" value="3" accent="blue" />
                        <StatCard label="Items en stock" value="5" accent="pink" />
                        <StatCard label="Solicitudes pendientes" value="1" accent="purple" />
                    </div>

                    {tab === "usuarios" && (
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-slate-500">Lista de usuarios registrados en el sistema.</p>
                                <button className="rounded-lg bg-[#6B3FA0] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#6B3FA0]/20 transition-colors hover:bg-[#5a3488]">
                                    + Nuevo Usuario
                                </button>
                            </div>
                            <DataTable columns={colsUsuarios} data={usuarios} />
                        </section>
                    )}

                    {tab === "cursos" && (
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-slate-500">Cursos con ayudantías activas.</p>
                                <button className="rounded-lg bg-[#6B3FA0] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#6B3FA0]/20 transition-colors hover:bg-[#5a3488]">
                                    + Nuevo Curso
                                </button>
                            </div>
                            <DataTable columns={colsCursos} data={cursos} />
                        </section>
                    )}

                    {tab === "inventario" && (
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-slate-500">Artículos disponibles en inventario.</p>
                                <button className="rounded-lg bg-[#6B3FA0] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#6B3FA0]/20 transition-colors hover:bg-[#5a3488]">
                                    + Agregar Artículo
                                </button>
                            </div>
                            <DataTable columns={colsInv} data={inventario} />
                        </section>
                    )}

                    {tab === "solicitudes" && (
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-slate-500">Todas las solicitudes de impresión.</p>
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

function FilterPill({ label }: { label: string }) {
    return (
        <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500 transition-colors hover:border-[#6B3FA0]/40 hover:text-[#6B3FA0]">
            {label}
        </button>
    )
}
