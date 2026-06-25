import { vi } from "vitest"

export interface QueryResult<T = unknown> {
    data: T | null
    error: { message: string } | null
}

export function chainable<T = unknown>(data: T | null, error: { message: string } | null = null) {
    const builder: Record<string, unknown> & PromiseLike<QueryResult<T>> = {} as never

    const methods = ["select", "eq", "order", "in", "insert", "update", "delete", "single", "maybeSingle"]
    for (const method of methods) {
        ; (builder as Record<string, unknown>)[method] = vi.fn(() => builder)
    }

    ; (builder as { then: PromiseLike<QueryResult<T>>["then"] }).then = (resolve, reject) =>
        Promise.resolve({ data, error }).then(resolve, reject)

    return builder
}

export function createMockSupabaseClient() {
    const fromQueue: ReturnType<typeof chainable>[] = []
    const mockFrom = vi.fn(() => {
        const next = fromQueue.shift()
        if (!next) {
            throw new Error("createMockSupabaseClient: se llamo a .from() sin un resultado encolado")
        }
        return next
    })

    const rpcQueue: Array<{ data: unknown; error: { message: string; code?: string } | null }> = []
    const mockRpc = vi.fn(() => {
        const next = rpcQueue.shift()
        if (!next) {
            throw new Error("createMockSupabaseClient: se llamo a .rpc() sin un resultado encolado")
        }
        return Promise.resolve(next)
    })

    const mockGetUser = vi.fn()
    const mockCreateSignedUrl = vi.fn()

    const client = {
        auth: {
            getUser: mockGetUser,
            signInWithPassword: vi.fn(),
        },
        from: mockFrom,
        rpc: mockRpc,
        storage: {
            from: vi.fn((bucket: string) => {
                void bucket
                return {
                    createSignedUrl: mockCreateSignedUrl,
                }
            }),
        },
    }

    return {
        client,
        mockGetUser,
        mockFrom,
        mockRpc,
        mockCreateSignedUrl,
        queueFrom(data: unknown, error: { message: string } | null = null) {
            fromQueue.push(chainable(data, error))
        },
        queueRpc(data: unknown, error: { message: string; code?: string } | null = null) {
            rpcQueue.push({ data, error })
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
            throw new Error("createMockAdminClient: se llamo a .from() sin un resultado encolado")
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
        queueFrom(data: unknown, error: { message: string } | null = null) {
            fromQueue.push(chainable(data, error))
        },
    }
}
