"use client"

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'

export default function TestConnection() {
  const [status, setStatus] = useState('Revisa la consola (F12) para ver el estado de la conexión.')

  useEffect(() => {
    const checkConnection = async () => {
      let client

      try {
        client = getSupabaseClient()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido al inicializar Supabase'
        setStatus(`Error de conexión: ${message}`)
        return
      }

      const { data, error } = await client.from('tus_tablas').select('*').limit(1)

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