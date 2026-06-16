export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(107,63,160,0.06),transparent_38%),radial-gradient(circle_at_top_right,rgba(58,176,255,0.07),transparent_34%),linear-gradient(180deg,#f7f8fc_0%,#ffffff_60%)] text-slate-700">
            {children}
        </div>
    )
}
