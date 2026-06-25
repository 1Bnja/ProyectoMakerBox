"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { Rol } from "@/lib/auth/roles"
import { logout } from "@/lib/auth/logout"

interface MenuItem {
    id: string
    label: string
    icon: React.ReactNode
}

/* eslint-disable @typescript-eslint/naming-convention */
const items: Record<Rol, MenuItem[]> = {
    ADMIN: [
        { id: "usuarios", label: "Usuarios", icon: <UsersSvg /> },
    ],
    AYUDANTE: [
        { id: "solicitudes", label: "Solicitudes", icon: <FileSvg /> },
        { id: "cursos", label: "Cursos", icon: <BookSvg /> },
        { id: "estudiantes", label: "Estudiantes", icon: <UsersSvg /> },
        { id: "grupos", label: "Grupos", icon: <GroupSvg /> },
        { id: "inventario", label: "Inventario", icon: <BoxSvg /> },
        { id: "sala", label: "Disponibilidad Sala", icon: <CalendarSvg /> },
        { id: "filamento", label: "Registro Filamento", icon: <DropletSvg /> },
    ],
    PROFESOR: [
        { id: "cursos", label: "Cursos", icon: <BookSvg /> },
        { id: "estudiantes", label: "Estudiantes", icon: <UsersSvg /> },
        { id: "grupos", label: "Grupos", icon: <GroupSvg /> },
        { id: "solicitudes", label: "Solicitudes", icon: <FileSvg /> },
    ],
    ESTUDIANTE: [
        { id: "solicitudes", label: "Mis Solicitudes", icon: <FileSvg /> },
        { id: "ayudantias", label: "Ayudantías", icon: <HatSvg /> },
    ],
    SOLICITANTE: [
        { id: "nueva-solicitud", label: "Nueva Solicitud", icon: <PlusSvg /> },
        { id: "solicitudes", label: "Mis Solicitudes", icon: <FileSvg /> },
        { id: "sala", label: "Reservar Sala", icon: <CalendarSvg /> },
    ],
}
/* eslint-enable @typescript-eslint/naming-convention */

interface SidebarProps {
    rol: Rol
    activeTab: string
    onTabChange: (tab: string) => void
}

export function Sidebar({ rol, activeTab, onTabChange }: SidebarProps) {
    const menu = items[rol]
    const router = useRouter()
    const [cerrando, setCerrando] = useState(false)

    async function handleLogout() {
        setCerrando(true)
        const resultado = await logout()
        if ("error" in resultado) {
            setCerrando(false)
            return
        }
        router.replace("/login")
    }

    return (
        <aside className="flex h-full w-64 flex-col bg-[#4A2775]">
            <div className="border-b border-white/10 px-5 py-5">
                <div className="rounded-xl bg-white p-3">
                    <Image
                        src="/logo.jpg"
                        alt="MakerBox"
                        width={712}
                        height={259}
                        className="h-auto w-full object-contain"
                        priority
                    />
                </div>
            </div>

            <nav className="flex-1 space-y-1 p-3">
                {menu.map((item) => {
                    const isActive = activeTab === item.id
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                                isActive
                                    ? "bg-white/10 text-white"
                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            {isActive && (
                                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#50D4F2]" />
                            )}
                            <span className="h-5 w-5">{item.icon}</span>
                            {item.label}
                        </button>
                    )
                })}
            </nav>

            <div className="space-y-1 border-t border-white/10 p-3">
                <button
                    onClick={handleLogout}
                    disabled={cerrando}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <span className="h-5 w-5">
                        <LogoutSvg />
                    </span>
                    {cerrando ? "Cerrando sesión…" : "Cerrar sesión"}
                </button>
            </div>
        </aside>
    )
}

/* ---------- inline SVGs ---------- */

function UsersSvg() {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-full w-full">
            <path d="M14 17v-1.5A2.5 2.5 0 0011.5 13h-3A2.5 2.5 0 006 15.5V17M10 10a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
    )
}

function BookSvg() {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-full w-full">
            <path d="M4 4.5A1.5 1.5 0 015.5 3h9A1.5 1.5 0 0116 4.5v13a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 014 17.5V4.5z" />
            <path d="M8 7h4M8 10h4" />
        </svg>
    )
}

function BoxSvg() {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-full w-full">
            <path d="M2.5 5.5l7.5 4 7.5-4M10 17.5V9.5" />
            <path d="M2.5 5.5v9l7.5 4 7.5-4v-9L10 1.5 2.5 5.5z" />
        </svg>
    )
}

function FileSvg() {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-full w-full">
            <path d="M13 1.5H6A1.5 1.5 0 004.5 3v14A1.5 1.5 0 006 18.5h8a1.5 1.5 0 001.5-1.5V5l-2.5-3.5z" />
            <path d="M13 1.5V5a1.5 1.5 0 001.5 1.5H18" />
            <path d="M7.5 9.5h5M7.5 12.5h5" />
        </svg>
    )
}

function CalendarSvg() {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-full w-full">
            <rect x="2.5" y="4" width="15" height="14" rx="1.5" />
            <path d="M2.5 8.5h15M6.5 2v3M13.5 2v3" />
        </svg>
    )
}

function DropletSvg() {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-full w-full">
            <path d="M10 17.5a5.5 5.5 0 005.5-5.5c0-2.8-3.5-7.5-5.5-10-2 2.5-5.5 7.2-5.5 10a5.5 5.5 0 005.5 5.5z" />
        </svg>
    )
}

function GroupSvg() {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-full w-full">
            <circle cx="7" cy="7" r="2.5" />
            <circle cx="13.5" cy="8.5" r="2" />
            <path d="M3 17v-1a4 4 0 014-4h0a4 4 0 014 4v1" />
            <path d="M12 16v-.5a3 3 0 013-3h0a3 3 0 013 3V16" />
        </svg>
    )
}

function HatSvg() {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-full w-full">
            <path d="M10 2.5L2.5 7l7.5 4.5L17.5 7 10 2.5z" />
            <path d="M2.5 7v5.5l7.5 4.5 7.5-4.5V7" />
            <path d="M6.5 9v3.5l3.5 2" />
        </svg>
    )
}

function PlusSvg() {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-full w-full">
            <path d="M10 4v12M4 10h12" />
        </svg>
    )
}

function LogoutSvg() {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
            <path d="M8 17.5H5A1.5 1.5 0 013.5 16V4A1.5 1.5 0 015 2.5h3" />
            <path d="M13 14l4-4-4-4M17 10H8" />
        </svg>
    )
}
