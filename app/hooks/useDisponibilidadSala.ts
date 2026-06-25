import { useState, useCallback } from "react"

export interface Bloque {
    id: string
    dia: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    hora_inicio: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    hora_fin: string
    disponible: boolean
}

export interface ReservaSala {
    id: string
    fecha: string
    actividad: string | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    created_at: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    bloque: { dia: string; hora_inicio: string; hora_fin: string } | null
    solicitante: { nombre: string; apellido: string } | null
}

export function useDisponibilidadSala() {
    const [bloques, setBloques] = useState<Bloque[]>([])
    const [reservas, setReservas] = useState<ReservaSala[]>([])
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const cargar = useCallback(async () => {
        setCargando(true)
        setError(null)
        try {
            const [resBloques, resReservas] = await Promise.all([
                fetch("/api/disponibilidad-sala"),
                fetch("/api/reservas-sala"),
            ])
            const dataBloques = await resBloques.json()
            const dataReservas = await resReservas.json()

            if (!resBloques.ok) throw new Error(dataBloques.error || "Error al cargar la disponibilidad de la sala")
            if (!resReservas.ok) throw new Error(dataReservas.error || "Error al cargar las reservas de la sala")

            setBloques(dataBloques)
            setReservas(dataReservas)
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            }
        } finally {
            setCargando(false)
        }
    }, [])

    const toggleDisponible = useCallback(async (bloque: Bloque) => {
        setError(null)
        try {
            const res = await fetch(`/api/disponibilidad-sala/${bloque.id}`, {
                method: "PATCH",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ disponible: !bloque.disponible }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Error al actualizar el bloque")
            setBloques((prev) => prev.map((b) => (b.id === bloque.id ? data : b)))
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            }
        }
    }, [])

    return { bloques, reservas, cargando, error, cargar, toggleDisponible }
}
