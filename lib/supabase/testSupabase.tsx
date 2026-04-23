"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestConnection() {
  const [status, setStatus] = useState('Revisa la consola (F12) para ver el estado de la conexión.')

  useEffect(() => {
    const checkConnection = async () => {
      const { data, error } = await supabase.from('tus_tablas').select('*').limit(1)

      if (error) {
        setStatus(`Error de conexión: ${error.message}`)
        console.error('❌ Error de conexión:', error.message)
      } else {
        setStatus(`Conexión exitosa. Datos recibidos: ${data?.length ?? 0}`)
      }
    }

    checkConnection()
  }, [])

  return <div>{status}</div>
}