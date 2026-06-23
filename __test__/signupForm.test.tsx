import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/lib/auth/signup', () => ({
  signup: vi.fn(),
}))

import { signup } from '@/lib/auth/signup'
import SignupPage from '@/app/(auth)/signup/page'

describe('Formulario de registro de Solicitante', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirige a /login cuando el registro es exitoso', async () => {
    vi.mocked(signup).mockResolvedValue({ success: true })

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Soto' } })
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'ana@ejemplo.com' } })
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'contrasena123' } })
    fireEvent.submit(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(signup).toHaveBeenCalledWith('ana@ejemplo.com', 'contrasena123', 'Ana', 'Soto')
    })

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('muestra un mensaje de error si el registro falla', async () => {
    vi.mocked(signup).mockResolvedValue({ error: 'El correo ya está en uso' })

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Soto' } })
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'ana@ejemplo.com' } })
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'contrasena123' } })
    fireEvent.submit(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('El correo ya está en uso')
    })

    expect(mockPush).not.toHaveBeenCalled()
  })
})
