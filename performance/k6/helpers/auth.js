import http from "k6/http"
import { BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, TEST_USER } from "../config.js"

const PROJECT_REF = SUPABASE_URL.replace("https://", "").split(".")[0]
const COOKIE_NAME = `sb-${PROJECT_REF}-auth-token`
const CHUNK_SIZE = 3180


let savedCookieEncoded = null

function setCookieFromEncoded(encoded) {
  const jar = http.cookieJar()
  if (encoded.length > CHUNK_SIZE) {
    for (let i = 0; i * CHUNK_SIZE < encoded.length; i++) {
      const chunk = encoded.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
      jar.set(BASE_URL, `${COOKIE_NAME}.${i}`, chunk, { path: "/" })
    }
  } else {
    jar.set(BASE_URL, COOKIE_NAME, encoded, { path: "/" })
  }
}

export function login() {
  const authRes = http.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password }),
    {
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      }
    }
  )

  if (authRes.status !== 200) {
    console.error(`Login falló: ${authRes.status} ${authRes.body}`)
    return false
  }

  const session = JSON.parse(authRes.body)
  savedCookieEncoded = encodeURIComponent(JSON.stringify(session))
  setCookieFromEncoded(savedCookieEncoded)
  return true
}

export function restoreSession() {
  if (savedCookieEncoded) {
    setCookieFromEncoded(savedCookieEncoded)
  }
}
