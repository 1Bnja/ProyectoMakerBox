"use client"

import { accentClasses, type Accent } from "./theme"

interface FilterPillProps {
    label: string
    active?: boolean
    accent?: Accent
    onClick?: () => void
}

export function FilterPill({ label, active = false, accent = "purple", onClick }: FilterPillProps) {
    const ac = accentClasses[accent]
    return (
        <button
            onClick={onClick}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                active ? ac.pillActive : ac.pillInactive
            }`}
        >
            {label}
        </button>
    )
}
