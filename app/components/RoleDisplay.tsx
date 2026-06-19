type RoleDisplayProps = {
  rol: string | null
}

export default function RoleDisplay({ rol }: RoleDisplayProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <p className="text-black text-xl">
        {rol ? `Tu rol es: ${rol}` : 'Rol no especificado'}
      </p>
    </main>
  )
}