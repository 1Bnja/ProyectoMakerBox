"use client"

import { useState } from "react"
import { useAyudantias, type Ayudantia } from "@/app/hooks/useAyudantias"
import { DataTable, type Column } from "./DataTable"
import { SectionToolbar } from "./SectionToolbar"
import { FormField, FormSelect } from "./FormField"
import { Button } from "./Button"
import { Modal } from "./Modal"
import { ActivoToggle } from "./ActivoToggle"
import { diaLabel, diasOperativos } from "@/lib/sala/diasSemana"

interface CursoOption {
    id: string
    nombre: string
}

interface AyudantiasSectionProps {
    cursos: CursoOption[]
}

function formatHora(hora: string) {
    return hora.slice(0, 5)
}

export function AyudantiasSection({ cursos }: AyudantiasSectionProps) {
    const { ayudantias, loading, error, crear, toggleActivo } = useAyudantias()
    const [modalAbierto, setModalAbierto] = useState(false)
    const [cursoId, setCursoId] = useState("")
    const [dia, setDia] = useState(diasOperativos[0])
    const [horaInicio, setHoraInicio] = useState("")
    const [horaFin, setHoraFin] = useState("")
    const [cupos, setCupos] = useState("5")
    const [formError, setFormError] = useState("")
    const [creando, setCreando] = useState(false)
    const [ayudantiaInscritosId, setAyudantiaInscritosId] = useState<string | null>(null)

    const ayudantiaInscritos = ayudantias.find((a) => a.id === ayudantiaInscritosId) ?? null

    const columnas: Column<Ayudantia>[] = [
        { key: "curso", header: "Curso", render: (a) => a.curso?.nombre ?? "—" },
        {
            key: "ayudante",
            header: "Ayudante",
            render: (a) => (a.ayudante ? `${a.ayudante.nombre} ${a.ayudante.apellido}` : "—"),
        },
        { key: "dia", header: "Día", render: (a) => diaLabel[a.dia] ?? a.dia },
        { key: "horario", header: "Horario", render: (a) => `${formatHora(a.hora_inicio)}-${formatHora(a.hora_fin)}` },
        {
            key: "cupos",
            header: "Inscritos",
            render: (a) => (
                <button
                    onClick={() => setAyudantiaInscritosId(a.id)}
                    className="underline-offset-2 hover:underline"
                    disabled={a.inscritos === 0}
                >
                    {a.inscritos}/{a.cupos}
                </button>
            ),
        },
        {
            key: "activo",
            header: "",
            render: (a) => (
                <ActivoToggle activo={a.activo} labels={["Desactivar", "Activar"]} onClick={() => toggleActivo(a)} />
            ),
        },
    ]

    function abrirModal() {
        setCursoId("")
        setDia(diasOperativos[0])
        setHoraInicio("")
        setHoraFin("")
        setCupos("5")
        setFormError("")
        setModalAbierto(true)
    }

    async function handleCrear(event: React.FormEvent) {
        event.preventDefault()
        setFormError("")
        setCreando(true)

        const resultado = await crear({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            curso_id: cursoId,
            dia,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            hora_inicio: horaInicio,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            hora_fin: horaFin,
            cupos: Number(cupos),
        })

        setCreando(false)

        if (resultado.error) {
            setFormError(resultado.error)
            return
        }

        setModalAbierto(false)
    }

    return (
        <section>
            <SectionToolbar descripcion="Ayudantías de diseño 3D para los estudiantes de cada curso.">
                <Button accent="pink" onClick={abrirModal}>
                    + Nueva Ayudantía
                </Button>
            </SectionToolbar>

            {error && (
                <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-16 text-sm text-slate-500">
                    Cargando ayudantías...
                </div>
            ) : (
                <DataTable columns={columnas} data={ayudantias} />
            )}

            {modalAbierto && (
                <Modal title="Crear nueva ayudantía">
                    <form onSubmit={handleCrear} className="space-y-4">
                        <FormSelect
                            label="Curso"
                            accent="pink"
                            required
                            value={cursoId}
                            onChange={(e) => setCursoId(e.target.value)}
                        >
                            <option value="">Selecciona un curso</option>
                            {cursos.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nombre}
                                </option>
                            ))}
                        </FormSelect>

                        <FormSelect label="Día" accent="pink" value={dia} onChange={(e) => setDia(e.target.value)}>
                            {diasOperativos.map((d) => (
                                <option key={d} value={d}>
                                    {diaLabel[d]}
                                </option>
                            ))}
                        </FormSelect>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                label="Hora inicio"
                                accent="pink"
                                type="time"
                                required
                                value={horaInicio}
                                onChange={(e) => setHoraInicio(e.target.value)}
                            />
                            <FormField
                                label="Hora fin"
                                accent="pink"
                                type="time"
                                required
                                value={horaFin}
                                onChange={(e) => setHoraFin(e.target.value)}
                            />
                        </div>

                        <FormField
                            label="Cupos"
                            accent="pink"
                            type="number"
                            min={1}
                            required
                            value={cupos}
                            onChange={(e) => setCupos(e.target.value)}
                        />

                        {formError && (
                            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{formError}</p>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={() => setModalAbierto(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" accent="pink" disabled={creando}>
                                {creando ? "Creando..." : "Crear Ayudantía"}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {ayudantiaInscritos && (
                <Modal title="Estudiantes inscritos">
                    <ul className="space-y-2">
                        {ayudantiaInscritos.estudiantes.map((e, i) => (
                            <li key={i} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                                {e.nombre} {e.apellido}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 flex justify-end">
                        <Button type="button" variant="secondary" onClick={() => setAyudantiaInscritosId(null)}>
                            Cerrar
                        </Button>
                    </div>
                </Modal>
            )}
        </section>
    )
}
