import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { streamPipeline } from '../services/api'
import DNA3D from '../components/DNA3D'
import { useDarkMode } from '../hooks/useDarkMode'

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

const STAGES = [
  { id: 'PARSING',   label: 'Parsing Clinical Entities',  detail: 'NLP extraction from natural language' },
  { id: 'REASONING', label: 'Clinical Reasoning',         detail: 'Probabilistic differential synthesis' },
  { id: 'RISK',      label: 'Risk Assessment',            detail: 'Severity and urgency calibration' },
  { id: 'RANKING',   label: 'Facility Ranking',           detail: 'Multi-factor hospital matching' },
  { id: 'COST',      label: 'Cost Estimation',            detail: 'Stochastic financial modeling' },
  { id: 'EXPLAIN',   label: 'Synthesizing Explanation',   detail: 'Generating reasoning traces' },
]

export default function ProcessingScreen() {
  const navigate = useNavigate()
  const {
    symptomsText, sessionId,
    patientName, patientAge, patientGender,
    pipelineStage, completedStages,
    setResult, setPipelineStage, resetPipeline, setError,
  } = useStore()
  const [isDark] = useDarkMode()

  const [errorMsg, setErrorMsg] = useState(null)
  // Visual stage ticker — animates stages every 2.2s while waiting for backend
  const [visualStage, setVisualStage] = useState(0)

  useEffect(() => {
    if (!symptomsText) { navigate('/input'); return }
    resetPipeline()
    setErrorMsg(null)

    // ── Visual ticker: advances regardless of backend, for UX feel ──
    let tick = 0
    const ticker = setInterval(() => {
      tick = Math.min(tick + 1, STAGES.length - 1)
      setVisualStage(tick)
      setPipelineStage(STAGES[tick].id, STAGES[tick].label)
    }, 2200)

    // ── Real backend call ──
    const cleanup = streamPipeline({
      symptomsText,
      sessionId,
      patientName,
      patientAge,
      patientGender,
      onStage: (stageId, label) => setPipelineStage(stageId, label),
      onResult: (data) => {
        clearInterval(ticker)
        setResult(data)
        navigate('/dashboard')
      },
      onError: (err) => {
        clearInterval(ticker)
        const msg = err?.message || 'Unknown error'
        setErrorMsg(msg)
        setError(msg)
        // Do NOT navigate away — show error inline so the user knows what happened
      },
    })

    return () => { cleanup(); clearInterval(ticker) }
  }, [symptomsText, sessionId, navigate, setPipelineStage, setResult, resetPipeline, setError])

  // Current visible stage index
  const activeIdx = errorMsg
    ? -1
    : STAGES.findIndex(s => s.id === pipelineStage)

  const progress = completedStages.length / STAGES.length

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#1e2229' : '#F5F3F0', fontFamily: F, position: 'relative', overflowX: 'hidden' }}>
      <DNA3D />
      <Navbar />

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '140px 24px 80px', position: 'relative', zIndex: 1, background: 'radial-gradient(circle, rgba(245,243,240,0.85) 0%, rgba(245,243,240,0) 80%)' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="label" style={{ marginBottom: 16 }}>
            {errorMsg ? 'Pipeline Halted' : 'Pipeline in Progress'}
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 700, color: '#0B1F3D', marginBottom: 20, letterSpacing: -0.5 }}>
            {errorMsg
              ? <>Analysis <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#C62828' }}>Interrupted</em></>
              : <>Processing Clinical <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>Intelligence</em></>
            }
          </h1>

          {/* Progress bar */}
          {!errorMsg && (
            <div style={{ height: 4, background: 'rgba(11,31,61,0.06)', borderRadius: 2, overflow: 'hidden', maxWidth: 440, margin: '0 auto 8px' }}>
              <motion.div
                animate={{ width: `${Math.max((visualStage + 1) / STAGES.length, progress) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #0B1F3D, #D4AF37)', borderRadius: 2 }}
              />
            </div>
          )}
          {!errorMsg && (
            <p style={{ fontFamily: FM, fontSize: 10, color: 'rgba(11,31,61,0.3)', letterSpacing: 1.5, marginTop: 6 }}>
              STAGE {Math.min(visualStage + 1, STAGES.length)} OF {STAGES.length}
            </p>
          )}
        </div>

        {/* ── Error Card ── */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              style={{
                background: '#FFF5F5', border: '1px solid rgba(198,40,40,0.15)',
                borderRadius: 16, padding: '32px 36px', marginBottom: 32,
                boxShadow: '0 4px 12px rgba(198,40,40,0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#C62828', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 8px rgba(198,40,40,0.25)',
                }}>
                  <span style={{ color: '#FFF', fontWeight: 900, fontSize: 20, lineHeight: 1 }}>!</span>
                </div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#C62828', marginBottom: 8 }}>
                    Backend Pipeline Error
                  </h3>
                  <p style={{ fontSize: 14, color: '#6B7B8D', lineHeight: 1.7, marginBottom: 16 }}>
                    The analysis pipeline could not complete. This is usually caused by the AI model not being available.
                  </p>
                  {/* Technical detail */}
                  <div style={{
                    background: 'rgba(11,31,61,0.04)', borderRadius: 8, padding: '10px 14px',
                    fontFamily: FM, fontSize: 11, color: 'rgba(11,31,61,0.5)',
                    wordBreak: 'break-word', marginBottom: 16,
                  }}>
                    {errorMsg}
                  </div>
                  {/* Checklist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      'Ensure Ollama is running: ollama serve',
                      'Confirm model is pulled: ollama list',
                      'Backend must be at: http://localhost:8000',
                    ].map((tip, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: '#0B1F3D', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 700 }}>
                          {i + 1}
                        </div>
                        <span style={{ fontSize: 13, color: '#4A5968', fontFamily: F, lineHeight: 1.5 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => { setErrorMsg(null); navigate('/processing') }}
                  className="btn-primary"
                  style={{ padding: '12px 28px', fontSize: 14 }}
                >
                  Retry Analysis
                </button>
                <button
                  onClick={() => navigate('/input')}
                  className="btn-outline"
                  style={{ padding: '12px 24px', fontSize: 14 }}
                >
                  Edit Symptoms
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stage Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {STAGES.map((s, i) => {
            const isCompleted = completedStages.includes(s.id)
            const isActive = !errorMsg && visualStage === i
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className={isActive ? 'panel-3d' : 'card'}
                style={{
                  padding: 24,
                  opacity: errorMsg ? 0.4 : (isCompleted || isActive ? 1 : i > visualStage ? 0.35 : 0.7),
                  borderLeft: isActive ? '4px solid #D4AF37' : '1px solid rgba(11,31,61,0.06)',
                  transform: isActive ? 'scale(1.03)' : 'scale(1)',
                  transition: 'all 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div className="icon-3d-navy" style={{ width: 32, height: 32, fontSize: 11 }}>
                    {i + 1}
                  </div>
                  {isCompleted && (
                    <div style={{ width: 24, height: 24, borderRadius: 8, background: '#F0FFF4', border: '1px solid #C6F6D5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E7D32', fontSize: 12, fontWeight: 900 }}>✓</div>
                  )}
                  {isActive && !isCompleted && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D4AF37', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  )}
                </div>
                <div style={{ fontFamily: F, fontSize: 15, fontWeight: 700, color: '#0B1F3D', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontFamily: F, fontSize: 12, color: '#8A97A6', lineHeight: 1.6 }}>{s.detail}</div>
              </motion.div>
            )
          })}
        </div>

        {!errorMsg && (
          <p style={{ textAlign: 'center', fontFamily: FM, fontSize: 10, color: 'rgba(11,31,61,0.2)', letterSpacing: 1.5, marginTop: 40 }}>
            HEALIX AI · DO NOT CLOSE THIS WINDOW
          </p>
        )}
      </div>

      <Footer />
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.7)}}`}</style>
    </div>
  )
}
