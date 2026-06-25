import { useState, useCallback } from "react"

export interface Articulo {
    id: string
    nombre: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    cantidad_actual: number
    // eslint-disable-next-line @typescript-eslint/naming-convention
    stock_minimo: number
    // eslint-disable-next-line @typescript-eslint/naming-convention
    unidad_medida: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    notificar_stock: boolean
}

export function useInventario() {
    const [articulos, setArticulos] = useState<Articulo[]>([])
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mensaje, setMensaje] = useState<string | null>(null)

    const limpiarMensajes = useCallback(() => {
        setError(null)
        setMensaje(null)
    }, [])

    const cargarArticulos = useCallback(async () => {
        setCargando(true)
        setError(null)
        try {
            const res = await fetch("/api/articulos")
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Error al cargar artículos")
            setArticulos(data)
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            }
        } finally {
            setCargando(false)
        }
    }, [])

    const crearArticulo = useCallback(async (articulo: Omit<Articulo, "id">) => {
        setCargando(true)
        limpiarMensajes()
        try {
            const res = await fetch("/api/articulos", {
                method: "POST",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(articulo),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Error al crear artículo")
            setMensaje("Artículo creado exitosamente")
            await cargarArticulos()
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            }
            throw err
        } finally {
            setCargando(false)
        }
    }, [cargarArticulos, limpiarMensajes])

    const actualizarArticulo = useCallback(async (id: string, articulo: Partial<Omit<Articulo, "id">>) => {
        setCargando(true)
        limpiarMensajes()
        try {
            const res = await fetch(`/api/articulos/${id}`, {
                method: "PATCH",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(articulo),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Error al actualizar artículo")
            setMensaje("Artículo actualizado exitosamente")
            await cargarArticulos()
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            }
            throw err
        } finally {
            setCargando(false)
        }
    }, [cargarArticulos, limpiarMensajes])

    return {
        articulos,
        cargando,
        error,
        mensaje,
        cargarArticulos,
        crearArticulo,
        actualizarArticulo,
        limpiarMensajes
    }
}
