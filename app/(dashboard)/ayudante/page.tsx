"use client"

import { useEffect, useState } from "react"
import { StatusBadge } from "@/app/components/StatusBadge"
import { StatCard } from "@/app/components/StatCard"
import { DataTable, type Column } from "@/app/components/DataTable"
import { DashboardShell } from "@/app/components/DashboardShell"
import { EstudiantesSection } from "@/app/components/EstudiantesSection"
import { CursosSection } from "@/app/components/CursosSection"
import { SectionToolbar } from "@/app/components/SectionToolbar"
import { FilterPill } from "@/app/components/FilterPill"
import { Button } from "@/app/components/Button"
import { SolicitudDetalleModal } from "@/app/components/SolicitudDetalleModal"

interface Solicitud {
    id: string
    tipo: string
    estado: string
    comentario: string | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    motivo_rechazo: string | null
    // eslint-disable-next-line @typescript-eslint/naming-convention
    created_at: string
    solicitante: { nombre: string; apellido: string } | null
}

const estadosFiltrables = ["PENDIENTE", "APROBADA", "RECHAZADA", "EN_PROCESO", "FINALIZADA"]

interface Bloque {
    dia: string
    hora: string
    disponible: boolean
}

interface ItemInv {
    articulo: string
    color: string
    stock: number
    minimo: number
}

const inventario: ItemInv[] = [
    { articulo: "Filamento PLA 1.75mm", color: "Negro", stock: 12, minimo: 5 },
    { articulo: "Filamento PLA 1.75mm", color: "Blanco", stock: 3, minimo: 5 },
    { articulo: "Filamento PLA 1.75mm", color: "Rojo", stock: 8, minimo: 5 },
    { articulo: "Filamento PETG 1.75mm", color: "Transparente", stock: 6, minimo: 3 },
    { articulo: "Resina UV", color: "Gris", stock: 2, minimo: 4 },
]

const colsInv: Column<ItemInv>[] = [
    { key: "articulo", header: "Artículo" },
    { key: "color", header: "Color" },
    { key: "stock", header: "Stock" },
    { key: "minimo", header: "Stock Mín." },
    {
        key: "alerta",
        header: "Alerta",
        render: (i) =>
            i.stock <= i.minimo ? (
                <span className="text-xs font-medium text-rose-600">Stock bajo</span>
            ) : (
                <span className="text-xs text-slate-400">OK</span>
            ),
    },
]

const horarios: Bloque[] = [
    { dia: "Lun", hora: "09:00-10:00", disponible: true },
    { dia: "Lun", hora: "10:00-11:00", disponible: false },
    { dia: "Lun", hora: "11:00-12:00", disponible: true },
    { dia: "Mar", hora: "09:00-10:00", disponible: true },
    { dia: "Mar", hora: "10:00-11:00", disponible: true },
    { dia: "Mar", hora: "11:00-12:00", disponible: false },
    { dia: "Mié", hora: "09:00-10:00", disponible: false },
    { dia: "Mié", hora: "10:00-11:00", disponible: true },
    { dia: "Mié", hora: "11:00-12:00", disponible: true },
    { dia: "Jue", hora: "09:00-10:00", disponible: true },
    { dia: "Jue", hora: "10:00-11:00", disponible: true },
    { dia: "Jue", hora: "11:00-12:00", disponible: true },
    { dia: "Vie", hora: "09:00-10:00", disponible: true },
    { dia: "Vie", hora: "10:00-11:00", disponible: false },
    { dia: "Vie", hora: "11:00-12:00", disponible: false },
]

interface RegistroFilamento {
    fecha: string
    solicitud: string
    material: string
    gramos: number
    usuario: string
}

const filamentos: RegistroFilamento[] = [
    { fecha: "2026-06-14", solicitud: "S-001", material: "PLA Negro", gramos: 45, usuario: "Lukas Avello" },
    { fecha: "2026-06-13", solicitud: "S-002", material: "PLA Blanco", gramos: 120, usuario: "Camila Rojas" },
    { fecha: "2026-06-12", solicitud: "S-003", material: "PETG Transparente", gramos: 78, usuario: "Lukas Avello" },
    { fecha: "2026-06-11", solicitud: "S-004", material: "PLA Rojo", gramos: 32, usuario: "Camila Rojas" },
]

const colsFilamento: Column<RegistroFilamento>[] = [
    { key: "fecha", header: "Fecha" },
    { key: "solicitud", header: "Solicitud" },
    { key: "material", header: "Material" },
    { key: "gramos", header: "Gramos" },
    { key: "usuario", header: "Registrado por" },
]

