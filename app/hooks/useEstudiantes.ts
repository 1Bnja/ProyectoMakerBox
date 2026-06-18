"use client"

import { useEffect, useState } from "react"

export interface Estudiante {
    id: string
    nombre: string
    apellido: string
    email: string
    activo: boolean
    // eslint-disable-next-line @typescript-eslint/naming-convention
    curso_id: string | null
    cursos: { nombre: string } | null
}

export interface Curso {
    id: string
    nombre: string
}

/* Lógica compartida de gestión de estudiantes (ayudante y profesor):
   carga de estudiantes/cursos, creación e (in)habilitación. */
export function useEstudiantes() {
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
    const [cursos, setCursos] = useState<Curso[]>([])
    const [loading, setLoading] = useState(true)
    const [modalAbierto, setModalAbierto] = useState(false)

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
        setModalAbierto(false)
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

    return {
        estudiantes,
        cursos,
        loading,
        modalAbierto,
        setModalAbierto,
        form: {
            nombre: formNombre,
            apellido: formApellido,
            email: formEmail,
            password: formPassword,
            cursoId: formCursoId,
            error: formError,
            submitting: formSubmitting,
            setNombre: setFormNombre,
            setApellido: setFormApellido,
            setEmail: setFormEmail,
            setPassword: setFormPassword,
            setCursoId: setFormCursoId,
        },
        handleCrearEstudiante,
        handleToggleActivo,
    }
}
