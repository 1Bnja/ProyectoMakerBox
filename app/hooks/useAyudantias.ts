"use client"

import { useEffect, useState } from "react"

export interface Ayudantia {
    id: string
    dia: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    hora_inicio: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    hora_fin: string
    cupos: number
    activo: boolean
    curso: { nombre: string } | null
    ayudante: { nombre: string; apellido: string } | null
    inscritos: number
    inscrito: boolean
    estudiantes: { nombre: string; apellido: string }[]
}

export interface NuevaAyudantia {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    curso_id: string
    dia: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    hora_inicio: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    hora_fin: string
    cupos: number
}

/* Carga y gestiona ayudantías: usada tanto por Ayudante (crear/activar) como por Estudiante (inscribirse). */
export function useAyudantias() {
    const [ayudantias, setAyudantias] = useState<Ayudantia[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    async function cargar() {
        setLoading(true)
        setError("")
        const res = await fetch("/api/ayudantias")
        const data = await res.json()

        if (!res.ok) {
            setError(data.error ?? "No se pudieron cargar las ayudantías")
            setLoading(false)
            return
        }

        setAyudantias(data)
        setLoading(false)
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargar()
    }, [])

    async function crear(payload: NuevaAyudantia) {
        const res = await fetch("/api/ayudantias", {
            method: "POST",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) return { error: data.error as string }
        await cargar()
        return { error: null }
    }

    async function toggleActivo(ayudantia: Ayudantia) {
        await fetch(`/api/ayudantias/${ayudantia.id}`, {
            method: "PATCH",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activo: !ayudantia.activo }),
        })
        await cargar()
    }

    async function inscribirse(id: string) {
        const res = await fetch(`/api/ayudantias/${id}/inscripcion`, { method: "POST" })
        const data = await res.json()
        if (!res.ok) return { error: data.error as string }
        await cargar()
        return { error: null }
    }

    async function desinscribirse(id: string) {
        await fetch(`/api/ayudantias/${id}/inscripcion`, { method: "DELETE" })
        await cargar()
    }

    return { ayudantias, loading, error, cargar, crear, toggleActivo, inscribirse, desinscribirse }
}
