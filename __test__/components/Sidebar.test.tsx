import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Sidebar } from '@/app/components/Sidebar'
import { logout } from '@/lib/auth/logout'

const replace = vi.fn()

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace,
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
}))

vi.mock('next/image', () => ({
    // eslint-disable-next-line @next/next/no-img-element
    default: (props: Record<string, unknown>) => <img {...props} alt={props.alt as string} />,
}))

vi.mock('@/lib/auth/logout', () => ({
    logout: vi.fn(),
}))

describe('Sidebar', () => {
    beforeEach(() => {
        replace.mockClear()
        vi.mocked(logout).mockReset()
    })

    it('muestra el menú correspondiente al rol ADMIN', () => {
        render(<Sidebar rol="ADMIN" activeTab="usuarios" onTabChange={vi.fn()} />)
        expect(screen.getByText('Usuarios')).toBeInTheDocument()
    })

    it('muestra el menú correspondiente al rol AYUDANTE, incluyendo Cursos e Inventario', () => {
        render(<Sidebar rol="AYUDANTE" activeTab="solicitudes" onTabChange={vi.fn()} />)
        expect(screen.getByText('Solicitudes')).toBeInTheDocument()
        expect(screen.getByText('Cursos')).toBeInTheDocument()
        expect(screen.getByText('Estudiantes')).toBeInTheDocument()
        expect(screen.getByText('Inventario')).toBeInTheDocument()
    })

    it('muestra el menú correspondiente al rol ESTUDIANTE', () => {
        render(<Sidebar rol="ESTUDIANTE" activeTab="solicitudes" onTabChange={vi.fn()} />)
        expect(screen.getByText('Mis Solicitudes')).toBeInTheDocument()
        expect(screen.getByText('Ayudantías')).toBeInTheDocument()
    })

    it('muestra el menú correspondiente al rol SOLICITANTE', () => {
        render(<Sidebar rol="SOLICITANTE" activeTab="nueva-solicitud" onTabChange={vi.fn()} />)
        expect(screen.getByText('Nueva Solicitud')).toBeInTheDocument()
    })

    it('ejecuta onTabChange al hacer clic en un ítem del menú', () => {
        const onTabChange = vi.fn()
        render(<Sidebar rol="AYUDANTE" activeTab="solicitudes" onTabChange={onTabChange} />)

        fireEvent.click(screen.getByText('Estudiantes'))

        expect(onTabChange).toHaveBeenCalledWith('estudiantes')
    })

    it('redirige a /login tras cerrar sesión correctamente', async () => {
        vi.mocked(logout).mockResolvedValue({ ok: true })
        render(<Sidebar rol="PROFESOR" activeTab="ayudantias" onTabChange={vi.fn()} />)

        fireEvent.click(screen.getByText('Cerrar sesión'))

        await waitFor(() => {
            expect(replace).toHaveBeenCalledWith('/login')
        })
    })

    it('no redirige si el logout falla', async () => {
        vi.mocked(logout).mockResolvedValue({ error: 'No se pudo cerrar sesión' })
        render(<Sidebar rol="PROFESOR" activeTab="ayudantias" onTabChange={vi.fn()} />)

        fireEvent.click(screen.getByText('Cerrar sesión'))

        await waitFor(() => {
            expect(logout).toHaveBeenCalled()
        })
        expect(replace).not.toHaveBeenCalled()
    })
})
