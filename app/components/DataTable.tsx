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
            <div className="flex items-center justify-center rounded-xl border border-dashed border-[#1e2235] py-16 text-sm text-[#64748b]">
                No hay registros disponibles
            </div>
        )
    }

    return (
        <div className="overflow-hidden rounded-xl border border-[#1e2235]">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-[#1e2235] bg-[#1a1d2e]/50">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#64748b]"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2235]">
                    {data.map((item, i) => (
                        <tr
                            key={i}
                            className="transition-colors hover:bg-[#1a1d2e]/30"
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className="whitespace-nowrap px-4 py-3 text-sm text-[#e2e8f0]"
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
