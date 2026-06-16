"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/app/components/Sidebar"
import { StatusBadge } from "@/app/components/StatusBadge"
import { DataTable, type Column } from "@/app/components/DataTable"

interface Estudiante {
    id: string
    nombre: string
    apellido: string
    email: string
    activo: boolean
    // eslint-disable-next-line @typescript-eslint/naming-convention
    curso_id: string | null
    cursos: { nombre: string } | null
}

interface Curso {
    id: string
    nombre: string
}

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
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
    const [cursos, setCursos] = useState<Curso[]>([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState<"crear" | null>(null)

    const [formNombre, setFormNombre] = useState("")
    const [formApellido, setFormApellido] = useState("")
    const [formEmail, setFormEmail] = useState("")
    const [formPassword, setFormPassword] = useState("")
    const [formCursoId, setFormCursoId] = useState("")
    const [formError, setFormError] = useState("")
    const [formSubmitting, setFormSubmitting] = useState(false)

    async function cargarEstudiantes() {
        const res = await fetch("/api/estudiantes")
        if (res.ok) {
            const data = await res.json()
            setEstudiantes(data)
        }
        setLoading(false)
    }

    async function cargarCursos() {
        const res = await fetch("/api/cursos")
        if (res.ok) {
            const data = await res.json()
            setCursos(data)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarEstudiantes()
        cargarCursos()
    }, [])

    async function handleCrearEstudiante(event: React.FormEvent) {
        event.preventDefault()
        setFormError("")
        setFormSubmitting(true)

        const res = await fetch("/api/estudiantes", {
            method: "POST",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: formNombre,
                apellido: formApellido,
                email: formEmail,
                password: formPassword,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                curso_id: formCursoId || null,
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
        setFormCursoId("")
        setFormSubmitting(false)
        setModal(null)
        cargarEstudiantes()
    }

    async function handleToggleActivo(estudiante: Estudiante) {
        const res = await fetch(`/api/estudiantes/${estudiante.id}`, {
            method: "PATCH",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activo: !estudiante.activo }),
        })

        if (res.ok) {
            cargarEstudiantes()
        }
    }

    const colsEstudiantes: Column<Estudiante>[] = [
        {
            key: "nombre",
            header: "Nombre",
            render: (e) => `${e.nombre} ${e.apellido}`,
        },
        { key: "email", header: "Email" },
        {
            key: "curso",
            header: "Curso",
            render: (e) => e.cursos?.nombre ?? "—",
        },
        {
            key: "estado",
            header: "Estado",
            render: (e) => (
                <StatusBadge status={e.activo ? "Activo" : "Inactivo"} />
            ),
        },
        {
            key: "acciones",
            header: "",
            render: (e) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleToggleActivo(e)}
                        className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                            e.activo
                                ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                    >
                        {e.activo ? "Retirar" : "Reactivar"}
                    </button>
                </div>
            ),
        },
    ]

    return (
        <>
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
                                <button
                                    onClick={() => setModal("crear")}
                                    className="rounded-lg bg-[#3AB0FF] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#3AB0FF]/25 transition-colors hover:bg-[#2196e3]"
                                >
                                    + Inscribir Estudiante
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-16 text-sm text-slate-500">
                                    Cargando estudiantes...
                                </div>
                            ) : (
                                <DataTable columns={colsEstudiantes} data={estudiantes} />
                            )}

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

        {modal === "crear" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                    <h2 className="mb-4 text-sm font-semibold text-slate-900">
                        Inscribir nuevo estudiante
                    </h2>
                    <form onSubmit={handleCrearEstudiante} className="space-y-4">
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
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#3AB0FF] focus:ring-4 focus:ring-[#3AB0FF]/15"
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
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#3AB0FF] focus:ring-4 focus:ring-[#3AB0FF]/15"
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
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#3AB0FF] focus:ring-4 focus:ring-[#3AB0FF]/15"
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
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#3AB0FF] focus:ring-4 focus:ring-[#3AB0FF]/15"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                Curso (opcional)
                            </label>
                            <select
                                value={formCursoId}
                                onChange={(e) => setFormCursoId(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#3AB0FF] focus:ring-4 focus:ring-[#3AB0FF]/15"
                            >
                                <option value="">Sin curso</option>
                                {cursos.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nombre}
                                    </option>
                                ))}
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
                                className="rounded-lg bg-[#3AB0FF] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#3AB0FF]/25 transition-colors hover:bg-[#2196e3] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {formSubmitting ? "Creando..." : "Crear Estudiante"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    )
}
