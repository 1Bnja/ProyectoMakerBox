import { vi } from "vitest"

export interface QueryResult<T = unknown> {
    data: T | null
    error: { message: string } | null
}

/**
 * Construye un objeto "chainable" que imita al query builder de Supabase:
 * cada método (select/eq/order/in/insert/update/delete/single/maybeSingle)
 * devuelve el mismo objeto, y el objeto es "thenable" para que un `await`
 * directo (sin `.single()`) también resuelva al resultado configurado.
 */
export function chainable<T = unknown>(data: T | null, error: { message: string } | null = null) {
    const builder: Record<string, unknown> & PromiseLike<QueryResult<T>> = {} as never

    const methods = ["select", "eq", "order", "in", "insert", "update", "delete", "single", "maybeSingle"]
    for (const method of methods) {
        ;(builder as Record<string, unknown>)[method] = vi.fn(() => builder)
    }

    ;(builder as { then: PromiseLike<QueryResult<T>>["then"] }).then = (resolve, reject) =>
        Promise.resolve({ data, error }).then(resolve, reject)

    return builder
}

/** Cliente Supabase simulado con auth.getUser controlable y una cola de resultados para .from(). */
export function createMockSupabaseClient() {
    const fromQueue: ReturnType<typeof chainable>[] = []
    const mockFrom = vi.fn(() => {
        const next = fromQueue.shift()
        if (!next) {
            throw new Error("createMockSupabaseClient: se llamó a .from() sin un resultado encolado")
        }
        return next
    })

    const mockGetUser = vi.fn()
    const mockCreateSignedUrl = vi.fn()

    const client = {
        auth: {
            getUser: mockGetUser,
            signInWithPassword: vi.fn(),
        },
        from: mockFrom,
        storage: {
            from: vi.fn((_bucket: string) => ({
                createSignedUrl: mockCreateSignedUrl,
            })),
        },
    }

    return {
        client,
        mockGetUser,
        mockFrom,
        mockCreateSignedUrl,
        /** Encola el resultado que devolverá la próxima llamada a .from(...) (en orden). */
        queueFrom(data: unknown, error: { message: string } | null = null) {
            fromQueue.push(chainable(data, error))
        },
        setUser(user: { id: string } | null) {
            mockGetUser.mockResolvedValue({ data: { user }, error: null })
        },
    }
}

export function createMockAdminClient() {
    const createUser = vi.fn()
    const deleteUser = vi.fn()
    const fromQueue: ReturnType<typeof chainable>[] = []
    const mockFrom = vi.fn(() => {
        const next = fromQueue.shift()
        if (!next) {
            throw new Error("createMockAdminClient: se llamó a .from() sin un resultado encolado")
        }
        return next
    })

    const client = {
        auth: {
            admin: { createUser, deleteUser },
        },
        from: mockFrom,
    }

    return {
        client,
        createUser,
        deleteUser,
        mockFrom,
        /** Encola el resultado que devolverá la próxima llamada a .from(...) (en orden). */
        queueFrom(data: unknown, error: { message: string } | null = null) {
            fromQueue.push(chainable(data, error))
        },
    }
}
