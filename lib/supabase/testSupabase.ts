import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client' // Ajusta la ruta a tu archivo

export default function TestConnection() {
  useEffect(() => {
    const checkConnection = async () => {
      // Intentamos leer una tabla cualquiera o simplemente el estado de salud
      const { data, error } = await supabase.from('tus_tablas').select('*').limit(1)
      
      if (error) {
        console.error('❌ Error de conexión:', error.message)
      } else {
        console.log('✅ Conexión exitosa. Datos recibidos:', data)
      }
    }

    checkConnection()
  }, [])

  return <div>Revisa la consola (F12) para ver el estado de la conexión.</div>
}