// app/test/page.tsx
"use client"; // Obligatorio para usar hooks de React

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client'; // Tu cliente de supabase

export default function TestPage() {
  const [status, setStatus] = useState("Cargando...");

  useEffect(() => {
    async function verificar() {
      // Hacemos una llamada simple a la autenticación para ver si responde
      const { data, error } = await supabase.auth.getSession();

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