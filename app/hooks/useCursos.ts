"use client"

import { useEffect, useState } from "react"

export interface Curso {
    id: string
    nombre: string
    sigla: string | null
    activo: boolean
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ayudante_id: string | null
    ayudante: { nombre: string; apellido: string } | null
    estudiantes: number
}

export interface Ayudante {
    id: string
    nombre: string
    apellido: string
}

/* Lógica de gestión de cursos (admin): carga de cursos/ayudantes,
   creación, edición y (des)activación. */
export function useCursos() {
    const [cursos, setCursos] = useState<Curso[]>([])
    const [ayudantes, setAyudantes] = useState<Ayudante[]>([])
    const [loading, setLoading] = useState(true)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [cursoEditandoId, setCursoEditandoId] = useState<string | null>(null)

    const [formNombre, setFormNombre] = useState("")
    const [formSigla, setFormSigla] = useState("")
    const [formAyudanteId, setFormAyudanteId] = useState("")
    const [formError, setFormError] = useState("")
    const [formSubmitting, setFormSubmitting] = useState(false)

    async function cargarCursos() {
        const res = await fetch("/api/cursos")
        if (res.ok) {
            const data = await res.json()
            setCursos(data)
        }
        setLoading(false)
    }

    async function cargarAyudantes() {
        const res = await fetch("/api/usuarios")
        if (res.ok) {
            const data = await res.json()
            setAyudantes((data as { id: string; nombre: string; apellido: string; rol: string }[]).filter(
                (u) => u.rol === "AYUDANTE"
            ))
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarCursos()
        cargarAyudantes()
    }, [])

    function limpiarFormulario() {
        setFormNombre("")
        setFormSigla("")
        setFormAyudanteId("")
        setFormError("")
        setCursoEditandoId(null)
    }

    function abrirModalCrear() {
        limpiarFormulario()
        setModalAbierto(true)
    }

    function abrirModalEditar(curso: Curso) {
        setFormNombre(curso.nombre)
        setFormSigla(curso.sigla ?? "")
        setFormAyudanteId(curso.ayudante_id ?? "")
        setFormError("")
        setCursoEditandoId(curso.id)
        setModalAbierto(true)
    }

    function cerrarModal() {
        setModalAbierto(false)
        limpiarFormulario()
    }

    async function handleGuardarCurso(event: React.FormEvent) {
        event.preventDefault()
        setFormError("")
        setFormSubmitting(true)

        const payload = {
            nombre: formNombre,
            sigla: formSigla || null,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            ayudante_id: formAyudanteId || null,
        }

        const res = cursoEditandoId
            ? await fetch(`/api/cursos/${cursoEditandoId}`, {
                method: "PATCH",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            : await fetch("/api/cursos", {
                method: "POST",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

        const data = await res.json()

        if (!res.ok) {
            setFormError(data.error)
            setFormSubmitting(false)
            return
        }

        setFormSubmitting(false)
        cerrarModal()
        cargarCursos()
    }

    async function handleToggleActivo(curso: Curso) {
        const res = await fetch(`/api/cursos/${curso.id}`, {
            method: "PATCH",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activo: !curso.activo }),
        })

        if (res.ok) {
            cargarCursos()
        }
    }

    return {
        cursos,
        ayudantes,
        loading,
        modalAbierto,
        editando: cursoEditandoId !== null,
        form: {
            nombre: formNombre,
            sigla: formSigla,
            ayudanteId: formAyudanteId,
            error: formError,
            submitting: formSubmitting,
            setNombre: setFormNombre,
            setSigla: setFormSigla,
            setAyudanteId: setFormAyudanteId,
        },
        abrirModalCrear,
        abrirModalEditar,
        cerrarModal,
        handleGuardarCurso,
        handleToggleActivo,
    }
}
