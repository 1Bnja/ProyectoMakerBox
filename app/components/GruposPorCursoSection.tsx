"use client"

import { useState } from "react"
import { DataTable, type Column } from "./DataTable"
import { SectionToolbar } from "./SectionToolbar"
import { FormField } from "./FormField"
import { Button } from "./Button"
import { Modal } from "./Modal"
import { accentClasses, type Accent } from "./theme"

interface CursoOption {
    id: string
    nombre: string
}

interface Grupo {
    id: string
    nombre: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    curso_id: string
}

interface GruposPorCursoSectionProps {
    accent: Accent
    cursos: CursoOption[]
}

const columnas: Column<Grupo>[] = [{ key: "nombre", header: "Grupo" }]

/* Sección de visualización y creación de grupos por curso, usada por ayudante (cualquier curso)
   y profesor (acotado a sus propios cursos vía el listado que recibe). */
export function GruposPorCursoSection({ accent, cursos }: GruposPorCursoSectionProps) {
    const [cursoId, setCursoId] = useState("")
    const [grupos, setGrupos] = useState<Grupo[]>([])
    const [loadingGrupos, setLoadingGrupos] = useState(false)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [nuevoGrupoNombre, setNuevoGrupoNombre] = useState("")
    const [error, setError] = useState("")
    const [creando, setCreando] = useState(false)

    async function cargarGrupos(id: string) {
        if (!id) {
            setGrupos([])
            return
        }
        setLoadingGrupos(true)
        const res = await fetch(`/api/grupos?curso_id=${id}`)
        if (res.ok) {
            const data = await res.json()
            setGrupos(data)
        } else {
            setGrupos([])
        }
        setLoadingGrupos(false)
    }

    function handleCursoChange(id: string) {
        setCursoId(id)
        cargarGrupos(id)
    }

    function abrirModal() {
        setNuevoGrupoNombre("")
        setError("")
        setModalAbierto(true)
    }

    function cerrarModal() {
        setModalAbierto(false)
    }

    async function handleCrearGrupo(event: React.FormEvent) {
        event.preventDefault()
        if (!cursoId || !nuevoGrupoNombre.trim()) {
            return
        }

        setError("")
        setCreando(true)

        const res = await fetch("/api/grupos", {
            method: "POST",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            headers: { "Content-Type": "application/json" },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            body: JSON.stringify({ nombre: nuevoGrupoNombre.trim(), curso_id: cursoId }),
        })

        const data = await res.json()

        if (!res.ok) {
            setError(data.error ?? "No se pudo crear el grupo")
            setCreando(false)
            return
        }

        setGrupos((prev) => [...prev, data])
        setCreando(false)
        setModalAbierto(false)
    }

    return (
        <section>
            <SectionToolbar descripcion="Grupos del curso seleccionado.">
                <div className="flex items-center gap-3">
                    <select
                        value={cursoId}
                        onChange={(e) => handleCursoChange(e.target.value)}
                        className={`rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition ${accentClasses[accent].ring}`}
                    >
                        <option value="">Selecciona un curso</option>
                        {cursos.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nombre}
                            </option>
                        ))}
                    </select>
                    <Button accent={accent} onClick={abrirModal} disabled={!cursoId}>
                        + Nuevo Grupo
                    </Button>
                </div>
            </SectionToolbar>

            {!cursoId ? (
                <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 py-16 text-sm text-slate-500">
                    Selecciona un curso para ver sus grupos.
                </div>
            ) : loadingGrupos ? (
                <div className="flex items-center justify-center py-16 text-sm text-slate-500">
                    Cargando grupos...
                </div>
            ) : (
                <DataTable columns={columnas} data={grupos} />
            )}

            {modalAbierto && (
                <Modal title="Crear nuevo grupo">
                    <form onSubmit={handleCrearGrupo} className="space-y-4">
                        <FormField
                            label="Nombre del grupo"
                            accent={accent}
                            type="text"
                            required
                            value={nuevoGrupoNombre}
                            onChange={(e) => setNuevoGrupoNombre(e.target.value)}
                        />

                        {error && (
                            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={cerrarModal}>
                                Cancelar
                            </Button>
                            <Button type="submit" accent={accent} disabled={creando}>
                                {creando ? "Creando..." : "Crear Grupo"}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </section>
    )
}
