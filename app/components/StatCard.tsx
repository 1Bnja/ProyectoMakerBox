"use client"

type Accent = "purple" | "pink" | "blue"

const dot: Record<Accent, string> = {
    purple: "bg-[#6B3FA0]",
    pink: "bg-[#E94E77]",
    blue: "bg-[#3AB0FF]",
}

interface StatCardProps {
    label: string
    value: string
    accent?: Accent
}

export function StatCard({ label, value, accent = "purple" }: StatCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(107,63,160,0.05)]">
            <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${dot[accent]}`} />
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    {label}
                </p>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                {value}
            </p>
        </div>
    )
}
