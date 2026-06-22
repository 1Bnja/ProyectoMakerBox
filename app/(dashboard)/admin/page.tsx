"use client"

import { useEffect, useState } from "react"
import { StatusBadge } from "@/app/components/StatusBadge"
import { StatCard } from "@/app/components/StatCard"
import { DataTable, type Column } from "@/app/components/DataTable"
import { DashboardShell } from "@/app/components/DashboardShell"
import { SectionToolbar } from "@/app/components/SectionToolbar"
import { Button } from "@/app/components/Button"
import { Modal } from "@/app/components/Modal"
import { FormField, FormSelect } from "@/app/components/FormField"
import { ActivoToggle } from "@/app/components/ActivoToggle"

interface Usuario {
    id: string
    nombre: string
    apellido: string
    email: string
    rol: string
    activo: boolean
}

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
            <div className="mb-8 grid grid-cols-1 gap-4">
                <StatCard label="Usuarios totales" value={String(usuarios.length)} accent="purple" />
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
