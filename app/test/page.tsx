// app/test/page.tsx
"use client"; // Obligatorio para usar hooks de React

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function TestPage() {
  const [status, setStatus] = useState("Cargando...");

  useEffect(() => {
    async function verificar() {
      let client;

      try {
        client = getSupabaseClient();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido al inicializar Supabase';
        setStatus(`❌ ${message}`);
        return;
      }

      // Hacemos una llamada simple a la autenticación para ver si responde
      const { error } = await client.auth.getSession();

      if (error) {
        setStatus(`❌ Error de conexión: ${error.message}`);
      } else {
        setStatus("✅ ¡Conexión con Supabase exitosa!");
      }
    }

    verificar();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Prueba de Conexión</h1>
      <p style={{ 
        padding: '1rem', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '8px',
        border: '1px solid #ccc' 
      }}>
        {status}
      </p>
    </div>
  );
}

