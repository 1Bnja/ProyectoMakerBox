/* Paleta de acentos MakerBox compartida por las vistas del dashboard.
   Las clases son literales completas a propósito: Tailwind sólo detecta
   los valores arbitrarios (bg-[#...]) si aparecen escritos enteros.

   Paleta: #4A2775 (morado) · #BC367B (magenta) · #50D4F2 (cian) · #FFFFFF */

export type Accent = "purple" | "pink" | "blue"

interface AccentClasses {
    /** Punto/indicador de color sólido. */
    dot: string
    /** Botón primario: fondo, sombra y hover. */
    solid: string
    /** Color de texto sobre el botón primario (cian usa texto oscuro por contraste). */
    solidText: string
    /** Anillo de foco para inputs y selects. */
    ring: string
    /** Pill de filtro activo. */
    pillActive: string
    /** Pill de filtro inactivo (incluye hover). */
    pillInactive: string
    /** Botón outline pequeño de tabla (hover con el acento). */
    outline: string
}

export const accentClasses: Record<Accent, AccentClasses> = {
    purple: {
        dot: "bg-[#4A2775]",
        solid: "bg-[#4A2775] shadow-[#4A2775]/20 hover:bg-[#3a1e5e]",
        solidText: "text-white",
        ring: "focus:border-[#4A2775] focus:ring-4 focus:ring-[#4A2775]/15",
        pillActive: "border-[#4A2775]/30 bg-[#4A2775]/10 text-[#4A2775]",
        pillInactive:
            "border-slate-200 bg-white text-slate-500 hover:border-[#4A2775]/40 hover:text-[#4A2775]",
        outline:
            "border-slate-200 text-slate-500 hover:border-[#4A2775]/40 hover:text-[#4A2775]",
    },
    pink: {
        dot: "bg-[#BC367B]",
        solid: "bg-[#BC367B] shadow-[#BC367B]/25 hover:bg-[#a12d69]",
        solidText: "text-white",
        ring: "focus:border-[#BC367B] focus:ring-4 focus:ring-[#BC367B]/15",
        pillActive: "border-[#BC367B]/30 bg-[#BC367B]/10 text-[#BC367B]",
        pillInactive:
            "border-slate-200 bg-white text-slate-500 hover:border-[#BC367B]/40 hover:text-[#BC367B]",
        outline:
            "border-slate-200 text-slate-500 hover:border-[#BC367B]/40 hover:text-[#BC367B]",
    },
    blue: {
        dot: "bg-[#50D4F2]",
        solid: "bg-[#50D4F2] shadow-[#50D4F2]/30 hover:bg-[#34c2e3]",
        solidText: "text-[#4A2775]",
        ring: "focus:border-[#50D4F2] focus:ring-4 focus:ring-[#50D4F2]/20",
        pillActive: "border-[#50D4F2]/40 bg-[#50D4F2]/15 text-[#1c7f99]",
        pillInactive:
            "border-slate-200 bg-white text-slate-500 hover:border-[#50D4F2]/60 hover:text-[#1c7f99]",
        outline:
            "border-slate-200 text-slate-500 hover:border-[#50D4F2]/60 hover:text-[#1c7f99]",
    },
}
