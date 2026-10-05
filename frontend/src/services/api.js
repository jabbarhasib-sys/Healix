/**
 * services/api.js
 * Centralised HTTP + WebSocket client for the Healix backend.
 */
import axios from 'axios'

const isProd = import.meta.env.PROD
const BASE    = import.meta.env.VITE_API_URL || (isProd ? window.location.origin : 'http://localhost:8000')
const WS_BASE = BASE.replace(/^http/, 'ws')

/** Axios instance with backend base URL and generous AI timeout. */
const http = axios.create({ baseURL: BASE, timeout: 120_000 })

/** Check backend health. Returns { status: 'ok' } on success. */
export const getHealth  = ()             => http.get('/api/health').then(r => r.data)
/** Run the full AI diagnostic pipeline via REST (non-streaming). */
export const runPipeline = (text, sid, name, age, gender, city, lat, lng) => 
  http.post('/api/pipeline/run', { 
    symptoms_text: text, 
    session_id: sid,
    patient_name: name,
    patient_age: age,
    patient_gender: gender,
    city: city || 'Bangalore',
    lat: lat || undefined,
    lng: lng || undefined,
  }).then(r => r.data)

/** Fetch past assessment history for a session. */
export const getHistory = (sessionId, limit = 10) =>
  http.get('/api/pipeline/history', { params: { session_id: sessionId, limit } }).then(r => r.data)

export function streamPipeline({ symptomsText, sessionId, patientName, patientAge, patientGender, city, lat, lng, onStage, onResult, onError }) {
  let ws
  try {
    ws = new WebSocket(`${WS_BASE}/ws/pipeline`)
  } catch {
    // WS failed — fall back to REST
    runPipeline(symptomsText, sessionId, patientName, patientAge, patientGender, city, lat, lng)
      .then(data => onResult?.(data))
      .catch(err => onError?.(err))
    return () => {}
  }

  ws.onopen    = () => ws.send(JSON.stringify({ 
    symptoms_text: symptomsText, 
    session_id: sessionId,
    patient_name: patientName,
    patient_age: patientAge,
    patient_gender: patientGender,
    city: city || 'Bangalore',
    lat: lat || undefined,
    lng: lng || undefined,
  }))
  ws.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data)
      if (msg.type === 'stage')  onStage?.(msg.stage, msg.label)
      if (msg.type === 'result') onResult?.(msg.data)
      if (msg.type === 'error')  onError?.(new Error(msg.message))
    } catch {}
  }
  ws.onerror = () => {
    // WS error — try REST fallback
    runPipeline(symptomsText, sessionId, patientName, patientAge, patientGender, city, lat, lng)
      .then(data => onResult?.(data))
      .catch(err => onError?.(err))
  }

  return () => ws.readyState === WebSocket.OPEN && ws.close()
}
