import Image from "next/image";
import Link from "next/link";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top,rgba(233,78,119,0.16),transparent_34%),radial-gradient(circle_at_right,rgba(58,176,255,0.18),transparent_28%),linear-gradient(180deg,#fff8fc_0%,#f8fbff_48%,#ffffff_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[linear-gradient(90deg,rgba(107,63,160,0.08),rgba(233,78,119,0.08),rgba(58,176,255,0.08))] blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-10 lg:px-8 lg:py-16">
        <section className="grid gap-10 rounded-[2rem] border border-white/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(107,63,160,0.12)] backdrop-blur-sm md:p-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#e8d9fb] bg-[#f8f1ff] px-4 py-2 text-sm font-medium text-[#6B3FA0]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E94E77]" />
              MakerBox
            </div>

            <div className="space-y-5">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
                MakerBox organiza solicitudes de impresión 3D, inventario y reservas en un solo lugar.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                Un sistema público y claro para estudiantes, ayudantes y profesores que centraliza el flujo de trabajo del maker space: crear solicitudes, revisar su estado, gestionar aprobaciones y mantener el control operativo.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#6B3FA0] via-[#E94E77] to-[#3AB0FF] px-6 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-105 hover:shadow-xl hover:shadow-pink-500/30"
              >
                Ir a Login
              </Link>
              <a
                href="#funcionalidades"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-700 transition hover:border-pink-200 hover:text-pink-600"
              >
                Ver funcionalidades
              </a>
            </div>
          </div>

          <div className="grid gap-5 rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,245,255,0.9))] p-6 ring-1 ring-slate-200/70 md:p-8">
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
              <Image
                src="/logo.jpg"
                alt="Logo de MakerBox"
                width={640}
                height={220}
                className="h-auto w-full rounded-[1rem] object-contain"
                priority
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
                <p className="text-sm font-semibold text-[#6B3FA0]">Solicitudes</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">Flujo ordenado para impresión 3D y seguimiento.</p>
              </article>
              <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
                <p className="text-sm font-semibold text-[#E94E77]">Inventario</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">Visibilidad de materiales y recursos disponibles.</p>
              </article>
              <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
                <p className="text-sm font-semibold text-[#3AB0FF]">Reserva</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">Reserva de sala interactiva para actividades.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="funcionalidades" className="space-y-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6B3FA0]">Funcionalidades principales</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Todo lo que MakerBox necesita para operar el laboratorio</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-[1.5rem] border border-white/80 bg-white/85 p-5 shadow-[0_10px_30px_rgba(107,63,160,0.08)] ring-1 ring-slate-200/60">
              <h3 className="text-lg font-semibold text-slate-950">Solicitudes de impresión 3D</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Registro claro de piezas, archivos y prioridad de atención.</p>
            </article>
            <article className="rounded-[1.5rem] border border-white/80 bg-white/85 p-5 shadow-[0_10px_30px_rgba(233,78,119,0.08)] ring-1 ring-slate-200/60">
              <h3 className="text-lg font-semibold text-slate-950">Gestión de solicitudes por ayudantes</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Aprobación, revisión y organización de cada solicitud con trazabilidad.</p>
            </article>
            <article className="rounded-[1.5rem] border border-white/80 bg-white/85 p-5 shadow-[0_10px_30px_rgba(58,176,255,0.08)] ring-1 ring-slate-200/60">
              <h3 className="text-lg font-semibold text-slate-950">Control de inventario</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Consulta de materiales y recursos para mantener el taller abastecido.</p>
            </article>
            <article className="rounded-[1.5rem] border border-white/80 bg-white/85 p-5 shadow-[0_10px_30px_rgba(107,63,160,0.08)] ring-1 ring-slate-200/60">
              <h3 className="text-lg font-semibold text-slate-950">Reserva de sala interactiva</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Disponibilidad y reserva de espacios para trabajo colaborativo.</p>
            </article>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[1.75rem] border border-white/80 bg-white/85 p-6 shadow-[0_10px_30px_rgba(107,63,160,0.08)] ring-1 ring-slate-200/60 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#E94E77]">Roles</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">Cada perfil ve MakerBox según su función</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#f8f1ff] p-4">
                <p className="text-base font-semibold text-[#6B3FA0]">Estudiante</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Crea solicitudes y revisa el estado de su trabajo.</p>
              </div>
              <div className="rounded-2xl bg-[#fff0f5] p-4">
                <p className="text-base font-semibold text-[#E94E77]">Ayudante</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Gestiona solicitudes, valida entregas y organiza la operación.</p>
              </div>
              <div className="rounded-2xl bg-[#eef8ff] p-4">
                <p className="text-base font-semibold text-[#3AB0FF]">Profesor</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Supervisa el uso del sistema y el avance general.</p>
              </div>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,245,255,0.92))] p-6 shadow-[0_10px_30px_rgba(58,176,255,0.08)] ring-1 ring-slate-200/60 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#3AB0FF]">Flujo general</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">Un recorrido simple desde el acceso hasta la aprobación</h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-2">
              <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-[#6B3FA0]">1. Registrarse o iniciar sesión</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">El usuario entra al sistema y accede al panel según su rol.</p>
              </li>
              <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-[#E94E77]">2. Crear solicitud</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Se registra el requerimiento de impresión o la necesidad operativa.</p>
              </li>
              <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-[#3AB0FF]">3. Revisar estado</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">La persona usuaria consulta el progreso de su solicitud en todo momento.</p>
              </li>
              <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-[#6B3FA0]">4. Gestionar o aprobar solicitudes</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Los ayudantes organizan y aprueban el trabajo pendiente.</p>
              </li>
            </ol>
          </article>
        </section>
      </div>

      <Footer />
    </main>
  );
}
