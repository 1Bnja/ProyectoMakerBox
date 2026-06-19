"use client"

interface ActivoToggleProps {
    activo: boolean
    /** Texto del botón: [cuando está activo, cuando está inactivo]. */
    labels: [string, string]
    onClick: () => void
}

/* Botón para habilitar/deshabilitar un registro (verde/rojo según estado). */
export function ActivoToggle({ activo, labels, onClick }: ActivoToggleProps) {
    return (
        <button
            onClick={onClick}
            className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                activo
                    ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                    : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            }`}
        >
            {activo ? labels[0] : labels[1]}
        </button>
    )
}
