"use client"

export interface Column<T> {
    key: string
    header: string
    render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
    columns: Column<T>[]
    data: T[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
    columns,
    data,
}: DataTableProps<T>) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 py-16 text-sm text-slate-500">
                No hay registros disponibles
            </div>
        )
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(74,39,117,0.05)]">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.map((item, i) => (
                        <tr
                            key={i}
                            className="transition-colors hover:bg-[#4A2775]/[0.04]"
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className="whitespace-nowrap px-4 py-3 text-sm text-slate-700"
                                >
                                    {col.render
                                        ? col.render(item)
                                        : String(item[col.key] ?? "")}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
