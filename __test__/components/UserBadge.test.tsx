import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserBadge } from '@/app/components/UserBadge'

describe('UserBadge', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('muestra el nombre completo y las iniciales cuando carga el perfil', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ nombre: 'Benjamín', apellido: 'Canales', rol: 'ADMIN' }),
        }) as unknown as typeof fetch

        render(<UserBadge />)

        await waitFor(() => {
            expect(screen.getByText('Benjamín Canales')).toBeInTheDocument()
        })
        expect(screen.getByText('BC')).toBeInTheDocument()
    })

    it('muestra valores por defecto cuando la petición falla', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({}),
        }) as unknown as typeof fetch

        render(<UserBadge />)

        expect(screen.getByText('—')).toBeInTheDocument()
        expect(screen.getByText('·')).toBeInTheDocument()
    })
})
