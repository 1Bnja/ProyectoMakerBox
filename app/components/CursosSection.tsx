"use client"

import { StatusBadge } from "./StatusBadge"
import { DataTable, type Column } from "./DataTable"
import { Button } from "./Button"
import { Modal } from "./Modal"
import { FormField, FormSelect } from "./FormField"
import { SectionToolbar } from "./SectionToolbar"
import { ActivoToggle } from "./ActivoToggle"
import { useCursos, type Curso } from "@/app/hooks/useCursos"

/* Sección de gestión de cursos para el panel de administración (CUR-01). */
export function CursosSection() {
    const {
        cursos,
        ayudantes,
        loading,
        modalAbierto,
        editando,
        form,
        abrirModalCrear,
        abrirModalEditar,
        cerrarModal,
        handleGuardarCurso,
        handleToggleActivo,
    } = useCursos()

    const columnas: Column<Curso>[] = [
        { key: "nombre", header: "Curso" },
        {
            key: "sigla",
            header: "Sigla",
            render: (c) => c.sigla ?? "—",
        },
        {
            key: "ayudante",
            header: "Ayudante",
            render: (c) => (c.ayudante ? `${c.ayudante.nombre} ${c.ayudante.apellido}` : "—"),
        },
        { key: "estudiantes", header: "Estudiantes" },
        {
            key: "estado",
            header: "Estado",
            render: (c) => <StatusBadge status={c.activo ? "Activo" : "Inactivo"} />,
        },
        {
            key: "acciones",
            header: "",
            render: (c) => (
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => abrirModalEditar(c)}>
                        Editar
                    </Button>
                    <ActivoToggle
                        activo={c.activo}
                        labels={["Desactivar", "Activar"]}
                        onClick={() => handleToggleActivo(c)}
                    />
                </div>
            ),
        },
    ]

    return (
        <section>
            <SectionToolbar descripcion="Cursos registrados en el sistema.">
                <Button onClick={abrirModalCrear}>+ Nuevo Curso</Button>
            </SectionToolbar>

            {loading ? (
                <div className="flex items-center justify-center py-16 text-sm text-slate-500">
                    Cargando cursos...
                </div>
            ) : (
                <DataTable columns={columnas} data={cursos} />
            )}

            {modalAbierto && (
                <Modal title={editando ? "Editar curso" : "Crear nuevo curso"}>
                    <form onSubmit={handleGuardarCurso} className="space-y-4">
                        <FormField
                            label="Nombre"
                            type="text"
                            required
                            value={form.nombre}
                            onChange={(e) => form.setNombre(e.target.value)}
                        />
                        <FormField
                            label="Sigla"
                            type="text"
                            value={form.sigla}
                            onChange={(e) => form.setSigla(e.target.value)}
                        />
                        <FormSelect
                            label="Ayudante (opcional)"
                            value={form.ayudanteId}
                            onChange={(e) => form.setAyudanteId(e.target.value)}
                        >
                            <option value="">Sin ayudante</option>
                            {ayudantes.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.nombre} {a.apellido}
                                </option>
                            ))}
                        </FormSelect>

                        {form.error && (
                            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                                {form.error}
                            </p>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={cerrarModal}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.submitting}>
                                {form.submitting ? "Guardando..." : editando ? "Guardar Cambios" : "Crear Curso"}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </section>
    )
}
