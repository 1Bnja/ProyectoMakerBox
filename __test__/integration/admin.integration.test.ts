import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/* eslint-disable @typescript-eslint/naming-convention */
const mockAdminCreateUser = vi.fn()
const mockAdminDeleteUser = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        auth: {
            admin: {
                createUser: mockAdminCreateUser,
                deleteUser: mockAdminDeleteUser,
            },
        },
        from: vi.fn(),
    })),
}))

describe('USR-01 - Admin Client', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.resetModules()
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
        vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')
    })

    afterEach(() => {
        vi.unstubAllEnvs()
    })

    it('debería crear el admin client con service_role', async () => {
        const { createSupabaseAdminClient } = await import('@/lib/supabase/admin')
        const client = createSupabaseAdminClient()

        expect(client).toBeDefined()
        expect(client.auth.admin).toBeDefined()
    })

    it('debería lanzar error si faltan variables de entorno', async () => {
        vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '')

        const { createSupabaseAdminClient } = await import('@/lib/supabase/admin')

        expect(() => createSupabaseAdminClient()).toThrow(
            'Faltan las variables de entorno de Supabase'
        )
    })

    it('debería crear un usuario en auth correctamente', async () => {
        const mockUser = { id: 'student-123', email: 'test@utalca.cl' }
        mockAdminCreateUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        })

        const { createSupabaseAdminClient } = await import('@/lib/supabase/admin')
        const client = createSupabaseAdminClient()

        const { data, error } = await client.auth.admin.createUser({
            email: 'test@utalca.cl',
            password: 'password123',
            email_confirm: true,
            user_metadata: { nombre: 'Test', apellido: 'User', rol: 'ESTUDIANTE' },
        })

        expect(error).toBeNull()
        expect(data.user?.id).toBe('student-123')
        expect(mockAdminCreateUser).toHaveBeenCalledWith({
            email: 'test@utalca.cl',
            password: 'password123',
            email_confirm: true,
            user_metadata: { nombre: 'Test', apellido: 'User', rol: 'ESTUDIANTE' },
        })
    })

    it('debería retornar error si falla crear el usuario', async () => {
        mockAdminCreateUser.mockResolvedValue({
            data: { user: null },
            error: { message: 'User already registered' },
        })

        const { createSupabaseAdminClient } = await import('@/lib/supabase/admin')
        const client = createSupabaseAdminClient()

        const { data, error } = await client.auth.admin.createUser({
            email: 'existente@utalca.cl',
            password: 'password123',
            email_confirm: true,
        })

        expect(error?.message).toBe('User already registered')
        expect(data.user).toBeNull()
    })
})
/* eslint-enable @typescript-eslint/naming-convention */
