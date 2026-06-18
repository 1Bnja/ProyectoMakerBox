import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AyudantePage from '@/app/(dashboard)/ayudante/page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/ayudante',
  useSearchParams: () => new URLSearchParams(),
}))

global.fetch = vi.fn((url: string | Request | URL) => {
    const urlString = url.toString()
    
    // Si el componente intenta buscar al usuario, le devolvemos uno falso
    if (urlString.includes('/api/auth/me')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ user: { id: '123', nombre: 'Ayudante Test', rol: 'AYUDANTE' } })
        })
    }
    
    // Para cualquier otra petición
    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
    })
}) as unknown as typeof fetch

describe('IMP-03: Dashboard Ayudante - Filtros Cruzados', () => {
    
    it('renderiza todas las solicitudes inicialmente', () => {
        render(<AyudantePage />)
        
        // Verificar que se muestren distintas solicitudes por defecto
        expect(screen.getByText('Engranaje')).toBeInTheDocument()
        expect(screen.getByText('Soporte Monitor')).toBeInTheDocument() 
        expect(screen.getByText('Clip Sujeción')).toBeInTheDocument() 
    })

    it('filtra las solicitudes correctamente solo por Prioridad (Alta)', () => {
        render(<AyudantePage />)
        
        // clic en filtro de prioridad (tomamos el primero que encuentra)
        fireEvent.click(screen.getAllByText('Alta')[0])

        // 'Engranaje' tiene prioridad alta, debe estar
        expect(screen.getByText('Engranaje')).toBeInTheDocument()
        
        // 'Soporte Monitor' tiene prioridad media, NO debe estar
        expect(screen.queryByText('Soporte Monitor')).not.toBeInTheDocument()
    })

    it('filtra las solicitudes correctamente solo por Estado (APROBADA)', () => {
        render(<AyudantePage />)
        
        // clic en el filtro de estado (tomamos el primero que encuentra)
        fireEvent.click(screen.getAllByText('APROBADA')[0])

        // 'Soporte Monitor' está APROBADA, debe estar
        expect(screen.getByText('Soporte Monitor')).toBeInTheDocument()
        
        // 'Engranaje' está PENDIENTE, NO debe estar
        expect(screen.queryByText('Engranaje')).not.toBeInTheDocument()
    })

    it('aplica el filtro cruzado correctamente (PENDIENTE + Alta)', () => {
        render(<AyudantePage />)
        
        // Activar ambos filtros simultáneamente
        fireEvent.click(screen.getAllByText('PENDIENTE')[0])
        fireEvent.click(screen.getAllByText('Alta')[0])

        // 'Engranaje' (PENDIENTE y Alta) -> DEBE estar visible
        expect(screen.getByText('Engranaje')).toBeInTheDocument()
        
        // 'Base Laptop' (PENDIENTE y Alta) -> DEBE estar visible
        expect(screen.getByText('Base Laptop')).toBeInTheDocument()

        // 'Soporte Teléfono' (PENDIENTE pero Media) -> NO debe estar
        expect(screen.queryByText('Soporte Teléfono')).not.toBeInTheDocument()

        // 'Carcasa Arduino' (Alta pero EN_PROGRESO) -> NO debe estar
        expect(screen.queryByText('Carcasa Arduino')).not.toBeInTheDocument()
    })

    it('limpia los filtros al hacer clic en "Todos" / "Todas"', () => {
        render(<AyudantePage />)
        
        //filtro que esconde casi todo
        fireEvent.click(screen.getAllByText('RECHAZADA')[0])
        expect(screen.queryByText('Engranaje')).not.toBeInTheDocument()

        //limpiar el filtro de estado haciendo clic en "Todos"
        fireEvent.click(screen.getByText('Todos'))

        //'Engranaje' debería volver a aparecer
        expect(screen.getByText('Engranaje')).toBeInTheDocument()
    })
    it('permite aprobar una solicitud pendiente', () => {
        render(<AyudantePage />)
        
        // 'Engranaje' es PENDIENTE. Buscar su botón Aprobar.
        const botonesAprobar = screen.getAllByRole('button', { name: /aprobar/i })
        
        //Hacer clic en el primer botón de aprobar
        fireEvent.click(botonesAprobar[0])
        
        //Como Engranaje pasó a APROBADA, ahora debería haber más de un texto 'APROBADA' en pantalla
        expect(screen.getAllByText('APROBADA').length).toBeGreaterThan(1)
    })

    it('maneja correctamente el rechazo de una solicitud', () => {
        // Interceptr la alerta del navegador 
        const alertaMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
        
        render(<AyudantePage />)
        
        const botonesRechazar = screen.getAllByRole('button', { name: /rechazar/i })
        const textareas = screen.getAllByPlaceholderText('Retroalimentación para rechazar')

        //Intentar rechazar sin escribir nada
        fireEvent.click(botonesRechazar[0])
        expect(alertaMock).toHaveBeenCalledWith('Debe ingresar una retroalimentación para rechazar la solicitud')

        //Escribir un comentario en el textarea de esa solicitud
        fireEvent.change(textareas[0], { target: { value: 'El modelo tiene errores estructurales' } })

        //se rechazamos
        fireEvent.click(botonesRechazar[0])

        //Verificar que el comentario se renderice en la pantalla
        expect(screen.getByText('El modelo tiene errores estructurales')).toBeInTheDocument()

        //Restaurar el comportamiento normal de la alerta
        alertaMock.mockRestore()
    })
    it('cambia a todas las pestañas correctamente', () => {
        render(<AyudantePage />)
        
        //vista Estudiantes
        fireEvent.click(screen.getByText(/estudiantes/i))
        expect(screen.getByText('Estudiantes registrados en el sistema.')).toBeInTheDocument()

        //vista Sala
        fireEvent.click(screen.getByText(/sala/i))
        expect(screen.getByText('Disponibilidad de la sala para la semana.')).toBeInTheDocument()

        //vista Filamento
        fireEvent.click(screen.getByText(/filamento/i))
        expect(screen.getByText('Registro de uso de filamento.')).toBeInTheDocument()
    })
})