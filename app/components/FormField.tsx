"use client"

import type { InputHTMLAttributes, SelectHTMLAttributes } from "react"
import { accentClasses, type Accent } from "./theme"

const inputBase =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition"

const labelClass = "mb-1.5 block text-xs font-medium text-slate-600"

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
    accent?: Accent
}

export function FormField({ label, accent = "purple", className = "", ...props }: FieldProps) {
    return (
        <div>
            <label className={labelClass}>{label}</label>
            <input className={`${inputBase} ${accentClasses[accent].ring} ${className}`} {...props} />
        </div>
    )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string
    accent?: Accent
}

export function FormSelect({
    label,
    accent = "purple",
    className = "",
    children,
    ...props
}: SelectProps) {
    return (
        <div>
            <label className={labelClass}>{label}</label>
            <select
                className={`${inputBase} bg-white ${accentClasses[accent].ring} ${className}`}
                {...props}
            >
                {children}
            </select>
        </div>
    )
}
