import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("Home Page - MakerBox", () => {
  it("renderiza la landing pública con el contenido principal", () => {
    render(<Home />);

    expect(screen.getAllByText(/^MakerBox$/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Ir a Login/i }).getAttribute("href")).toBe("/login");
    expect(screen.getByRole("heading", { name: /Solicitudes de impresión 3D/i, level: 3 })).toBeDefined();
    expect(screen.getByRole("heading", { name: /Control de inventario/i, level: 3 })).toBeDefined();
    expect(screen.getByRole("heading", { name: /Reserva de sala interactiva/i, level: 3 })).toBeDefined();
    expect(screen.getByText(/^Estudiante$/i, { selector: "p" })).toBeDefined();
    expect(screen.getByText(/^Ayudante$/i, { selector: "p" })).toBeDefined();
  });

  it("muestra el logo de MakerBox", () => {
    render(<Home />);

    expect(screen.getByAltText(/Logo de MakerBox/i)).toBeDefined();
  });
});