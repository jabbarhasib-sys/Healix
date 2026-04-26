import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SectionReveal from '../components/SectionReveal'
import AnimatedCounter from '../components/AnimatedCounter'

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

const DIFFS = [
  { id: 'IQ', title: 'Clinical IQ', desc: 'Six AI modules process natural language for instant diagnostic insights.' },
  { id: 'DS', title: 'Data Sovereignty', desc: 'Ollama local inference ensures zero clinical data leaves your device.' },
  { id: 'XT', title: 'Total Transparency', desc: 'Itemized cost breakdowns with min/max ranges. No hidden fees.' },
  { id: 'SM', title: 'Smart Matching', desc: 'Multi-factor ranking considering specialty, distance, and facility tier.' },
  { id: 'EX', title: 'Explainability', desc: 'Detailed reasoning traces explaining every clinical and financial output.' },
  { id: 'CC', title: 'Confidence Calibration', desc: 'Uncertainty-aware scoring identifies the reliability of every result.' },
]

export default function WhyHealix() {
  const navigate = useNavigate()
  const [roi, setRoi] = useState(100)

  return (
    <div style={{ minHeight: '100vh', fontFamily: F, background: '#F5F3F0' }}>
      <Navbar />

      <section style={{ padding: '140px 24px 80px', textAlign: 'center', background: '#FFFFFF' }}>
        <SectionReveal>
          <div className="label" style={{ marginBottom: 16 }}>Value Proposition</div>
          <h1 style={{ fontSize: 'clamp(38px,6vw,62px)', fontWeight: 700, letterSpacing: -2, lineHeight: 1, marginBottom: 24 }}>
            Access to<br /><em style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>Intelligence.</em>
          </h1>
          <p style={{ fontSize: 18, color: '#6B7B8D', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
            Systemic healthcare access issues solved through real-time, explainable clinical intelligence.
          </p>
        </SectionReveal>

        <div style={{ display: 'flex', gap: 48, justifyContent: 'center', marginTop: 56, flexWrap: 'wrap' }}>
          {[
            { end: 68, suffix: '%', label: 'Informed Choice Gap' },
            { end: 73, suffix: '%', label: 'Financial Surprises' },
            { end: 42, suffix: '%', label: 'Treatment Delays' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: '#C62828' }}>
                <AnimatedCounter end={s.end} />
                <span style={{ fontSize: 32 }}>{s.suffix}</span>
              </div>
              <div className="data-label" style={{ marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '100px 24px', background: '#F5F3F0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionReveal style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="label" style={{ marginBottom: 16 }}>Differentiators</div>
            <h2 style={{ fontSize: 32, fontWeight: 700 }}>Strategic Advantages</h2>
          </SectionReveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {DIFFS.map((d, i) => (
              <SectionReveal key={d.title} delay={i * 0.06}>
                <div className="card" style={{ padding: 32, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <div className="icon-3d-navy" style={{ width: 44, height: 44, fontSize: 13, flexShrink: 0 }}>{d.id}</div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0B1F3D', marginBottom: 8 }}>{d.title}</h3>
                    <p style={{ fontSize: 14, color: '#6B7B8D', lineHeight: 1.7, margin: 0 }}>{d.desc}</p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 24px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <SectionReveal style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="label" style={{ marginBottom: 16 }}>ROI Model</div>
            <h2 style={{ fontSize: 32, fontWeight: 700 }}>Savings Projection</h2>
          </SectionReveal>
          <div className="panel-3d" style={{ padding: 48 }}>
            <label style={{ fontFamily: FM, fontSize: 10, color: 'rgba(11,31,61,0.4)', letterSpacing: 2, display: 'block', marginBottom: 12 }}>MONTHLY VOLUME</label>
            <input type="range" min={10} max={1000} value={roi} onChange={e => setRoi(Number(e.target.value))}
              style={{ width: '100%', marginBottom: 12, accentColor: '#D4AF37' }} />
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <span style={{ fontSize: 44, fontWeight: 700, color: '#0B1F3D' }}>{roi}</span>
              <span style={{ fontSize: 16, color: '#6B7B8D', marginLeft: 12 }}>consultations</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
              <div style={{ textAlign: 'center', padding: 20, background: '#F5F3F0', borderRadius: 12 }}>
                <div className="data-label" style={{ marginBottom: 8 }}>Time Saved</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#0B1F3D' }}>{Math.round(roi * 2.5)}h</div>
              </div>
              <div style={{ textAlign: 'center', padding: 20, background: '#F5F3F0', borderRadius: 12 }}>
                <div className="data-label" style={{ marginBottom: 8 }}>Investment</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#2E7D32' }}>₹{(roi * 850).toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'center', padding: 20, background: '#F5F3F0', borderRadius: 12 }}>
                <div className="data-label" style={{ marginBottom: 8 }}>Efficiency</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#D4AF37' }}>+34%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
