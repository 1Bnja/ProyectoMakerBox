import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/lib/auth/login', () => ({
  login: vi.fn(),
}))

vi.mock('@/lib/auth/roles', () => ({
  getHomeRouteByRole: vi.fn(),
}))

import { login } from '@/lib/auth/login'
import { getHomeRouteByRole } from '@/lib/auth/roles'
import LoginPage from '@/app/(auth)/login/page'

describe('AUTH-01 - Formulario de login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirige a la ruta del rol cuando el login es exitoso', async () => {
    vi.mocked(login).mockResolvedValue({ rol: 'ESTUDIANTE' })
    vi.mocked(getHomeRouteByRole).mockReturnValue('/estudiante')

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'usuario@ejemplo.com' },
    })
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'contrasena123' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('usuario@ejemplo.com', 'contrasena123')
    })

    expect(getHomeRouteByRole).toHaveBeenCalledWith('ESTUDIANTE')
    expect(mockPush).toHaveBeenCalledWith('/estudiante')
  })

  it('muestra un mensaje de error si las credenciales son inválidas', async () => {
    vi.mocked(login).mockResolvedValue({ error: 'Credenciales inválidas' })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'usuario@ejemplo.com' },
    })
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'malacontrasena' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText(/credenciales inválidas/i)).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('muestra un mensaje genérico cuando el error no trae descripción', async () => {
    vi.mocked(login).mockResolvedValue({ error: undefined })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'usuario@ejemplo.com' },
    })
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'malacontrasena' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText(/ocurrió un error al iniciar sesión/i)).toBeInTheDocument()
  })
})