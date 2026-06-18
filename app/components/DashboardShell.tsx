"use client"

import type { Rol } from "@/lib/auth/roles"
import { Sidebar } from "./Sidebar"
import { UserBadge } from "./UserBadge"

interface DashboardShellProps {
    rol: Rol
    tab: string
    onTabChange: (tab: string) => void
    title: string
    children: React.ReactNode
}

/* Estructura común de todas las vistas del dashboard:
   Sidebar + área principal con cabecera y contenido. */
export function DashboardShell({ rol, tab, onTabChange, title, children }: DashboardShellProps) {
    return (
        <div className="flex w-full">
            <Sidebar rol={rol} activeTab={tab} onTabChange={onTabChange} />

            <main className="flex-1 overflow-auto">
                <header className="flex items-center justify-between border-b border-slate-200 bg-white/70 px-8 py-5 backdrop-blur-sm">
                    <h1 className="text-lg font-semibold text-slate-900 capitalize">{title}</h1>
                    <UserBadge />
                </header>

                <div className="p-8">{children}</div>
            </main>
        </div>
    )
}
