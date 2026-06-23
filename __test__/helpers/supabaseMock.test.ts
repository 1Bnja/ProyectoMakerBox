import { describe, it, expect } from "vitest"
import { createMockSupabaseClient } from "./supabaseMock"

describe("createMockSupabaseClient - storage", () => {
    it("permite configurar el resultado de createSignedUrl", async () => {
        const mock = createMockSupabaseClient()
        mock.mockCreateSignedUrl.mockResolvedValue({
            data: { signedUrl: "https://example.com/signed/a.stl" },
            error: null,
        })

        const result = await mock.client.storage.from("solicitudes-impresion").createSignedUrl("modelos/a.stl", 3600)

        expect(result.data?.signedUrl).toBe("https://example.com/signed/a.stl")
        expect(mock.mockCreateSignedUrl).toHaveBeenCalledWith("modelos/a.stl", 3600)
    })
})
