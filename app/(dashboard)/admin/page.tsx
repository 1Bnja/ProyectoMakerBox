"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/app/components/Sidebar"
import { StatusBadge } from "@/app/components/StatusBadge"
import { StatCard } from "@/app/components/StatCard"
import { DataTable, type Column } from "@/app/components/DataTable"

interface Usuario {
    id: string
    nombre: string
    apellido: string
    email: string
    rol: string
    activo: boolean
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

export default function AdminPage() {
    const [tab, setTab] = useState("usuarios")
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState<"crear" | null>(null)

    const [formNombre, setFormNombre] = useState("")
    const [formApellido, setFormApellido] = useState("")
    const [formEmail, setFormEmail] = useState("")
    const [formPassword, setFormPassword] = useState("")
    const [formRol, setFormRol] = useState("AYUDANTE")
    const [formError, setFormError] = useState("")
    const [formSubmitting, setFormSubmitting] = useState(false)

    async function cargarUsuarios() {
        const res = await fetch("/api/usuarios")
        if (res.ok) {
            const data = await res.json()
            setUsuarios(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarUsuarios()
    }, [])

    async function handleCrearUsuario(event: React.FormEvent) {
        event.preventDefault()
        setFormError("")
        setFormSubmitting(true)

        const res = await fetch("/api/usuarios", {
            method: "POST",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: formNombre,
                apellido: formApellido,
                email: formEmail,
                password: formPassword,
                rol: formRol,
            }),
        })

        const data = await res.json()

        if (!res.ok) {
            setFormError(data.error)
            setFormSubmitting(false)
            return
        }

        setFormNombre("")
        setFormApellido("")
        setFormEmail("")
        setFormPassword("")
        setFormRol("AYUDANTE")
        setFormSubmitting(false)
        setModal(null)
        cargarUsuarios()
    }

    async function handleToggleActivo(usuario: Usuario) {
        const res = await fetch(`/api/usuarios/${usuario.id}`, {
            method: "PATCH",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activo: !usuario.activo }),
        })

        if (res.ok) {
            cargarUsuarios()
        }
    }

    const colsUsuarios: Column<Usuario>[] = [
        {
            key: "nombre",
            header: "Nombre",
            render: (u) => `${u.nombre} ${u.apellido}`,
        },
        { key: "email", header: "Email" },
        { key: "rol", header: "Rol" },
        {
            key: "estado",
            header: "Estado",
            render: (u) => (
                <StatusBadge status={u.activo ? "Activo" : "Inactivo"} />
            ),
        },
        {
            key: "acciones",
            header: "",
            render: (u) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleToggleActivo(u)}
                        className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                            u.activo
                                ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                    >
                        {u.activo ? "Deshabilitar" : "Habilitar"}
                    </button>
                </div>
            ),
        },
    ]

    return (
        <>
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
                        <StatCard label="Usuarios totales" value={String(usuarios.length)} accent="purple" />
                        <StatCard label="Cursos activos" value="3" accent="blue" />
                        <StatCard label="Items en stock" value="5" accent="pink" />
                        <StatCard label="Solicitudes pendientes" value="1" accent="purple" />
                    </div>

                    {tab === "usuarios" && (
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-slate-500">Lista de ayudantes y profesores registrados en el sistema.</p>
                                <button
                                    onClick={() => setModal("crear")}
                                    className="rounded-lg bg-[#6B3FA0] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#6B3FA0]/20 transition-colors hover:bg-[#5a3488]"
                                >
                                    + Nuevo Usuario
                                </button>
                            </div>
                            {loading ? (
                                <div className="flex items-center justify-center py-16 text-sm text-slate-500">
                                    Cargando usuarios...
                                </div>
                            ) : (
                                <DataTable columns={colsUsuarios} data={usuarios} />
                            )}
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

        {modal === "crear" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                    <h2 className="mb-4 text-sm font-semibold text-slate-900">
                        Crear nuevo usuario
                    </h2>
                    <form onSubmit={handleCrearUsuario} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formNombre}
                                    onChange={(e) => setFormNombre(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#6B3FA0] focus:ring-4 focus:ring-[#6B3FA0]/15"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                    Apellido
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formApellido}
                                    onChange={(e) => setFormApellido(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#6B3FA0] focus:ring-4 focus:ring-[#6B3FA0]/15"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={formEmail}
                                onChange={(e) => setFormEmail(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#6B3FA0] focus:ring-4 focus:ring-[#6B3FA0]/15"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={formPassword}
                                onChange={(e) => setFormPassword(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#6B3FA0] focus:ring-4 focus:ring-[#6B3FA0]/15"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                Rol
                            </label>
                            <select
                                value={formRol}
                                onChange={(e) => setFormRol(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#6B3FA0] focus:ring-4 focus:ring-[#6B3FA0]/15"
                            >
                                <option value="AYUDANTE">Ayudante</option>
                                <option value="PROFESOR">Profesor</option>
                            </select>
                        </div>

                        {formError && (
                            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                                {formError}
                            </p>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setModal(null)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={formSubmitting}
                                className="rounded-lg bg-[#6B3FA0] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#6B3FA0]/20 transition-colors hover:bg-[#5a3488] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {formSubmitting ? "Creando..." : "Crear Usuario"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    )
}

function FilterPill({ label }: { label: string }) {
    return (
        <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500 transition-colors hover:border-[#6B3FA0]/40 hover:text-[#6B3FA0]">
            {label}
        </button>
    )
}
