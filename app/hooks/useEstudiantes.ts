"use client"

/* eslint-disable @typescript-eslint/naming-convention */
import { useEffect, useState } from "react"

export interface Estudiante {
    id: string
    nombre: string
    apellido: string
    email: string
    activo: boolean
     
    curso_id: string | null
    cursos: { nombre: string } | null
     
    grupo_id?: string | null
    grupos?: { id: string; nombre: string; curso_id: string } | null
     
    cursos_asociados?: { id: string; nombre: string }[]
     
    grupos_asociados?: { id: string; nombre: string; curso_id: string }[]
}

export interface Curso {
    id: string
    nombre: string
}

export interface Grupo {
    id: string
    nombre: string
     
    curso_id: string
}

/* Lógica compartida de gestión de estudiantes (ayudante y profesor):
   carga de estudiantes/cursos, creación, edición (nombre/apellido/curso) e (in)habilitación. */
export function useEstudiantes() {
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
    const [cursos, setCursos] = useState<Curso[]>([])
    const [grupos, setGrupos] = useState<Grupo[]>([])
    const [loading, setLoading] = useState(true)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [estudianteEditandoId, setEstudianteEditandoId] = useState<string | null>(null)
    const [modalGrupoAbierto, setModalGrupoAbierto] = useState(false)
    const [estudianteGrupo, setEstudianteGrupo] = useState<Estudiante | null>(null)

    const [formNombre, setFormNombre] = useState("")
    const [formApellido, setFormApellido] = useState("")
    const [formEmail, setFormEmail] = useState("")
    const [formPassword, setFormPassword] = useState("")
    const [formCursoId, setFormCursoId] = useState("")
    const [formError, setFormError] = useState("")
    const [formSubmitting, setFormSubmitting] = useState(false)
    const [grupoCursoId, setGrupoCursoId] = useState("")
    const [grupoGrupoId, setGrupoGrupoId] = useState("")
    const [grupoError, setGrupoError] = useState("")
    const [grupoSubmitting, setGrupoSubmitting] = useState(false)
    const [grupoLoading, setGrupoLoading] = useState(false)
    const [grupoExito, setGrupoExito] = useState("")

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

    async function cargarGrupos(cursoId: string) {
        if (!cursoId) {
            setGrupos([])
            return
        }

        setGrupoLoading(true)
        const res = await fetch(`/api/grupos?curso_id=${cursoId}`)
        if (res.ok) {
            const data = await res.json()
            setGrupos(data)
        } else {
            setGrupos([])
        }
        setGrupoLoading(false)
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarEstudiantes()
        cargarCursos()
    }, [])

    function limpiarFormulario() {
        setFormNombre("")
        setFormApellido("")
        setFormEmail("")
        setFormPassword("")
        setFormCursoId("")
        setFormError("")
        setEstudianteEditandoId(null)
    }

    function limpiarFormularioGrupo() {
        setGrupoCursoId("")
        setGrupoGrupoId("")
        setGrupoError("")
        setGrupoExito("")
        setGrupoSubmitting(false)
        setModalGrupoAbierto(false)
        setEstudianteGrupo(null)
        setGrupos([])
    }

    function abrirModalCrear() {
        limpiarFormulario()
        setModalAbierto(true)
    }

    function abrirModalEditar(estudiante: Estudiante) {
        setFormNombre(estudiante.nombre)
        setFormApellido(estudiante.apellido)
        setFormEmail("")
        setFormPassword("")
        setFormCursoId(estudiante.curso_id ?? "")
        setFormError("")
        setEstudianteEditandoId(estudiante.id)
        setModalAbierto(true)
    }

    function cerrarModal() {
        setModalAbierto(false)
        limpiarFormulario()
    }

    function abrirModalGrupo(estudiante: Estudiante) {
        setEstudianteGrupo(estudiante)
        setGrupoCursoId(estudiante.curso_id ?? "")
        setGrupoGrupoId(estudiante.grupo_id ?? "")
        setGrupoError("")
        setGrupoExito("")
        setModalGrupoAbierto(true)
        if (estudiante.curso_id) {
            cargarGrupos(estudiante.curso_id)
        } else {
            setGrupos([])
        }
    }

    function cerrarModalGrupo() {
        limpiarFormularioGrupo()
    }

    async function handleGuardarEstudiante(event: React.FormEvent) {
        event.preventDefault()
        setFormError("")
        setFormSubmitting(true)

        if (estudianteEditandoId) {
            const res = await fetch(`/api/estudiantes/${estudianteEditandoId}`, {
                method: "PATCH",
                 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: formNombre,
                    apellido: formApellido,
                     
                    curso_id: formCursoId || null,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setFormError(data.error)
                setFormSubmitting(false)
                return
            }

            setFormSubmitting(false)
            cerrarModal()
            cargarEstudiantes()
            return
        }

        const res = await fetch("/api/estudiantes", {
            method: "POST",
             
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: formNombre,
                apellido: formApellido,
                email: formEmail,
                password: formPassword,
                 
                curso_id: formCursoId || null,
            }),
        })

        const data = await res.json()

        if (!res.ok) {
            setFormError(data.error)
            setFormSubmitting(false)
            return
        }

        setFormSubmitting(false)
        cerrarModal()
        cargarEstudiantes()
    }

    async function handleToggleActivo(estudiante: Estudiante) {
        const res = await fetch(`/api/estudiantes/${estudiante.id}`, {
            method: "PATCH",
             
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activo: !estudiante.activo }),
        })

        if (res.ok) {
            cargarEstudiantes()
        }
    }

    async function handleCursoGrupoChange(cursoId: string) {
        setGrupoCursoId(cursoId)
        setGrupoGrupoId("")
        setGrupoError("")
        setGrupoExito("")
        await cargarGrupos(cursoId)
    }

    async function handleGuardarGrupo(event: React.FormEvent) {
        event.preventDefault()
        if (!estudianteGrupo) {
            return
        }

        setGrupoError("")
        setGrupoExito("")
        setGrupoSubmitting(true)

        const res = await fetch(`/api/estudiantes/${estudianteGrupo.id}/grupo`, {
            method: "PATCH",
             
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ curso_id: grupoCursoId, grupo_id: grupoGrupoId }),
        })

        const data = await res.json()

        if (!res.ok) {
            setGrupoError(data.error ?? "No se pudo asignar el grupo")
            setGrupoSubmitting(false)
            return
        }

        setGrupoExito("Grupo asignado correctamente")
        setGrupoSubmitting(false)
        setModalGrupoAbierto(false)
        cargarEstudiantes()
    }

    return {
        estudiantes,
        cursos,
        grupos,
        loading,
        modalAbierto,
        editando: estudianteEditandoId !== null,
        modalGrupoAbierto,
        grupoLoading,
        grupoExito,
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
        grupoForm: {
            estudiante: estudianteGrupo,
            cursoId: grupoCursoId,
            grupoId: grupoGrupoId,
            error: grupoError,
            submitting: grupoSubmitting,
            grupos,
            setCursoId: handleCursoGrupoChange,
            setGrupoId: setGrupoGrupoId,
        },
        abrirModalCrear,
        abrirModalEditar,
        abrirModalGrupo,
        cerrarModal,
        cerrarModalGrupo,
        handleGuardarEstudiante,
        handleGuardarGrupo,
        handleToggleActivo,
    }
}
