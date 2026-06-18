'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'

interface FormularioProps {
  onCancelar: () => void
}

export default function FormularioSolicitudEstudiante({ onCancelar }: FormularioProps) {
  const supabase = getSupabaseClient()
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null)
  const [archivo, setArchivo] = useState<File | null>(null)
  
  // Nuevos estados para las listas dinámicas
  const [listaCursos, setListaCursos] = useState<{id: string, nombre: string}[]>([])
  const [listaGrupos, setListaGrupos] = useState<{id: string, nombre: string}[]>([])

  /* eslint-disable @typescript-eslint/naming-convention */
  const [datos, setDatos] = useState({
    nombre: '',
    descripcion: '',
    curso_id: '',
    grupo_id: ''
  })
  /* eslint-enable @typescript-eslint/naming-convention */

 // Cargar los cursos y grupos al abrir el modal
  useEffect(() => {
    const cargarDatos = async () => {
      const { data: dataCursos, error: errorCursos } = await supabase.from('cursos').select('id, nombre')
      if (errorCursos) console.error("Error cargando cursos:", errorCursos)
      if (dataCursos) setListaCursos(dataCursos)

      const { data: dataGrupos, error: errorGrupos } = await supabase.from('grupos').select('id, nombre')
      if (errorGrupos) console.error("Error cargando grupos:", errorGrupos)
      if (dataGrupos) setListaGrupos(dataGrupos)
    }
    cargarDatos()
  }, [supabase])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setDatos({ ...datos, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0])
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setMensaje(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No hay sesión activa')

      const filePath = `modelos/${archivo?.name || 'archivo.stl'}`
      
      if (archivo) {
        await supabase.storage.from('solicitudes-impresion').upload(filePath, archivo)
      }

      /* eslint-disable @typescript-eslint/naming-convention */
      const solicitudDatos = {
        user_id: user.id,
        tipo: 'CURSO', 
        curso_id: datos.curso_id,
        grupo_id: datos.grupo_id,
        stl_path: filePath,
        estado: 'PENDIENTE',
        comentario: `Proyecto: ${datos.nombre}. Descripción: ${datos.descripcion}`,
        created_at: new Date().toISOString()
      }
      /* eslint-enable @typescript-eslint/naming-convention */

      const { error: insertError } = await supabase
        .from('impresiones')
        .insert([solicitudDatos] as never[]) 

      if (insertError) throw insertError

      setMensaje({ tipo: 'exito', texto: '¡Solicitud enviada!' })
      setTimeout(() => onCancelar(), 2000) 

    } catch (error) { 
      console.error("Error en Supabase:", error);
      let errorMessage = 'Ocurrió un error inesperado';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String((error as { message: unknown }).message);
      }
      setMensaje({ tipo: 'error', texto: errorMessage })
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-xl max-w-md w-full">
      <h2 className="text-xl font-bold mb-4 text-slate-800">Nueva Solicitud de Curso</h2>
      
      {mensaje && (
        <div className={`p-3 mb-4 rounded ${mensaje.tipo === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-slate-700">Nombre de la pieza *</label>
          <input type="text" id="nombre" name="nombre" required onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" />
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700">Descripción *</label>
          <textarea id="descripcion" name="descripcion" required onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="curso_id" className="block text-sm font-medium text-slate-700">Selecciona tu curso *</label>
            <select id="curso_id" name="curso_id" required onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md">
              <option value="">Seleccionar...</option>
              {listaCursos.map((curso) => (
                <option key={curso.id} value={curso.id}>{curso.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="grupo_id" className="block text-sm font-medium text-slate-700">Selecciona tu grupo *</label>
            <select id="grupo_id" name="grupo_id" required onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md">
              <option value="">Seleccionar...</option>
              {listaGrupos.map((grupo) => (
                <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium text-slate-700 mb-2">Modelo 3D (.stl) *</span>
          <input type="file" id="archivo" accept=".stl" required onChange={handleFileChange} className="hidden" />
          <label htmlFor="archivo" className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-6 px-4 text-center text-sm text-slate-500 transition-colors hover:border-[#6B3FA0] hover:bg-[#6B3FA0]/5">
            {archivo ? <span className="font-semibold text-[#6B3FA0]">Archivo: {archivo.name}</span> : <span>Haz click aquí para buscar tu archivo 3D</span>}
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onCancelar} className="px-4 py-2 text-slate-600 border rounded-md hover:bg-slate-50">Cancelar</button>
          <button type="submit" disabled={cargando} className="px-4 py-2 bg-[#6B3FA0] text-white rounded-md hover:bg-[#5a3488]">
            {cargando ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </div>
      </form>
    </div>
  )
}