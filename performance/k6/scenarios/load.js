import http from "k6/http"
import { check, sleep } from "k6"
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js"
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js"
import { login, restoreSession } from "../helpers/auth.js"
import { BASE_URL, THRESHOLDS } from "../config.js"

export const options = {
  stages: [
    { duration: "2m", target: 50 },  
    { duration: "3m", target: 50 },  
    { duration: "30s", target: 0 },  
  ],
  thresholds: THRESHOLDS,
}

let loggedIn = false

export default function () {
  if (!loggedIn) {
    const ok = login()
    check(null, { "login ok": () => ok === true })
    loggedIn = true
    sleep(1)
  } else {
    restoreSession()
  }

  const meRes = http.get(`${BASE_URL}/api/auth/me`)
  const mePassed = check(meRes, { "me 200": (r) => r.status === 200 })
  if (!mePassed) console.error(`me falló: ${meRes.status} ${meRes.body}`)
  sleep(1)

  const cursosRes = http.get(`${BASE_URL}/api/cursos`)
  check(cursosRes, { "cursos 200": (r) => r.status === 200 })
  sleep(1)

  const solicitudRes = http.post(
    `${BASE_URL}/api/solicitudes`,
    JSON.stringify({ stl_path: "perf-test/modelo.stl", comentario: "prueba de rendimiento" }),
    { headers: { "Content-Type": "application/json" } }
  )
  check(solicitudRes, { "solicitud creada 200": (r) => r.status === 200 })
  sleep(1)
}

export function handleSummary(data) {
  return {
    "performance/reports/load-report.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  }
}
