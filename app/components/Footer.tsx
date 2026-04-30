import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,245,255,0.92))] text-zinc-700">
      <div className="h-px w-full bg-gradient-to-r from-purple-600 via-pink-500 to-sky-500 opacity-60" />

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-3 md:gap-8">
        <div>
          <h2 className="bg-gradient-to-r from-purple-600 via-pink-500 to-sky-500 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            MakerBox
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
            © {new Date().getFullYear()} MakerBox. Todos los derechos reservados.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-900">
            Enlaces
          </h3>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li>
              <Link href="/" className="transition-colors hover:text-pink-500">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/about" className="transition-colors hover:text-sky-500">
                Sobre Makerbox
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition-colors hover:text-pink-500">
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-900">
            Síguenos
          </h3>
          <div className="flex flex-wrap gap-4 text-sm text-zinc-600">
            <a href="#" className="transition-colors hover:text-pink-500">
              Facebook
            </a>
            <a href="#" className="transition-colors hover:text-sky-500">
              Instagram
            </a>
            <a href="#" className="transition-colors hover:text-pink-500">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}