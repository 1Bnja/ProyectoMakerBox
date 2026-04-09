import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-10">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        
        {/* Logo / Nombre */}
        <div>
          <h2 className="text-xl font-bold text-white">MakerBox</h2>
          <p className="mt-2 text-sm">
            © {new Date().getFullYear()} MakerBox. Todos los derechos reservados.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-white font-semibold mb-3">Enlaces</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/">Inicio</Link></li>
            <li><Link href="/about">Sobre Makerbox</Link></li>
            <li><Link href="/contact">Contacto</Link></li>
          </ul>
        </div>

        {/* Redes */}
        <div>
          <h3 className="text-white font-semibold mb-3">Síguenos</h3>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-white">Facebook</a>
            <a href="#" className="hover:text-white">Instagram</a>
            <a href="#" className="hover:text-white">Twitter</a>
          </div>
        </div>

      </div>
    </footer>
  );
}