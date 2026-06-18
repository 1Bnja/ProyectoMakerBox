export const BASE_URL = "https://proyecto-maker-box-git-develop-1bnjas-projects.vercel.app"

export const SUPABASE_URL = "https://jsazsbztkxdhmtzdoscm.supabase.co"
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzYXpzYnp0a3hkaG10emRvc2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzQ0MzYsImV4cCI6MjA5MDcxMDQzNn0.giJhKevb0bhLA-EzmTCb7WqzbFQF-UfxBBO8kr1Rwm8"

export const TEST_USER = {
  email: "test@makerbox.com",
  password: "test2026",
}

export const THRESHOLDS = {
  http_req_duration: ["p(95)<2000", "p(99)<3500"],
  http_req_failed: ["rate<0.01"],
}