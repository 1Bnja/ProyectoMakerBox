export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-[#0c0e14] text-[#e2e8f0]">
            {children}
        </div>
    )
}
