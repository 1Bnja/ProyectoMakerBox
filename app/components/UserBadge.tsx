"use client"

import { useEffect, useState } from "react"

interface Perfil {
    nombre: string
    apellido: string
    rol: string
}

/* Identidad del usuario autenticado, mostrada en la esquina superior derecha. */
export function UserBadge() {
    const [perfil, setPerfil] = useState<Perfil | null>(null)

    useEffect(() => {
        async function cargarPerfil() {
            const res = await fetch("/api/auth/me")
            if (res.ok) {
                setPerfil(await res.json())
            }
        }
        cargarPerfil()
    }, [])

    const nombreCompleto = perfil ? `${perfil.nombre} ${perfil.apellido}`.trim() : "—"
    const iniciales = perfil
        ? `${perfil.nombre.charAt(0)}${perfil.apellido.charAt(0)}`.toUpperCase()
        : "·"

    return (
        <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-slate-900">{nombreCompleto}</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4A2775] text-xs font-semibold text-white">
                {iniciales}
            </div>
        </div>
    )
}
