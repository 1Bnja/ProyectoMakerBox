import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoginPage from '@/app/(auth)/login/page';

describe('Login Page Suite', () => {
  it('debería mostrar el título de bienvenida o el formulario', () => {
    render(<LoginPage />);
    
    // Aquí buscas un texto que sepa que está en tu login
    // Por ejemplo, si hay un botón que dice "Entrar" o "Iniciar Sesión"
    const loginButton = screen.getByRole('button');
    expect(loginButton).toBeDefined();
  });
});