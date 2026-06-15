'use client'
import { useState, ChangeEvent, FormEvent } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { validarDatosImpresion } from '@/lib/flujo/validacionesImpresion'

interface FormDatos {
  nombre: string
  descripcion: string
  comentarios: string
}

export default function SolicitantePage() {
  const supabase = getSupabaseClient()
  const [datos, setDatos] = useState<FormDatos>({
    nombre: '',
    descripcion: '',
    comentarios: '',
  })
  const [archivo, setArchivo] = useState<File | null>(null)
  const [cargando, setCargando] = useState<boolean>(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null)

  // Manejar el cambio de los inputs de texto
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDatos((prev) => ({ ...prev, [name]: value }))
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file) return;
    
    setMensaje(null);

    const { calcularVolumenSTL: extractorVolumen } = await import('@/lib/flujo/validacionesImpresion');

    const reader = new FileReader();
    
    reader.onload = (event: ProgressEvent<FileReader>): void => {
      const target = event.target;
      if (!target) return;
      
      const buffer = target.result as ArrayBuffer;
      if (!buffer) return;

      let volumenCalculado = 0;

      if (file.name.toLowerCase().endsWith('.stl')) {
        volumenCalculado = extractorVolumen(buffer);
      } else {
        volumenCalculado = 10; 
      }

      const datosSolicitudParaValidar = {
        nombreArchivo: file.name,
        material: 'PLA',
        volumenCm3: volumenCalculado,
      };

      const validacion = validarDatosImpresion(datosSolicitudParaValidar);

      if (!validacion.valido) {
        setMensaje({ tipo: 'error', texto: validacion.error || 'Archivo no válido.' });
        setArchivo(null);
        e.target.value = ''; 
        return;
      }

      setMensaje(null);
      setArchivo(file);
    };

    reader.onerror = (): void => {
      setMensaje({ tipo: 'error', texto: 'Error al leer el contenido binario del archivo.' });
    };

    reader.readAsArrayBuffer(file);
  };

  // Enviar la solicitud al sistema
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!archivo) {
      setMensaje({ tipo: 'error', texto: 'Por favor, sube un archivo de impresión (.stl, .obj).' })
      return
    }

    setCargando(true)
    setMensaje(null)

    try {
      // Subir el archivo al Storage de Supabase
      const fileExt = archivo.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `modelos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('solicitudes-impresion')
        .upload(filePath, archivo)

      if (uploadError) throw new Error(`Error al subir archivo: ${uploadError.message}`)

      // Obtener el ID del usuario actual logueado
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No se encontró una sesión de usuario activa.')

      /* eslint-disable @typescript-eslint/naming-convention */
      const solicitudDatos = {
        user_id: user.id,
        tipo: 'PERSONAL',      
        estado: 'PENDIENTE',    
        stl_path: filePath,             
        comentario: `Proyecto: ${datos.nombre}. Descripción: ${datos.descripcion}. Notas: ${datos.comentarios}`,
        created_at: new Date().toISOString(),
        curso_id: null,
        grupo_id: null,
        ayudante_id: null
      };
      /* eslint-enable @typescript-eslint/naming-convention */

    
      const { error: insertError } = await supabase
        .from('impresiones') 
        .insert([solicitudDatos] as never[])

      if (insertError) throw insertError
      

      setMensaje({ tipo: 'exito', texto: '¡Solicitud creada exitosamente en el sistema!' })
      setDatos({ nombre: '', descripcion: '', comentarios: '' })
      setArchivo(null)
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: error.message || 'Hubo un problema al procesar la solicitud.' })
    } finally {
      setCargando(false)
    }
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 8px rgb(118, 4, 143)' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', borderBottom: '5px solid #9f8f9b', paddingBottom: '8px', color: '#0c0c0c' }}>
        FORMULARIO DE SOLICITUD DE IMPRESIÓN 3D
      </h1>
      <p style={{ color: '#666', marginBottom: '25px' }}>
        Ingresa los detalles de tu pieza y adjunta el archivo correspondiente para ingresar la solicitud al sistema.
      </p>

      {mensaje && (
        <div style={{
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          backgroundColor: mensaje.tipo === 'exito' ? '#e6fffa' : '#fff5f5',
          color: mensaje.tipo === 'exito' ? '#234e52' : '#9b2c2c',
          border: `1px solid ${mensaje.tipo === 'exito' ? '#319795' : '#e53e3e'}`
        }}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="nombre" style={{ fontWeight: 'bold', color: '#aa11c2' }}>Nombre de la Pieza / Proyecto *</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            required
            value={datos.nombre}
            onChange={handleInputChange}
            placeholder="Ej: Engranaje de ..."
            style={{ padding: '10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="descripcion" style={{ fontWeight: 'bold', color: '#aa11c2' }}>Descripción técnica *</label>
          <textarea
            id="descripcion"
            name="descripcion"
            required
            rows={3}
            value={datos.descripcion}
            onChange={handleInputChange}
            placeholder="Detalla las dimensiones aproximadas o el propósito de la pieza..."
            style={{ padding: '10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontWeight: 'bold', color: '#aa11c2' }}>Modelo 3D (Formatos admitidos: .stl, .obj) *</span>
          
          <input
            type="file"
            id="archivo"
            accept=".stl,.obj"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <label
            htmlFor="archivo"
            style={{
              display: 'block',
              padding: '24px 16px',
              border: '2px dashed #cbd5e0',
              borderRadius: '6px',
              backgroundColor: '#f7fafc',
              textAlign: 'center',
              cursor: 'pointer',
              color: '#4a5568',
              fontSize: '14px',
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#aa11c2'
              e.currentTarget.style.backgroundColor = '#fdf4ff'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e0'
              e.currentTarget.style.backgroundColor = '#f7fafc'
            }}
          >
            {archivo ? `Archivo seleccionado: ${archivo.name}` : 'Haz click aquí para buscar tu archivo 3D'}
          </label>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="comentarios" style={{ fontWeight: 'bold', color: '#aa11c2' }}>Comentarios adicionales</label>
          <textarea
            id="comentarios"
            name="comentarios"
            rows={2}
            value={datos.comentarios}
            onChange={handleInputChange}
            placeholder="Especificaciones de color, relleno o material si tienes alguna preferencia..."
            style={{ padding: '10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          style={{
            padding: '12px',
            backgroundColor: cargando ? '#cbd5e0' : '#b8099d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: cargando ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {cargando ? 'Procesando e ingresando...' : 'Enviar Solicitud'}
        </button>
      </form>
    </div>
  )
}