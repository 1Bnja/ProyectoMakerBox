export const diasSemana = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"]

export const diasOperativos = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"]

/* eslint-disable @typescript-eslint/naming-convention */
export const diaLabel: Record<string, string> = {
    LUNES: "Lunes",
    MARTES: "Martes",
    MIERCOLES: "Miércoles",
    JUEVES: "Jueves",
    VIERNES: "Viernes",
}
/* eslint-enable @typescript-eslint/naming-convention */

export function obtenerDiaDeFecha(fecha: string): string {
    return diasSemana[new Date(`${fecha}T00:00:00Z`).getUTCDay()]
}

export function esDiaOperativo(fecha: string): boolean {
    return diasOperativos.includes(obtenerDiaDeFecha(fecha))
}

export function esFechaValida(fecha: string): boolean {
    return !Number.isNaN(new Date(`${fecha}T00:00:00Z`).getTime())
}
