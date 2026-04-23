import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center px-6 py-16 lg:px-8">
      <section className="grid w-full gap-10 rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_24px_80px_rgba(107,63,160,0.12)] backdrop-blur-sm md:p-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-[#6B3FA0]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E94E77]" />
            MakerBox
          </div>

          <div className="space-y-5">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Co-creación e innovación con una identidad clara y moderna.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              Un espacio pensado para equipos que construyen, validan y lanzan ideas con una experiencia visual limpia, consistente y cercana.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:from-purple-700 hover:to-pink-600 hover:shadow-xl hover:shadow-pink-500/30"
            >
              Ir a Login
            </Link>
            <a
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-700 transition hover:border-pink-200 hover:text-pink-500"
            >
              Ver beneficios
            </a>
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,245,255,0.9))] p-6 ring-1 ring-slate-200/70 md:p-8">
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <Image
              src="/logo.jpg"
              alt="MakerBox logo"
              width={640}
              height={220}
              className="h-auto w-full rounded-[1rem] object-contain"
              priority
            />
          </div>

          <div id="features" className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
              <p className="text-sm font-semibold text-[#6B3FA0]">Purple</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">Base sólida para jerarquía visual y marca.</p>
            </article>
            <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
              <p className="text-sm font-semibold text-[#E94E77]">Pink</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">Acentos cálidos para interacción y foco.</p>
            </article>
            <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
              <p className="text-sm font-semibold text-[#3AB0FF]">Sky</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">Ligereza y contraste para resaltar acciones.</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
