"use client"

interface StatusBadgeProps {
    status: string
}

/* eslint-disable @typescript-eslint/naming-convention */
const styles: Record<string, string> = {
    PENDIENTE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    APROBADA: "bg-green-500/10 text-green-400 border-green-500/20",
    RECHAZADA: "bg-red-500/10 text-red-400 border-red-500/20",
    EN_PROGRESO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    IMPRESA: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    Activo: "bg-green-500/10 text-green-400 border-green-500/20",
    Inactivo: "bg-slate-500/10 text-slate-400 border-slate-500/20",
}
/* eslint-enable @typescript-eslint/naming-convention */

export function StatusBadge({ status }: StatusBadgeProps) {
    const s = styles[status] ?? "bg-slate-500/10 text-slate-400 border-slate-500/20"
    return (
        <span
            className={
                `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${s}`
            }
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status}
        </span>
    )
}
