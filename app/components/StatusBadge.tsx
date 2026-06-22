"use client"

interface StatusBadgeProps {
    status: string
}

/* eslint-disable @typescript-eslint/naming-convention */
const styles: Record<string, string> = {
    PENDIENTE: "bg-amber-50 text-amber-700 border-amber-200",
    APROBADA: "bg-emerald-50 text-emerald-700 border-emerald-200",
    RECHAZADA: "bg-rose-50 text-rose-700 border-rose-200",
    EN_PROGRESO: "bg-[#50D4F2]/15 text-[#1c7f99] border-[#50D4F2]/40",
    EN_PROCESO: "bg-[#50D4F2]/15 text-[#1c7f99] border-[#50D4F2]/40",
    IMPRESA: "bg-[#4A2775]/10 text-[#4A2775] border-[#4A2775]/25",
    FINALIZADA: "bg-[#4A2775]/10 text-[#4A2775] border-[#4A2775]/25",
    Activo: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Inactivo: "bg-slate-100 text-slate-500 border-slate-200",
}
/* eslint-enable @typescript-eslint/naming-convention */

export function StatusBadge({ status }: StatusBadgeProps) {
    const s = styles[status] ?? "bg-slate-100 text-slate-500 border-slate-200"
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
