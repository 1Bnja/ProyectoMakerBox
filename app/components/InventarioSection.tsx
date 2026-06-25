"use client"

import { useState, useEffect } from "react"
import { useInventario, type Articulo } from "@/app/hooks/useInventario"
import { evaluarAlertaStock } from "@/lib/inventario/alertaStock"
import { DataTable, type Column } from "./DataTable"
import { SectionToolbar } from "./SectionToolbar"
import { Button } from "./Button"
import { Modal } from "./Modal"
import { FormField } from "./FormField"

export function InventarioSection() {
    const {
        articulos,
        cargando,
        error,
        mensaje,
        cargarArticulos,
        crearArticulo,
        actualizarArticulo,
        limpiarMensajes
    } = useInventario()

    const [modalAbierto, setModalAbierto] = useState(false)
    const [articuloEdit, setArticuloEdit] = useState<Articulo | null>(null)

    const [nombre, setNombre] = useState("")
    const [cantidadActual, setCantidadActual] = useState(0)
    const [stockMinimo, setStockMinimo] = useState(0)
    const [unidadMedida, setUnidadMedida] = useState("")
    const [notificarStock, setNotificarStock] = useState(true)

    const [enviando, setEnviando] = useState(false)

    useEffect(() => {
        cargarArticulos()
    }, [cargarArticulos])

    const abrirModalNuevo = () => {
        limpiarMensajes()
        setArticuloEdit(null)
        setNombre("")
        setCantidadActual(0)
        setStockMinimo(0)
        setUnidadMedida("")
        setNotificarStock(true)
        setModalAbierto(true)
    }

    const abrirModalEditar = (art: Articulo) => {
        limpiarMensajes()
        setArticuloEdit(art)
        setNombre(art.nombre)
        setCantidadActual(art.cantidad_actual)
        setStockMinimo(art.stock_minimo)
        setUnidadMedida(art.unidad_medida)
        setNotificarStock(art.notificar_stock)
        setModalAbierto(true)
    }

    const guardar = async (e: React.FormEvent) => {
        e.preventDefault()
        setEnviando(true)
        try {
            if (articuloEdit) {
                await actualizarArticulo(articuloEdit.id, {
                    nombre,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    cantidad_actual: cantidadActual,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    stock_minimo: stockMinimo,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    unidad_medida: unidadMedida,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    notificar_stock: notificarStock
                })
            } else {
                await crearArticulo({
                    nombre,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    cantidad_actual: cantidadActual,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    stock_minimo: stockMinimo,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    unidad_medida: unidadMedida,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    notificar_stock: notificarStock
                })
            }
            setModalAbierto(false)
        } catch {
            // Error manejado por el hook
        } finally {
            setEnviando(false)
        }
    }

    const columnas: Column<Articulo>[] = [
        { key: "nombre", header: "Artículo" },
        {
            key: "cantidad",
            header: "Cantidad Actual",
            render: (a) => `${a.cantidad_actual} ${a.unidad_medida}`
        },
        {
            key: "stock_minimo",
            header: "Stock Mín.",
            render: (a) => `${a.stock_minimo} ${a.unidad_medida}`
        },
        {
            key: "estado",
            header: "Alerta",
            render: (a) => {
                if (!a.notificar_stock) {
                    return <span className="text-xs text-slate-400">Sin alerta</span>
                }
                const alerta = evaluarAlertaStock(a.cantidad_actual, a.stock_minimo)
                if (alerta.nivel === 'agotado') {
                    return <span className="text-xs font-medium text-rose-600">Stock agotado</span>
                }
                if (alerta.nivel === 'bajo') {
                    return <span className="text-xs font-medium text-amber-500">Stock bajo</span>
                }
                return <span className="text-xs text-slate-400">Normal</span>
            }
        },
        {
            key: "acciones",
            header: "",
            render: (a) => (
                <button
                    onClick={() => abrirModalEditar(a)}
                    className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-50"
                >
                    Editar
                </button>
            )
        }
    ]

    return (
        <section>
            <SectionToolbar descripcion="Artículos disponibles en inventario.">
                <Button accent="pink" onClick={abrirModalNuevo}>+ Nuevo artículo</Button>
            </SectionToolbar>

            {mensaje && (
                <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{mensaje}</p>
            )}
            
            {error && !modalAbierto && (
                <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
            )}

            {cargando && articulos.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-sm text-slate-500">
                    Cargando inventario...
                </div>
            ) : (
                <DataTable columns={columnas} data={articulos} />
            )}

            {modalAbierto && (
                <Modal title={articuloEdit ? "Editar Artículo" : "Nuevo Artículo"}>
                    <form onSubmit={guardar} className="space-y-4">
                        {error && (
                            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
                        )}

                        <FormField
                            label="Nombre del artículo"
                            accent="pink"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                label="Cantidad actual"
                                accent="pink"
                                type="number"
                                min="0"
                                value={cantidadActual}
                                onChange={(e) => setCantidadActual(Number(e.target.value))}
                                required
                            />
                            <FormField
                                label="Stock mínimo"
                                accent="pink"
                                type="number"
                                min="0"
                                value={stockMinimo}
                                onChange={(e) => setStockMinimo(Number(e.target.value))}
                                required
                            />
                        </div>

                        <FormField
                            label="Unidad de medida (ej. gramos, unidades)"
                            accent="pink"
                            value={unidadMedida}
                            onChange={(e) => setUnidadMedida(e.target.value)}
                            required
                        />

                        <label className="flex items-center gap-2 text-xs text-slate-600">
                            <input
                                type="checkbox"
                                checked={notificarStock}
                                onChange={(e) => setNotificarStock(e.target.checked)}
                                className="accent-[#BC367B]"
                            />
                            Activar alertas de stock para este artículo
                        </label>

                        <div className="mt-4 flex justify-end gap-2">
                            <Button type="button" variant="secondary" onClick={() => setModalAbierto(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" accent="pink" disabled={enviando}>
                                {enviando ? "Guardando..." : "Guardar"}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </section>
    )
}
