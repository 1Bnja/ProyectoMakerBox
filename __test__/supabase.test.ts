import { describe, it, expect, beforeEach, vi } from 'vitest';
// Importa dinámicamente dentro de los tests o usa vi.resetModules()

describe('Supabase Client Suite', () => {
  beforeEach(() => {
    vi.resetModules(); // Limpia el caché de imports
    vi.unstubAllEnvs(); // Limpia cambios en el entorno
  });

  it('debería retornar el cliente si las variables existen', async () => {
    // Seteamos las variables ANTES de importar el cliente
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://ejemplo.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'clave-ficticia');

    // Importamos el cliente aquí para que lea las nuevas variables
    const { getSupabaseClient } = await import('@/lib/supabase/client');
    
    const client = getSupabaseClient();
    expect(client).toBeDefined();
  });
});