"use client"

interface SectionToolbarProps {
    descripcion: React.ReactNode
    children?: React.ReactNode
}

/* Cabecera de sección: texto descriptivo a la izquierda y acciones a la derecha. */
export function SectionToolbar({ descripcion, children }: SectionToolbarProps) {
    return (
        <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">{descripcion}</p>
            {children}
        </div>
    )
}
