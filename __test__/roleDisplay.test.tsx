import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import RoleDisplay from '@/app/components/RoleDisplay'

describe('AUTH-01 - Dashboard muestra el rol del usuario', () => {
  it('muestra el rol cuando se recibe uno', () => {
    render(<RoleDisplay rol="ESTUDIANTE" />)

    expect(screen.getByText(/ESTUDIANTE/)).toBeInTheDocument()
  })

  it('muestra un mensaje cuando no hay rol', () => {
    render(<RoleDisplay rol={null} />)

    expect(screen.getByText(/Rol no especificado/i)).toBeInTheDocument()
  })
})