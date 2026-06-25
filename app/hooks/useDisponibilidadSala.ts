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

export interface BloqueGestion extends Bloque {
    reservaId: string | null
}

export function useDisponibilidadSala() {
    const [bloques, setBloques] = useState<Bloque[]>([])
    const [reservas, setReservas] = useState<ReservaSala[]>([])
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [bloquesGestion, setBloquesGestion] = useState<BloqueGestion[]>([])
    const [cargandoGestion, setCargandoGestion] = useState(false)
    const [errorGestion, setErrorGestion] = useState<string | null>(null)

    const [bloquesSemana, setBloquesSemana] = useState<Record<string, BloqueGestion[]>>({})
    const [cargandoSemana, setCargandoSemana] = useState(false)
    const [errorSemana, setErrorSemana] = useState<string | null>(null)

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

    const cargarGestion = useCallback(async (fecha: string) => {
        setCargandoGestion(true)
        setErrorGestion(null)
        try {
            const res = await fetch(`/api/disponibilidad-sala?fecha=${fecha}&vista=gestion`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Error al cargar la gestión de fecha")
            setBloquesGestion(data)
        } catch (err: unknown) {
            setBloquesGestion([])
            if (err instanceof Error) {
                setErrorGestion(err.message)
            }
        } finally {
            setCargandoGestion(false)
        }
    }, [])

    const bloquearFecha = useCallback(async (bloqueId: string, fecha: string, actividad?: string) => {
        setErrorGestion(null)
        try {
            const res = await fetch("/api/reservas-sala", {
                method: "POST",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { "Content-Type": "application/json" },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                body: JSON.stringify({ bloque_id: bloqueId, fecha, actividad }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Error al bloquear la fecha")
            setBloquesGestion((prev) => prev.map((b) => (b.id === bloqueId ? { ...b, reservaId: data.id } : b)))
            setBloquesSemana((prev) =>
                prev[fecha]
                    ? { ...prev, [fecha]: prev[fecha].map((b) => (b.id === bloqueId ? { ...b, reservaId: data.id } : b)) }
                    : prev
            )
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorGestion(err.message)
            }
        }
    }, [])

    const liberarReserva = useCallback(async (reservaId: string, bloqueId: string) => {
        setErrorGestion(null)
        try {
            const res = await fetch(`/api/reservas-sala/${reservaId}`, { method: "DELETE" })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Error al liberar la reserva")
            setBloquesGestion((prev) => prev.map((b) => (b.id === bloqueId ? { ...b, reservaId: null } : b)))
            setBloquesSemana((prev) => {
                const fecha = Object.keys(prev).find((f) => prev[f].some((b) => b.id === bloqueId))
                if (!fecha) return prev
                return { ...prev, [fecha]: prev[fecha].map((b) => (b.id === bloqueId ? { ...b, reservaId: null } : b)) }
            })
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorGestion(err.message)
            }
        }
    }, [])

    const cargarGestionSemana = useCallback(async (fechas: string[]) => {
        setCargandoSemana(true)
        setErrorSemana(null)
        try {
            const resultados = await Promise.all(
                fechas.map(async (fecha) => {
                    const res = await fetch(`/api/disponibilidad-sala?fecha=${fecha}&vista=gestion`)
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || "Error al cargar la gestión de la semana")
                    return [fecha, data] as const
                })
            )
            setBloquesSemana(Object.fromEntries(resultados))
        } catch (err: unknown) {
            setBloquesSemana({})
            if (err instanceof Error) {
                setErrorSemana(err.message)
            }
        } finally {
            setCargandoSemana(false)
        }
    }, [])

    return {
        bloques,
        reservas,
        cargando,
        error,
        cargar,
        toggleDisponible,
        bloquesGestion,
        cargandoGestion,
        errorGestion,
        cargarGestion,
        bloquearFecha,
        liberarReserva,
        bloquesSemana,
        cargandoSemana,
        errorSemana,
        cargarGestionSemana,
    }
}
