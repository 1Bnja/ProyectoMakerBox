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
        grupos,
        loading,
        modalAbierto,
        modalGrupoAbierto,
        editando,
        grupoLoading,
        grupoExito,
        grupoForm,
        form,
        abrirModalCrear,
        abrirModalEditar,
        abrirModalGrupo,
        cerrarModal,
        cerrarModalGrupo,
        handleGuardarEstudiante,
        handleGuardarGrupo,
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
            key: "grupo",
            header: "Grupo",
            render: (e) => e.grupos?.nombre ?? "—",
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
                                  <Button variant="outline" accent={accent} onClick={() => abrirModalGrupo(e)}>
                                      {e.grupos?.nombre ? "Cambiar grupo" : "Asignar grupo"}
                                  </Button>
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

            {grupoExito && (
                <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    {grupoExito}
                </p>
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

            {modalGrupoAbierto && grupoForm.estudiante && (
                <Modal title="Asignar grupo">
                    <form onSubmit={handleGuardarGrupo} className="space-y-4">
                        <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                            Estudiante: {grupoForm.estudiante.nombre} {grupoForm.estudiante.apellido}
                            {grupoForm.estudiante.grupos?.nombre ? ` · Grupo actual: ${grupoForm.estudiante.grupos.nombre}` : ""}
                        </div>

                        <FormSelect
                            label="Curso"
                            accent={accent}
                            required
                            value={grupoForm.cursoId}
                            onChange={(e) => grupoForm.setCursoId(e.target.value)}
                        >
                            <option value="">Selecciona un curso</option>
                            {(grupoForm.estudiante.cursos_asociados ?? []).map((curso) => (
                                <option key={curso.id} value={curso.id}>
                                    {curso.nombre}
                                </option>
                            ))}
                        </FormSelect>

                        <FormSelect
                            label="Grupo"
                            accent={accent}
                            required
                            value={grupoForm.grupoId}
                            onChange={(e) => grupoForm.setGrupoId(e.target.value)}
                            disabled={!grupoForm.cursoId || grupoLoading}
                        >
                            <option value="">{grupoLoading ? "Cargando grupos..." : "Selecciona un grupo"}</option>
                            {grupos.map((grupo) => (
                                <option key={grupo.id} value={grupo.id}>
                                    {grupo.nombre}
                                </option>
                            ))}
                        </FormSelect>

                        {grupoForm.error && (
                            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                                {grupoForm.error}
                            </p>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={cerrarModalGrupo}>
                                Cancelar
                            </Button>
                            <Button type="submit" accent={accent} disabled={grupoForm.submitting}>
                                {grupoForm.submitting ? "Guardando..." : "Guardar grupo"}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </section>
    )
}