export default function AyudantePage() {
    const [tab, setTab] = useState("solicitudes")
    const [filtroEstado, setFiltroEstado] = useState<string | null>(null)
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true)
    const [errorSolicitudes, setErrorSolicitudes] = useState("")
    const [detalleId, setDetalleId] = useState<string | null>(null)

    async function cargarSolicitudes(estado: string | null) {
        setLoadingSolicitudes(true)
        setErrorSolicitudes("")
        const url = estado ? `/api/solicitudes?estado=${estado}` : "/api/solicitudes"
        const res = await fetch(url)
        const data = await res.json()

        if (!res.ok) {
            setErrorSolicitudes(data.error ?? "No se pudieron cargar las solicitudes")
            setLoadingSolicitudes(false)
            return
        }

        setSolicitudes(data)
        setLoadingSolicitudes(false)
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarSolicitudes(filtroEstado)
    }, [filtroEstado])

    const colsSolicitudes: Column<Solicitud>[] = [
        {
            key: "solicitante",
            header: "Solicitante",
            render: (s) => (s.solicitante ? `${s.solicitante.nombre} ${s.solicitante.apellido}` : "—"),
        },
        { key: "tipo", header: "Tipo" },
        {
            key: "estado",
            header: "Estado",
            render: (s) => <StatusBadge status={s.estado} />,
        },
        {
            key: "created_at",
            header: "Fecha",
            render: (s) => new Date(s.created_at).toLocaleDateString("es-CL"),
        },
        {
            key: "acciones",
            header: "",
            render: (s) => (
                <button
                    onClick={() => setDetalleId(s.id)}
                    className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-50"
                >
                    Ver detalle
                </button>
            ),
        },
    ]

    return (
        <DashboardShell rol="AYUDANTE" tab={tab} onTabChange={setTab} title={tab}>
            {tab === "solicitudes" && (
                <section>
                    <div className="mb-6 grid grid-cols-4 gap-4">
                        <StatCard
                            label="Pendientes"
                            value={String(solicitudes.filter((s) => s.estado === "PENDIENTE").length)}
                            accent="pink"
                        />
                        <StatCard
                            label="En proceso"
                            value={String(solicitudes.filter((s) => s.estado === "EN_PROCESO").length)}
                            accent="blue"
                        />
                        <StatCard
                            label="Aprobadas"
                            value={String(solicitudes.filter((s) => s.estado === "APROBADA").length)}
                            accent="purple"
                        />
                        <StatCard
                            label="Rechazadas"
                            value={String(solicitudes.filter((s) => s.estado === "RECHAZADA").length)}
                            accent="pink"
                        />
                    </div>

                    <SectionToolbar descripcion={filtroEstado ? "Resultados filtrados" : "Todas las solicitudes de impresión."}>
                        <div className="flex gap-2 items-center">
                            <span className="text-xs font-medium text-slate-500 w-16">Estado:</span>
                            <FilterPill label="Todos" accent="pink" active={!filtroEstado} onClick={() => setFiltroEstado(null)} />
                            {estadosFiltrables.map((e) => (
                                <FilterPill
                                    key={e}
                                    label={e.replace("_", " ")}
                                    accent="pink"
                                    active={filtroEstado === e}
                                    onClick={() => setFiltroEstado(e)}
                                />
                            ))}
                        </div>
                    </SectionToolbar>

                    {errorSolicitudes && (
                        <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{errorSolicitudes}</p>
                    )}

                    {loadingSolicitudes ? (
                        <div className="flex items-center justify-center py-16 text-sm text-slate-500">
                            Cargando solicitudes...
                        </div>
                    ) : (
                        <DataTable columns={colsSolicitudes} data={solicitudes} />
                    )}

                    {detalleId && (
                        <SolicitudDetalleModal
                            id={detalleId}
                            onClose={() => setDetalleId(null)}
                            onCambioEstado={() => cargarSolicitudes(filtroEstado)}
                        />
                    )}
                </section>
            )}

            {tab === "cursos" && <CursosSection />}

            {tab === "estudiantes" && (
                <EstudiantesSection
                    accent="pink"
                    descripcion="Estudiantes registrados en el sistema."
                    botonLabel="+ Nuevo Estudiante"
                    modalTitle="Inscribir nuevo estudiante"
                />
            )}

            {tab === "inventario" && (
                <section>
                    <SectionToolbar descripcion="Artículos disponibles en inventario.">
                        <Button accent="pink">+ Agregar Artículo</Button>
                    </SectionToolbar>
                    <DataTable columns={colsInv} data={inventario} />
                </section>
            )}

            {tab === "sala" && (
                <section>
                    <p className="mb-6 text-sm text-slate-500">Disponibilidad de la sala para la semana.</p>
                    <div className="grid grid-cols-5 gap-3">
                        {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].map((dia, di) => (
                            <div key={dia} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(74,39,117,0.05)]">
                                <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                                    {dia}
                                </p>
                                <div className="space-y-2">
                                    {horarios
                                        .filter((b) => b.dia === ["Lun", "Mar", "Mié", "Jue", "Vie"][di])
                                        .map((b, i) => (
                                            <div
                                                key={i}
                                                className={`rounded-lg border px-3 py-2 text-center text-xs ${
                                                    b.disponible
                                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                        : "border-rose-200 bg-rose-50 text-rose-600"
                                                }`}
                                            >
                                                {b.hora}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {tab === "filamento" && (
                <section>
                    <div className="mb-6 grid grid-cols-3 gap-4">
                        <StatCard label="Filamento usado hoy" value="165g" accent="pink" />
                        <StatCard label="Filamento usado esta semana" value="720g" accent="purple" />
                        <StatCard label="Rollos activos" value="6" accent="blue" />
                    </div>
                    <SectionToolbar descripcion="Registro de uso de filamento.">
                        <Button accent="pink">+ Registrar Uso</Button>
                    </SectionToolbar>
                    <DataTable columns={colsFilamento} data={filamentos} />
                </section>
            )}
        </DashboardShell>
    )
}