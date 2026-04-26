import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SectionReveal from '../components/SectionReveal'
import AnimatedCounter from '../components/AnimatedCounter'

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

const STATS = [
  { end: 12500, suffix: '+', label: 'Clinical Sessions', color: '#0B1F3D' },
  { end: 94.2, suffix: '%', label: 'Diagnostic Recall', color: '#2E7D32', decimals: 1 },
  { end: 2.8,  suffix: 's', label: 'Avg Latency',      color: '#D4AF37', decimals: 1 },
  { end: 500,  suffix: '+', label: 'Facility Network',  color: '#0B1F3D' },
]

const CASES = [
  {
    title: 'Emergency Cardiac Triage',
    meta: 'Male, 48 · Acute Myocardial Infarction',
    outcome: 'Emergency protocol initiated within 1.4s. Patient matched to specialty cardiac center 0.8km away. Immediate intervention possible.',
    impact: 'Life-saving latency reduction in critical triage.',
    sev: 'CRITICAL',
  },
  {
    title: 'Cost-Optimized Orthopedics',
    meta: 'Female, 62 · Bilateral Osteoarthritis',
    outcome: 'Identified ₹1.2L price differential between academic and premium facilities. Patient achieved optimal outcomes within budget.',
    impact: '₹1,20,000 saved through financial transparency.',
    sev: 'ROUTINE',
  },
]

export default function ImpactResults() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', fontFamily: F, background: '#F5F3F0' }}>
      <Navbar />

      <section style={{ padding: '140px 24px 80px', textAlign: 'center', background: '#FFFFFF' }}>
        <SectionReveal>
          <div className="label" style={{ marginBottom: 16 }}>Performance Metrics</div>
          <h1 style={{ fontSize: 'clamp(38px,6vw,62px)', fontWeight: 700, letterSpacing: -2, lineHeight: 1, marginBottom: 24 }}>
            Measurable<br /><em style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>Outcomes.</em>
          </h1>
        </SectionReveal>

        <div style={{ display: 'flex', gap: 64, justifyContent: 'center', marginTop: 56, flexWrap: 'wrap' }}>
          {STATS.map(s => (
            <SectionReveal key={s.label} delay={0.1}>
              <div style={{ textAlign: 'center', minWidth: 160 }}>
                <div style={{ fontSize: 48, fontWeight: 700, color: s.color }}>
                  <AnimatedCounter end={s.end} decimals={s.decimals || 0} />
                  <span style={{ fontSize: 32 }}>{s.suffix}</span>
                </div>
                <div className="data-label" style={{ marginTop: 8 }}>{s.label}</div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      <section style={{ padding: '100px 24px', background: '#F5F3F0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionReveal style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="label" style={{ marginBottom: 16 }}>Case Evidence</div>
            <h2 style={{ fontSize: 32, fontWeight: 700 }}>Clinical Case Studies</h2>
          </SectionReveal>

          {CASES.map((c, i) => (
            <SectionReveal key={c.title} delay={i * 0.1} style={{ marginBottom: 24 }}>
              <div className="card" style={{ padding: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: '#0B1F3D', marginBottom: 6 }}>{c.title}</h3>
                    <p style={{ fontSize: 13, color: '#8A97A6', fontFamily: FM }}>{c.meta.toUpperCase()}</p>
                  </div>
                  <div className={c.sev === 'CRITICAL' ? 'badge-critical' : 'badge-routine'}>{c.sev}</div>
                </div>
                <p style={{ fontSize: 16, color: '#6B7B8D', lineHeight: 1.8, marginBottom: 24 }}>{c.outcome}</p>
                <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 12, padding: '16px 20px' }}>
                  <span style={{ fontFamily: FM, fontSize: 11, color: '#D4AF37', fontWeight: 700, letterSpacing: 2 }}>IMPACT: </span>
                  <span style={{ fontSize: 15, color: '#0B1F3D', fontWeight: 600 }}>{c.impact}</span>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      <section style={{ padding: '100px 24px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <SectionReveal style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="label" style={{ marginBottom: 16 }}>The Journey</div>
            <h2 style={{ fontSize: 32, fontWeight: 700 }}>Development Timeline</h2>
          </SectionReveal>
          {[
            { date: 'JAN 2026', event: 'Architecture Design' },
            { date: 'FEB 2026', event: 'Modular AI Pipeline Prototyping' },
            { date: 'MAR 2026', event: 'Local LLM Inference Integration' },
            { date: 'APR 2026', event: 'Platform Launch' },
          ].map((t, i) => (
            <SectionReveal key={t.date} delay={i * 0.1}>
              <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
                <div style={{ flexShrink: 0, textAlign: 'center' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#0B1F3D', border: '3px solid #FFFFFF', boxShadow: '0 0 0 1px rgba(11,31,61,0.1)' }} />
                  {i < 3 && <div style={{ width: 2, height: 48, background: 'rgba(11,31,61,0.06)', margin: '4px auto 0' }} />}
                </div>
                <div style={{ paddingTop: 0 }}>
                  <span style={{ fontFamily: FM, fontSize: 11, color: '#D4AF37', fontWeight: 700 }}>{t.date}</span>
                  <p style={{ fontSize: 16, color: '#0B1F3D', fontWeight: 600, marginTop: 4 }}>{t.event}</p>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
