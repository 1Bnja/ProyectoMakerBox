import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from '@/app/page'; // Ajusta la ruta según donde tengas este archivo

describe('Home Page - MakerBox', () => {
  
  it('debería renderizar el título principal correctamente', () => {
    render(<Home />);
    const title = screen.getByText(/Co-creación e innovación con una identidad clara y moderna/i);
    expect(title).toBeDefined();
  });

  it('debería mostrar el nombre de la marca MakerBox', () => {
    render(<Home />);
    const brand = screen.getByText(/MakerBox/i);
    expect(brand).toBeDefined();
  });

  it('debería contener un enlace que lleve al Login', () => {
    render(<Home />);
    const loginLink = screen.getByRole('link', { name: /Ir a Login/i });
    expect(loginLink.getAttribute('href')).toBe('/login');
  });

  it('debería mostrar la imagen del logo con el texto alt correcto', () => {
    render(<Home />);
    const logo = screen.getByAltText(/MakerBox logo/i);
    expect(logo).toBeDefined();
  });

  it('debería mostrar los tres pilares de diseño (Purple, Pink, Sky)', () => {
    render(<Home />);
    expect(screen.getByText(/Purple/i)).toBeDefined();
    expect(screen.getByText(/Pink/i)).toBeDefined();
    expect(screen.getByText(/Sky/i)).toBeDefined();
  });
});