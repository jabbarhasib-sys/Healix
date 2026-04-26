import { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SectionReveal from '../components/SectionReveal'

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

const FAQ = [
  { q: 'Is HEALIX a replacement for clinical consultation?', a: 'No. HEALIX is a clinical decision support tool for informational guidance. Always consult a board-certified physician for diagnosis and treatment.' },
  { q: 'How is diagnostic accuracy maintained?', a: 'HEALIX utilizes probabilistic clinical reasoning synthesized with rule-based scoring. Uncertainty-aware confidence scores accompany every output.' },
  { q: 'Is my clinical data private?', a: 'Yes. With on-device inference, all clinical analysis happens locally. Your symptoms never leave your machine. Only anonymised logs reach the backend.' },
  { q: 'What are the system requirements?', a: 'HEALIX requires Ollama to be running locally for LLM inference. GPU acceleration is recommended for real-time performance.' },
]

const CONTACTS = [
  { id: 'E', label: 'Primary', value: 'support@healix.ai', href: 'mailto:support@healix.ai' },
  { id: 'B', label: 'Technical', value: 'bugs@healix.ai', href: 'mailto:bugs@healix.ai' },
  { id: 'H', label: 'Hackathon', value: 'team@healix.ai', href: 'mailto:team@healix.ai' },
]

const STEPS = [
  { n: '1', title: 'Ollama', cmd: 'ollama serve' },
  { n: '2', title: 'Model',  cmd: 'ollama pull llama3.2' },
  { n: '3', title: 'Backend', cmd: 'uvicorn main:app' },
  { n: '4', title: 'Front',   cmd: 'npm run dev' },
]

export default function Support() {
  const [open, setOpen] = useState(null)

  return (
    <div style={{ minHeight: '100vh', fontFamily: F, background: '#F5F3F0' }}>
      <Navbar />

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '120px 24px 80px' }}>

        <SectionReveal style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="label" style={{ marginBottom: 16 }}>Technical Support</div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, letterSpacing: -1.5, marginBottom: 16 }}>
            Clinical <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>Assistance.</em>
          </h1>
          <p style={{ fontSize: 16, color: '#6B7B8D', maxWidth: 440, margin: '0 auto', lineHeight: 1.75 }}>
            Access our technical documentation or reach out to our engineering team directly.
          </p>
        </SectionReveal>

        <SectionReveal delay={0.08} style={{ marginBottom: 56 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {CONTACTS.map(c => (
              <a key={c.label} href={c.href} className="card"
                style={{ textDecoration: 'none', padding: '32px 24px', display: 'block' }}>
                <div className="icon-3d-navy" style={{ width: 44, height: 44, fontSize: 14, marginBottom: 16 }}>{c.id}</div>
                <div className="data-label" style={{ marginBottom: 8 }}>{c.label}</div>
                <div style={{ fontSize: 14, color: '#D4AF37', fontFamily: FM, fontWeight: 500 }}>{c.value}</div>
              </a>
            ))}
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1} style={{ marginBottom: 56 }}>
          <div className="card" style={{ padding: 40, borderLeft: '4px solid #D4AF37' }}>
            <div className="label" style={{ marginBottom: 24 }}>System Deployment</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
              {STEPS.map(s => (
                <div key={s.n}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ 
                      width: 24, height: 24, borderRadius: '50%', background: '#0B1F3D', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: 11, fontWeight: 700, color: '#D4AF37' 
                    }}>{s.n}</div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0B1F3D' }}>{s.title}</span>
                  </div>
                  <code style={{ 
                    fontSize: 12, color: '#6B7B8D', fontFamily: FM, background: '#F5F3F0', 
                    padding: '8px 12px', borderRadius: 8, display: 'block', border: '1px solid rgba(0,0,0,0.03)' 
                  }}>{s.cmd}</code>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.12}>
          <div className="label" style={{ marginBottom: 12 }}>FAQ</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQ.map((f, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <button onClick={() => setOpen(open === i ? null : i)}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, textAlign: 'left' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: open === i ? '#D4AF37' : '#0B1F3D', flex: 1 }}>{f.q}</span>
                  <div className="icon-3d" style={{ width: 32, height: 32, fontSize: 16 }}>{open === i ? '—' : '+'}</div>
                </button>
                <motion.div initial={false} animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }} style={{ overflow: 'hidden' }}>
                  <p style={{ padding: '0 28px 24px', fontSize: 15, color: '#6B7B8D', lineHeight: 1.8, margin: 0 }}>{f.a}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>

      <Footer />
    </div>
  )
}
