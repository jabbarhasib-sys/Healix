import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SectionReveal from '../components/SectionReveal'
import GaugeChart from '../components/GaugeChart'

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

const MODULES = [
  { id: 'M1', name: 'Entity Extraction', desc: 'Dual-path parser combining semantic analysis with pattern matching.', metric: 95, label: 'Accuracy' },
  { id: 'M2', name: 'Clinical Reasoning', desc: 'Probabilistic diagnosis using rule-weighted symptom scoring.', metric: 89, label: 'Recall' },
  { id: 'M3', name: 'Ranking Engine',   desc: 'Multi-factor hospital ranking based on specialty and urgency.', metric: 92, label: 'Precision' },
  { id: 'M4', name: 'Financial Model',   desc: 'Stochastic cost modeling based on facility tiers and location.', metric: 96, label: 'Confidence' },
  { id: 'M5', name: 'Calibration',      desc: 'Fusion of data reliability and model agreement metrics.', metric: 88, label: 'Stability' },
  { id: 'M6', name: 'Explainability',   desc: 'Reasoning trace generation for clinical and financial outputs.', metric: 94, label: 'Clarity' },
]

const TECH = [
  { label: 'LLM Runtime',   value: 'Ollama',        detail: 'Local Inference' },
  { label: 'Embeddings',    value: 'MiniLM-L6',     detail: 'On-Device' },
  { label: 'Vector Store',  value: 'ChromaDB',      detail: 'Semantic Search' },
  { label: 'ML Framework',  value: 'FastAPI',       detail: 'Async Python' },
  { label: 'Frontend',      value: 'React + Vite',  detail: 'Vite 5.4' },
  { label: 'Database',      value: 'PostgreSQL',    detail: 'SQLAlchemy' },
]

export default function AITechnology() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', fontFamily: F, background: '#F5F3F0' }}>
      <Navbar />

      <section style={{ padding: '140px 24px 80px', textAlign: 'center', background: '#FFFFFF' }}>
        <SectionReveal>
          <div className="label" style={{ marginBottom: 16 }}>Intelligence Stack</div>
          <h1 style={{ fontSize: 'clamp(38px,6vw,62px)', fontWeight: 700, letterSpacing: -2, lineHeight: 1, marginBottom: 24 }}>
            Architecture of<br /><em style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>Intelligence.</em>
          </h1>
          <p style={{ fontSize: 18, color: '#6B7B8D', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
            A deep technical overview of the six-module AI pipeline and the on-device technology stack powering HEALIX.
          </p>
        </SectionReveal>
      </section>

      <section style={{ padding: '100px 24px', background: '#F5F3F0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionReveal style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="label" style={{ marginBottom: 16 }}>The Pipeline</div>
            <h2 style={{ fontSize: 32, fontWeight: 700 }}>Modular Synthesis</h2>
          </SectionReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {MODULES.map((m, i) => (
              <SectionReveal key={m.id} delay={i * 0.06}>
                <div className="card" style={{ padding: 32 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, paddingRight: 24 }}>
                      <div className="icon-3d-navy" style={{ width: 40, height: 40, fontSize: 13, marginBottom: 16 }}>{m.id}</div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0B1F3D', marginBottom: 12 }}>{m.name}</h3>
                      <p style={{ fontSize: 14, color: '#6B7B8D', lineHeight: 1.7 }}>{m.desc}</p>
                    </div>
                    <GaugeChart value={m.metric} size={84} strokeWidth={6} label={m.label} />
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 24px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionReveal style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="label" style={{ marginBottom: 16 }}>System Stack</div>
            <h2 style={{ fontSize: 32, fontWeight: 700 }}>Core Technologies</h2>
          </SectionReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {TECH.map((t, i) => (
              <SectionReveal key={t.label} delay={i * 0.06}>
                <div className="card" style={{ padding: 32, textAlign: 'center' }}>
                  <div className="data-label" style={{ marginBottom: 12 }}>{t.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#0B1F3D', marginBottom: 6 }}>{t.value}</div>
                  <div style={{ fontSize: 13, color: '#8A97A6' }}>{t.detail}</div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 24px', background: '#0B1F3D', color: '#F5F3F0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <SectionReveal>
            <div className="label" style={{ marginBottom: 20 }}>Privacy Architecture</div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#F5F3F0', marginBottom: 24 }}>Determined Data Sovereignty</h2>
            <p style={{ fontSize: 16, color: 'rgba(245,243,240,0.6)', lineHeight: 1.8, maxWidth: 540, margin: '0 auto 48px' }}>
              Clinical inference is executed locally. Zero patient data is transmitted to external cloud providers. AES-256 encryption secures all database partitions.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['HIPAA', 'SOC 2', 'AES-256', 'ON-DEVICE'].map(b => (
                <span key={b} style={{ 
                  padding: '10px 24px', borderRadius: 8, background: 'rgba(212,175,55,0.08)', 
                  border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37', 
                  fontSize: 12, fontWeight: 700, fontFamily: FM, letterSpacing: 2 
                }}>{b}</span>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      <section style={{ padding: '100px 24px', background: '#F5F3F0', textAlign: 'center' }}>
        <SectionReveal>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>Built for Precision</h2>
          <motion.button onClick={() => navigate('/input')} className="btn-primary" whileHover={{ scale: 1.03 }}
            style={{ padding: '18px 56px', fontSize: 16 }}>Begin Assessment →</motion.button>
        </SectionReveal>
      </section>

      <Footer />
    </div>
  )
}
