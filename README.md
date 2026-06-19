# ProyectoMakerBox - Grupo 6

Sistema de gestión para el espacio de fabricación digital MakerBox: solicitudes de impresión 3D, administración de cursos, inventario de materiales y reserva de sala interactiva.

## Integrantes

| Nombre | Matrícula | Rol |
|--------|-----------|-----|
| Benjamín Navarro | 2021407802 | PM |
| Krisstal Hernández | 2022407012 | DEV |
| Lukas Avello | 2021407022 | DEV |

## Stack

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Backend / Base de datos:** Supabase (PostgreSQL + Auth + Storage)
- **Estilos:** Tailwind CSS
- **Tests:** Vitest + Testing Library
- **CI/CD:** GitHub Actions
- **Pruebas de rendimiento:** k6

## Requisitos previos

- Node.js 20+
- Una instancia de Supabase (URL, anon key y service role key)

## Configuración local

1. Clonar el repositorio e instalar dependencias:

   ```bash
   npm install
   ```

2. Crear un archivo `.env.local` en la raíz con:

   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

3. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Levanta el entorno de desarrollo |
| `npm run build` | Compila el proyecto para producción |
| `npm run lint` | Corre ESLint |
| `npm run test:unit` | Corre los tests unitarios |
| `npm run test:integration` | Corre los tests de integración |
| `npm run test:coverage` | Genera el informe de cobertura combinando ambos tipos de test |

## Integración continua

El pipeline (`.github/workflows/ci.yml`) corre en cada push o pull request hacia `develop` y `main`, con dos jobs en paralelo:

- **test-unitarios**: instala dependencias, corre el lint, compila el proyecto y ejecuta los tests unitarios.
- **test-integracion**: compila el proyecto, ejecuta los tests de integración, genera el informe de cobertura y lo sube a Codecov.

## Flujo de trabajo

- El desarrollo ocurre en ramas `feature/*` o `feat/*` a partir de `develop`.
- Cada cambio se integra mediante pull request hacia `develop`, con revisión de código del equipo antes de mergear.
- `develop` se integra a `main` cuando el conjunto de funcionalidades está validado y listo para producción.

## Estructura del proyecto

```
app/                  # Rutas, páginas y componentes (App Router)
  (auth)/             # Login
  (dashboard)/        # Vistas por rol: admin, ayudante, profesor, estudiante, solicitante
  api/                # Rutas de API (auth, cursos, estudiantes, solicitudes, usuarios)
lib/                  # Lógica de negocio y clientes de Supabase
__test__/             # Tests unitarios e integración
performance/          # Pruebas de rendimiento con k6
```
