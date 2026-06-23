"use client"

import { StatusBadge } from "./StatusBadge"
import { DataTable, type Column } from "./DataTable"
import { Button } from "./Button"
import { Modal } from "./Modal"
import { FormField, FormSelect } from "./FormField"
import { SectionToolbar } from "./SectionToolbar"
import { ActivoToggle } from "./ActivoToggle"
import type { Accent } from "./theme"
import { useEstudiantes, type Estudiante } from "@/app/hooks/useEstudiantes"

interface EstudiantesSectionProps {
    accent: Accent
    descripcion: string
    botonLabel: string
    modalTitle: string
    /** Contenido extra que se muestra bajo la tabla (p. ej. tarjetas informativas). */
    children?: React.ReactNode
    /** El profesor solo visualiza a sus estudiantes: sin crear, editar ni (des)habilitar. */
    soloLectura?: boolean
}

/* Sección reutilizable de visualización/gestión de estudiantes usada por ayudante (CRUD) y profesor (solo lectura). */
export function EstudiantesSection({
    accent,
    descripcion,
    botonLabel,
    modalTitle,
    children,
    soloLectura = false,
}: EstudiantesSectionProps) {
    const {
        estudiantes,
        cursos,
        loading,
        modalAbierto,
        editando,
        form,
        abrirModalCrear,
        abrirModalEditar,
        cerrarModal,
        handleGuardarEstudiante,
        handleToggleActivo,
    } = useEstudiantes()

    const columnas: Column<Estudiante>[] = [
        {
            key: "nombre",
            header: "Nombre",
            render: (e) => `${e.nombre} ${e.apellido}`,
        },
        { key: "email", header: "Email" },
        {
            key: "curso",
            header: "Curso",
            render: (e) => e.cursos?.nombre ?? "—",
        },
        {
            key: "estado",
            header: "Estado",
            render: (e) => <StatusBadge status={e.activo ? "Activo" : "Inactivo"} />,
        },
        ...(soloLectura
            ? []
            : [
                  {
                      key: "acciones",
                      header: "",
                      render: (e: Estudiante) => (
                          <div className="flex gap-2">
                              <Button variant="outline" accent={accent} onClick={() => abrirModalEditar(e)}>
                                  Editar
                              </Button>
                              <ActivoToggle
                                  activo={e.activo}
                                  labels={["Retirar", "Reactivar"]}
                                  onClick={() => handleToggleActivo(e)}
                              />
                          </div>
                      ),
                  } satisfies Column<Estudiante>,
              ]),
    ]

    return (
        <section>
            <SectionToolbar descripcion={descripcion}>
                {!soloLectura && (
                    <Button accent={accent} onClick={abrirModalCrear}>
                        {botonLabel}
                    </Button>
                )}
            </SectionToolbar>

            {loading ? (
                <div className="flex items-center justify-center py-16 text-sm text-slate-500">
                    Cargando estudiantes...
                </div>
            ) : (
                <DataTable columns={columnas} data={estudiantes} />
            )}

            {children}

            {modalAbierto && (
                <Modal title={editando ? "Editar estudiante" : modalTitle}>
                    <form onSubmit={handleGuardarEstudiante} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                label="Nombre"
                                accent={accent}
                                type="text"
                                required
                                value={form.nombre}
                                onChange={(e) => form.setNombre(e.target.value)}
                            />
                            <FormField
                                label="Apellido"
                                accent={accent}
                                type="text"
                                required
                                value={form.apellido}
                                onChange={(e) => form.setApellido(e.target.value)}
                            />
                        </div>

                        {!editando && (
                            <>
                                <FormField
                                    label="Email"
                                    accent={accent}
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => form.setEmail(e.target.value)}
                                />
                                <FormField
                                    label="Contraseña"
                                    accent={accent}
                                    type="password"
                                    required
                                    minLength={6}
                                    value={form.password}
                                    onChange={(e) => form.setPassword(e.target.value)}
                                />
                            </>
                        )}

                        <FormSelect
                            label="Curso (opcional)"
                            accent={accent}
                            value={form.cursoId}
                            onChange={(e) => form.setCursoId(e.target.value)}
                        >
                            <option value="">Sin curso</option>
                            {cursos.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nombre}
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
                            <Button type="submit" accent={accent} disabled={form.submitting}>
                                {form.submitting ? "Guardando..." : editando ? "Guardar Cambios" : "Crear Estudiante"}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </section>
    )
}
