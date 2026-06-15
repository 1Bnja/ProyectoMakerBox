"use client"

import type { Rol } from "@/lib/auth/roles"

interface MenuItem {
    id: string
    label: string
    icon: React.ReactNode
}

/* eslint-disable @typescript-eslint/naming-convention */
const items: Record<Rol, MenuItem[]> = {
    ADMIN: [
        { id: "usuarios", label: "Usuarios", icon: <UsersSvg /> },
        { id: "cursos", label: "Cursos", icon: <BookSvg /> },
        { id: "inventario", label: "Inventario", icon: <BoxSvg /> },
        { id: "solicitudes", label: "Solicitudes", icon: <FileSvg /> },
    ],
    AYUDANTE: [
        { id: "solicitudes", label: "Solicitudes", icon: <FileSvg /> },
        { id: "sala", label: "Disponibilidad Sala", icon: <CalendarSvg /> },
        { id: "filamento", label: "Registro Filamento", icon: <DropletSvg /> },
    ],
    PROFESOR: [
        { id: "ayudantias", label: "Ayudantías", icon: <HatSvg /> },
        { id: "sala", label: "Reservar Sala", icon: <CalendarSvg /> },
    ],
    ESTUDIANTE: [
        { id: "solicitudes", label: "Mis Solicitudes", icon: <FileSvg /> },
        { id: "ayudantias", label: "Ayudantías", icon: <HatSvg /> },
        { id: "sala", label: "Reservar Sala", icon: <CalendarSvg /> },
    ],
    SOLICITANTE: [
        { id: "nueva-solicitud", label: "Nueva Solicitud", icon: <PlusSvg /> },
        { id: "solicitudes", label: "Mis Solicitudes", icon: <FileSvg /> },
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

    return (
        <aside className="flex h-full w-64 flex-col border-r border-[#1e2235] bg-[#0f1119]">
            <div className="flex items-center gap-3 border-b border-[#1e2235] px-5 py-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-xs font-bold text-cyan-400">
                    MB
                </div>
                <div>
                    <p className="text-sm font-semibold text-[#e2e8f0]">MakerBox</p>
                    <p className="text-xs text-[#64748b] capitalize">{rol.toLowerCase()}</p>
                </div>
            </div>

            <nav className="flex-1 space-y-1 p-3">
                {menu.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                            activeTab === item.id
                                ? "bg-cyan-500/10 text-cyan-400"
                                : "text-[#94a3b8] hover:bg-[#1a1d2e]/50 hover:text-[#e2e8f0]"
                        }`}
                    >
                        <span className="h-5 w-5">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="border-t border-[#1e2235] p-4">
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-[#64748b]">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Sistema operativo
                </div>
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
