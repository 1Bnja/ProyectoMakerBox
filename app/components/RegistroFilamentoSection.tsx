"use client"

import { useState, useEffect } from "react"
import { useRegistroFilamento } from "@/app/hooks/useRegistroFilamento"
import { DataTable, type Column } from "./DataTable"
import { SectionToolbar } from "./SectionToolbar"
import { Button } from "./Button"
import { FormField } from "./FormField"
import type { UsoRegistrado } from "@/app/hooks/useRegistroFilamento"

export function RegistroFilamentoSection() {
    const {
        impresiones,
        articulos,
        historial,
        cargando,
        guardando,
        error,
        mensajeExito,
        alertaStock,
        cargarDatos,
        registrarUso,
        limpiarMensajes,
    } = useRegistroFilamento()

    const [impresionId, setImpresionId] = useState("")
    const [articuloId, setArticuloId] = useState("")
    const [cantidad, setCantidad] = useState("")

    useEffect(() => {
        cargarDatos()
    }, [cargarDatos])

    // Articulo seleccionado (para mostrar stock y unidad)
    const articuloSeleccionado = articulos.find((a) => a.id === articuloId) ?? null

    // Solo articulos con stock > 0
    const articulosDisponibles = articulos.filter((a) => a.cantidad_actual > 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        limpiarMensajes()

        const cantidadNum = Number(cantidad)
        if (!impresionId) return
        if (!articuloId) return
        if (!Number.isInteger(cantidadNum) || cantidadNum <= 0) return

        try {
            await registrarUso({ impresionId, articuloId, cantidad: cantidadNum })
            // Limpiar formulario al registrar con exito
            setImpresionId("")
            setArticuloId("")
            setCantidad("")
        } catch {
            // El error ya esta en el estado del hook
        }
    }

    const columnas: Column<UsoRegistrado>[] = [
        {
            key: "impresion",
            header: "Impresión",
            render: (u) => u.impresionLabel,
        },
        {
            key: "articulo",
            header: "Artículo",
            render: (u) => u.articuloNombre ?? u.articuloId,
        },
        {
            key: "cantidad",
            header: "Cantidad",
            render: (u) =>
                u.unidadMedida ? `${u.cantidad} ${u.unidadMedida}` : String(u.cantidad),
        },
        {
            key: "stockRestante",
            header: "Stock restante",
            render: (u) =>
                typeof u.stockRestante === "number" && u.unidadMedida
                    ? `${u.stockRestante} ${u.unidadMedida}`
                    : typeof u.stockRestante === "number"
                        ? String(u.stockRestante)
                        : "—",
        },
    ]

    return (
        <section>
            <SectionToolbar descripcion="Registro de uso de filamento.">
                {/* Toolbar vacio; el boton esta dentro del formulario */}
            </SectionToolbar>

            {/* ---------------------------------------------------------------- */}
            {/* Formulario de registro                                            */}
            {/* ---------------------------------------------------------------- */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_20px_rgba(74,39,117,0.06)]">
                <h2 className="mb-4 text-sm font-semibold text-slate-700">
                    Registrar uso de artículo
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Selector de impresion */}
                    <div>
                        <label
                            htmlFor="selectImpresion"
                            className="mb-1.5 block text-xs font-medium text-slate-600"
                        >
                            Impresión (estado: APROBADA)
                        </label>
                        <select
                            id="selectImpresion"
                            value={impresionId}
                            onChange={(e) => setImpresionId(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#BC367B] focus:ring-4 focus:ring-[#BC367B]/15"
                            required
                        >
                            <option value="">— Seleccionar impresión —</option>
                            {impresiones.map((imp) => {
                                const sol = imp.solicitante
                                    ? `${imp.solicitante.nombre} ${imp.solicitante.apellido}`
                                    : null
                                const label = sol
                                    ? `${imp.tipo} — ${sol}`
                                    : imp.tipo || imp.id
                                return (
                                    <option key={imp.id} value={imp.id}>
                                        {label}
                                    </option>
                                )
                            })}
                        </select>
                    </div>

                    {/* Selector de articulo */}
                    <div>
                        <label
                            htmlFor="selectArticulo"
                            className="mb-1.5 block text-xs font-medium text-slate-600"
                        >
                            Artículo / Filamento
                        </label>
                        <select
                            id="selectArticulo"
                            value={articuloId}
                            onChange={(e) => {
                                setArticuloId(e.target.value)
                                setCantidad("")
                            }}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#BC367B] focus:ring-4 focus:ring-[#BC367B]/15"
                            required
                        >
                            <option value="">— Seleccionar artículo —</option>
                            {articulosDisponibles.map((art) => (
                                <option key={art.id} value={art.id}>
                                    {art.nombre} — {art.cantidad_actual} {art.unidad_medida}{" "}
                                    disponibles
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Info del articulo seleccionado */}
                    {articuloSeleccionado && (
                        <p
                            id="stockInfo"
                            className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600"
                        >
                            Stock disponible:{" "}
                            <span className="font-semibold text-slate-800">
                                {articuloSeleccionado.cantidad_actual}{" "}
                                {articuloSeleccionado.unidad_medida}
                            </span>
                        </p>
                    )}

                    {/* Cantidad */}
                    <FormField
                        label="Cantidad utilizada"
                        id="cantidadUtilizada"
                        accent="pink"
                        type="number"
                        min="1"
                        max={articuloSeleccionado?.cantidad_actual ?? undefined}
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        placeholder="Ej: 50"
                        required
                    />

                    {/* Botón */}
                    <div className="flex justify-end">
                        <Button
                            id="btnRegistrarUso"
                            type="submit"
                            accent="pink"
                            disabled={guardando}
                        >
                            {guardando ? "Registrando..." : "Registrar uso"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Mensajes de estado                                                */}
            {/* ---------------------------------------------------------------- */}

            {mensajeExito && (
                <p
                    id="mensajeExito"
                    className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700"
                >
                    {mensajeExito}
                </p>
            )}

            {error && !mensajeExito && (
                <p
                    id="mensajeError"
                    className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700"
                >
                    {error}
                </p>
            )}

            {/* Alerta de stock bajo o agotado */}
            {alertaStock?.requiereAlerta && (
                <p
                    id="alertaStockMsg"
                    className={`mb-4 rounded-lg px-3 py-2 text-xs font-medium ${alertaStock.nivel === "agotado"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                >
                    ⚠️ {alertaStock.mensaje}
                </p>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* Historial                                                         */}
            {/* ---------------------------------------------------------------- */}
            <div className="mt-2">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Historial de uso
                </p>

                {cargando && historial.length === 0 ? (
                    <div className="flex items-center justify-center py-16 text-sm text-slate-500">
                        Cargando historial...
                    </div>
                ) : (
                    <DataTable columns={columnas} data={historial} />
                )}
            </div>
        </section>
    )
}
