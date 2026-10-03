import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SectionReveal from '../components/SectionReveal'
import SeverityBadge from '../components/SeverityBadge'

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

export default function PatientHistory() {
  const navigate = useNavigate()
  const { history, setResult, deleteHistoryItem, clearHistory } = useStore()

  const handleSelectReport = (item) => {
    setResult(item.result)
    navigate('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3F0', fontFamily: F, color: '#0B1F3D', paddingTop: 90 }}>
      <Navbar />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px' }}>
        <SectionReveal>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, borderBottom: '1px solid rgba(11,31,61,0.1)', paddingBottom: 20 }}>
            <div>
              <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#D4AF37', marginBottom: 8 }}>
                PERSISTENT MEDICAL RECORDS
              </p>
              <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>
                Patient Triage History
              </h1>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => { if (window.confirm('Clear all historical triage records?')) clearHistory() }}
                style={{
                  background: 'none', border: '1px solid rgba(220, 38, 38, 0.3)', color: '#DC2626',
                  padding: '8px 16px', borderRadius: 8, fontFamily: FM, fontSize: 11, cursor: 'pointer'
                }}
              >
                Clear History
              </button>
            )}
          </div>
        </SectionReveal>

        {history.length === 0 ? (
          <SectionReveal>
            <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 48, textAlign: 'center', boxShadow: '0 4px 20px rgba(11,31,61,0.04)', border: '1px solid rgba(11,31,61,0.06)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No Triage History Found</h3>
              <p style={{ color: '#6B7B8D', fontSize: 14, maxWidth: 400, margin: '0 auto 24px' }}>
                Your clinical assessments will be automatically saved locally so you can review prior symptom triage records anytime.
              </p>
              <button onClick={() => navigate('/input')} className="btn-primary" style={{ padding: '12px 32px' }}>
                Begin New Triage Assessment
              </button>
            </div>
          </SectionReveal>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnimatePresence>
              {history.map((item, idx) => {
                const dateStr = new Date(item.timestamp).toLocaleString(undefined, {
                  dateStyle: 'medium', timeStyle: 'short'
                })
                return (
                  <motion.div
                    key={item.run_id || idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      background: '#FFFFFF', borderRadius: 14, padding: 24,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      boxShadow: '0 2px 12px rgba(11,31,61,0.04)',
                      border: item.is_emergency ? '1px solid rgba(220, 38, 38, 0.4)' : '1px solid rgba(11,31,61,0.08)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleSelectReport(item)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <span style={{ fontFamily: FM, fontSize: 11, color: '#6B7B8D' }}>{dateStr}</span>
                        <SeverityBadge urgency={item.urgency} isEmergency={item.is_emergency} />
                      </div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: '#0B1F3D' }}>
                        {item.top_condition}
                      </h3>
                      <p style={{ fontSize: 13, color: '#5A769A', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        Symptoms: {item.symptoms}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 24 }}>
                      <button
                        onClick={() => handleSelectReport(item)}
                        className="btn-primary"
                        style={{ padding: '8px 18px', fontSize: 13 }}
                      >
                        View Details →
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.run_id) }}
                        style={{
                          background: 'none', border: 'none', color: '#94A3B8',
                          fontSize: 16, cursor: 'pointer', padding: 4
                        }}
                        title="Delete Record"
                      >
                        ✕
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
