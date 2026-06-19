"use client"

import type { ButtonHTMLAttributes } from "react"
import { accentClasses, type Accent } from "./theme"

type Variant = "primary" | "secondary" | "outline"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
    accent?: Accent
    fullWidth?: boolean
}

export function Button({
    variant = "primary",
    accent = "purple",
    fullWidth = false,
    className = "",
    children,
    ...props
}: ButtonProps) {
    const ac = accentClasses[accent]

    const base =
        variant === "outline"
            ? "rounded-md border px-2.5 py-1 text-xs transition-colors"
            : "rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"

    const byVariant: Record<Variant, string> = {
        primary: `${ac.solidText} shadow-sm ${ac.solid}`,
        secondary:
            "border border-slate-200 text-slate-600 hover:bg-slate-50",
        outline: ac.outline,
    }

    return (
        <button
            className={`${base} ${byVariant[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}
