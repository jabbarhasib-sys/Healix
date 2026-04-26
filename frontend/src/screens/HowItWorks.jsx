import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SectionReveal from '../components/SectionReveal'

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

const STEPS = [
  { id: '01', title: 'Clinical Description', detail: 'Enter your symptoms in natural language. Our AI extracts clinical entities, duration, and severity markers.', color: '#0B1F3D' },
  { id: '02', title: 'Modular Analysis',  detail: 'Six specialized AI modules process your input simultaneously — parsing, reasoning, and risk calibration.', color: '#2E4F78' },
  { id: '03', title: 'Decision Synthesis', detail: 'Receive probabilistic differential diagnosis with confidence scores and detailed reasoning traces.', color: '#5A769A' },
  { id: '04', title: 'Facility Ranking',    detail: 'Dynamic multi-factor ranking considers specialty fit, distance, ER capability, and budget.', color: '#D4AF37' },
  { id: '05', title: 'Cost Analysis',      detail: 'Stochastic cost estimation provides itemized breakdowns of the expected medical investment.', color: '#B8962E' },
]

const COMPARE = [
  { feature: 'Analysis Speed', healix: '< 3 seconds', traditional: '24-72 hours' },
  { feature: 'Cost Clarity',   healix: 'Itemized ranges', traditional: 'Hidden until billing' },
  { feature: 'Facility Match', healix: 'Multi-factor AI', traditional: 'Subjective referral' },
  { feature: 'Explainability', healix: 'Full reasoning trace', traditional: 'Minimal rationale' },
  { feature: 'Data Sovereignty', healix: 'On-device LLM', traditional: 'Cloud-based storage' },
]

export default function HowItWorks() {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(null)

  return (
    <div style={{ minHeight: '100vh', fontFamily: F, background: '#F5F3F0' }}>
      <Navbar />

      <section style={{ padding: '140px 24px 80px', textAlign: 'center', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <SectionReveal>
            <div className="label" style={{ marginBottom: 16 }}>The Methodology</div>
            <h1 style={{ fontSize: 'clamp(38px,6vw,62px)', fontWeight: 700, letterSpacing: -2, lineHeight: 1, marginBottom: 24 }}>
              Intelligent<br /><em style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>Pathways.</em>
            </h1>
            <p style={{ fontSize: 18, color: '#6B7B8D', lineHeight: 1.8, maxWidth: 520, margin: '0 auto' }}>
              A deterministic five-step journey from symptomatic description to actionable clinical intelligence.
            </p>
          </SectionReveal>
        </div>
      </section>

      <section style={{ padding: '100px 24px', background: '#F5F3F0' }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          {STEPS.map((s, i) => (
            <SectionReveal key={s.id} delay={i * 0.08}>
              <div style={{ display: 'flex', gap: 32, marginBottom: 24, cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === i ? null : i)}>
                <div style={{ flexShrink: 0, textAlign: 'center' }}>
                  <div className="icon-3d-navy" style={{ width: 64, height: 64, fontSize: 20 }}>{s.id}</div>
                  {i < STEPS.length - 1 && <div style={{ width: 2, height: 48, background: 'rgba(11,31,61,0.06)', margin: '12px auto 0' }} />}
                </div>
                <div className="card" style={{ flex: 1, padding: 32 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: '#0B1F3D' }}>{s.title}</h3>
                    <div className="icon-3d" style={{ width: 32, height: 32, fontSize: 16 }}>{expanded === i ? '—' : '+'}</div>
                  </div>
                  <motion.div initial={false} animate={{ height: expanded === i ? 'auto' : 0, opacity: expanded === i ? 1 : 0 }} style={{ overflow: 'hidden' }}>
                    <p style={{ fontSize: 15, color: '#6B7B8D', lineHeight: 1.8, marginTop: 16, margin: '16px 0 0' }}>{s.detail}</p>
                  </motion.div>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      <section style={{ padding: '100px 24px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <SectionReveal style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="label" style={{ marginBottom: 16 }}>Comparison</div>
            <h2 style={{ fontSize: 32, fontWeight: 700 }}>Benchmarks</h2>
          </SectionReveal>

          <div className="panel-3d" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', background: '#0B1F3D', color: '#F5F3F0', padding: '20px 32px' }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, fontFamily: FM }}>FEATURE</span>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, fontFamily: FM, color: '#D4AF37' }}>HEALIX AI</span>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, fontFamily: FM }}>TRADITIONAL</span>
            </div>
            {COMPARE.map((c, i) => (
              <div key={c.feature} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', padding: '20px 32px', borderBottom: i < COMPARE.length - 1 ? '1px solid rgba(11,31,61,0.06)' : 'none', background: i % 2 === 0 ? '#FFFFFF' : '#FAF9F7' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0B1F3D' }}>{c.feature}</span>
                <span style={{ fontSize: 15, color: '#2E7D32', fontWeight: 600 }}>{c.healix}</span>
                <span style={{ fontSize: 15, color: '#8A97A6' }}>{c.traditional}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 24px', background: '#F5F3F0', textAlign: 'center' }}>
        <SectionReveal>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>Experience Clinical Sovereignty</h2>
          <motion.button onClick={() => navigate('/input')} className="btn-primary" whileHover={{ scale: 1.03 }}
            style={{ padding: '18px 56px', fontSize: 16 }}>Begin Assessment →</motion.button>
        </SectionReveal>
      </section>

      <Footer />
    </div>
  )
}
