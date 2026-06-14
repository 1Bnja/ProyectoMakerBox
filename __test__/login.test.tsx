import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from '@/app/(auth)/login/page';


vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('Login Page Suite', () => {
  it('debería mostrar el título de bienvenida o el formulario', () => {
    render(<LoginPage />);
    const loginButton = screen.getByRole('button');
    expect(loginButton).toBeDefined();
  });
});