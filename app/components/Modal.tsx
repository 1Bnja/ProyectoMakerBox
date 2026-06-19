"use client"

interface ModalProps {
    title: string
    children: React.ReactNode
}

export function Modal({ title, children }: ModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">{title}</h2>
                {children}
            </div>
        </div>
    )
}
