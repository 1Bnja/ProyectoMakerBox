'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { login } from '@/lib/auth/login'
import { getHomeRouteByRole } from '@/lib/auth/roles'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const resultado = await login(email, password)

      if ('error' in resultado) {
        setError(resultado.error ?? 'Ocurrió un error al iniciar sesión')
      return
    }

    const ruta = getHomeRouteByRole(resultado.rol)
    router.push(ruta)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(107,63,160,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(58,176,255,0.12),_transparent_28%),linear-gradient(135deg,_#ffffff,_#f8f5ff)] px-4 py-10 text-slate-900">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-[0_24px_80px_rgba(107,63,160,0.14)] backdrop-blur-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-[88px] w-[260px] items-center justify-center">
            <Image
              src="/logo.jpg"
              alt="MakerBox logo"
              width={260}
              height={88}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#6B3FA0]">
            MakerBox
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Co-creación e innovación
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu@correo.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#3AB0FF] focus:ring-4 focus:ring-blue-400/30"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#3AB0FF] focus:ring-4 focus:ring-blue-400/30"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-2 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:from-purple-700 hover:to-pink-600 hover:shadow-xl hover:shadow-pink-500/30 focus:outline-none focus:ring-4 focus:ring-blue-400/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Iniciar sesión
          </button>
        </form>
      </section>
    </main>
  )
}