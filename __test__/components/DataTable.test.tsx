import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DataTable, type Column } from '@/app/components/DataTable'

interface Fila {
    id: string
    nombre: string
}

const columnas: Column<Fila>[] = [
    { key: 'nombre', header: 'Nombre' },
]

describe('DataTable', () => {
    it('muestra el mensaje de vacío cuando no hay datos', () => {
        render(<DataTable columns={columnas} data={[]} />)
        expect(screen.getByText('No hay registros disponibles')).toBeInTheDocument()
    })

    it('renderiza las filas cuando hay datos', () => {
        render(<DataTable columns={columnas} data={[{ id: '1', nombre: 'Ana' }]} />)
        expect(screen.getByText('Ana')).toBeInTheDocument()
        expect(screen.getByText('Nombre')).toBeInTheDocument()
    })

    it('usa render personalizado de columna cuando se define', () => {
        const columnasConRender: Column<Fila>[] = [
            { key: 'nombre', header: 'Nombre', render: (f) => `Sr. ${f.nombre}` },
        ]
        render(<DataTable columns={columnasConRender} data={[{ id: '1', nombre: 'Ana' }]} />)
        expect(screen.getByText('Sr. Ana')).toBeInTheDocument()
    })
})
