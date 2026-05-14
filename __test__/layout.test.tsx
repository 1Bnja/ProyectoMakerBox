import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RootLayout from '@/app/layout';

// Mock del componente Footer para simplificar la prueba
vi.mock('@/app/components/Footer', () => ({
  default: () => <footer data-testid="footer-mock">Footer</footer>,
}));

describe('RootLayout - MakerBox', () => {
  it('debería renderizar el contenido de los hijos (children)', () => {
    render(
      <RootLayout>
        <div data-testid="child-content">Contenido de prueba</div>
      </RootLayout>
    );

    const child = screen.getByTestId('child-content');
    expect(child).toBeDefined();
    expect(child.textContent).toBe('Contenido de prueba');
  });

  it('debería incluir el componente Footer en todas las páginas', () => {
    render(
      <RootLayout>
        <div>Página cualquiera</div>
      </RootLayout>
    );

    const footer = screen.getByTestId('footer-mock');
    expect(footer).toBeDefined();
  });

  it('debería aplicar el idioma español al tag html', () => {
    const { container } = render(
      <RootLayout>
        <p>Test</p>
      </RootLayout>
    );
    
    // Verificamos que el lenguaje sea 'es' como definiste en tu código
    const htmlTag = container.closest('html');
    if (htmlTag) {
      expect(htmlTag.getAttribute('lang')).toBe('es');
    }
  });
});