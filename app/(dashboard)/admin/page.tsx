"use client"

import { useEffect, useState } from "react"
import { StatusBadge } from "@/app/components/StatusBadge"
import { StatCard } from "@/app/components/StatCard"
import { DataTable, type Column } from "@/app/components/DataTable"
import { DashboardShell } from "@/app/components/DashboardShell"
import { SectionToolbar } from "@/app/components/SectionToolbar"
import { FilterPill } from "@/app/components/FilterPill"
import { Button } from "@/app/components/Button"
import { Modal } from "@/app/components/Modal"
import { FormField, FormSelect } from "@/app/components/FormField"
import { ActivoToggle } from "@/app/components/ActivoToggle"
import { CursosSection } from "@/app/components/CursosSection"

interface Usuario {
    id: string
    nombre: string
    apellido: string
    email: string
    rol: string
    activo: boolean
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
    const [modalAbierto, setModalAbierto] = useState(false)

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
        setModalAbierto(false)
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
            render: (u) => <StatusBadge status={u.activo ? "Activo" : "Inactivo"} />,
        },
        {
            key: "acciones",
            header: "",
            render: (u) => (
                <div className="flex gap-2">
                    <ActivoToggle
                        activo={u.activo}
                        labels={["Deshabilitar", "Habilitar"]}
                        onClick={() => handleToggleActivo(u)}
                    />
                </div>
            ),
        },
    ]

    return (
        <DashboardShell rol="ADMIN" tab={tab} onTabChange={setTab} title={tab}>
            <div className="mb-8 grid grid-cols-4 gap-4">
                <StatCard label="Usuarios totales" value={String(usuarios.length)} accent="purple" />
                <StatCard label="Cursos activos" value="3" accent="blue" />
                <StatCard label="Items en stock" value="5" accent="pink" />
                <StatCard label="Solicitudes pendientes" value="1" accent="purple" />
            </div>

            {tab === "usuarios" && (
                <section>
                    <SectionToolbar descripcion="Lista de ayudantes y profesores registrados en el sistema.">
                        <Button onClick={() => setModalAbierto(true)}>+ Nuevo Usuario</Button>
                    </SectionToolbar>
                    {loading ? (
                        <div className="flex items-center justify-center py-16 text-sm text-slate-500">
                            Cargando usuarios...
                        </div>
                    ) : (
                        <DataTable columns={colsUsuarios} data={usuarios} />
                    )}
                </section>
            )}

            {tab === "cursos" && <CursosSection />}

            {tab === "inventario" && (
                <section>
                    <SectionToolbar descripcion="Artículos disponibles en inventario.">
                        <Button>+ Agregar Artículo</Button>
                    </SectionToolbar>
                    <DataTable columns={colsInv} data={inventario} />
                </section>
            )}

            {tab === "solicitudes" && (
                <section>
                    <SectionToolbar descripcion="Todas las solicitudes de impresión.">
                        <div className="flex gap-2">
                            <FilterPill label="Pendientes" />
                            <FilterPill label="Aprobadas" />
                            <FilterPill label="Rechazadas" />
                        </div>
                    </SectionToolbar>
                    <DataTable columns={colsSolicitudes} data={solicitudes} />
                </section>
            )}

            {modalAbierto && (
                <Modal title="Crear nuevo usuario">
                    <form onSubmit={handleCrearUsuario} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                label="Nombre"
                                type="text"
                                required
                                value={formNombre}
                                onChange={(e) => setFormNombre(e.target.value)}
                            />
                            <FormField
                                label="Apellido"
                                type="text"
                                required
                                value={formApellido}
                                onChange={(e) => setFormApellido(e.target.value)}
                            />
                        </div>
                        <FormField
                            label="Email"
                            type="email"
                            required
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                        />
                        <FormField
                            label="Contraseña"
                            type="password"
                            required
                            minLength={6}
                            value={formPassword}
                            onChange={(e) => setFormPassword(e.target.value)}
                        />
                        <FormSelect
                            label="Rol"
                            value={formRol}
                            onChange={(e) => setFormRol(e.target.value)}
                        >
                            <option value="AYUDANTE">Ayudante</option>
                            <option value="PROFESOR">Profesor</option>
                        </FormSelect>

                        {formError && (
                            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                                {formError}
                            </p>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={() => setModalAbierto(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={formSubmitting}>
                                {formSubmitting ? "Creando..." : "Crear Usuario"}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </DashboardShell>
    )
}
