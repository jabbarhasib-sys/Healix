import { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SectionReveal from '../components/SectionReveal'

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

const BADGES = [
  { name: 'HIPAA', id: 'HP', desc: 'Compliance with health data portability and accountability standards.' },
  { name: 'SOC 2',  id: 'SC', desc: 'Enterprise-grade service organization control and security auditing.' },
  { name: 'GDPR',  id: 'GD', desc: 'Adherence to stringent data protection and privacy regulations.' },
  { name: 'ISO',   id: 'IS', desc: 'International standards for information security management.' },
]

const LAYERS = [
  { n: '1', title: 'Input Protocol',  tag: 'TLS 1.3',    detail: 'Asymmetric 256-bit encryption for all data in transit.' },
  { n: '2', title: 'Inference Layer', tag: 'Local LLM',  detail: 'On-device analysis ensures clinical data never leaves the system.' },
  { n: '3', title: 'Storage Logic',   tag: 'AES-256',    detail: 'Symmetric encryption at rest for all database partitions.' },
  { n: '4', title: 'Access Control',  tag: 'Signed JWT', detail: 'Granular token-based authentication and integrity verification.' },
]

export default function SecurityCompliance() {
  const [faq, setFaq] = useState(null)

  return (
    <div style={{ minHeight: '100vh', fontFamily: F, background: '#F5F3F0' }}>
      <Navbar />

      <section style={{ padding: '140px 24px 80px', textAlign: 'center', background: '#0B1F3D', color: '#F5F3F0' }}>
        <SectionReveal>
          <div style={{ fontFamily: FM, fontSize: 11, fontWeight: 600, letterSpacing: 3, color: '#D4AF37', marginBottom: 20 }}>SECURITY PROTOCOL</div>
          <h1 style={{ fontSize: 'clamp(38px,6vw,62px)', fontWeight: 700, letterSpacing: -2, lineHeight: 1, color: '#F5F3F0', marginBottom: 24 }}>
            Trust Through<br /><em style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>Integrity.</em>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(245,243,240,0.6)', lineHeight: 1.8, maxWidth: 540, margin: '0 auto' }}>
            Enterprise-grade safeguards protecting sensitive clinical intelligence at every modular layer.
          </p>
        </SectionReveal>

        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 56, flexWrap: 'wrap' }}>
          {BADGES.map(b => (
            <SectionReveal key={b.name} delay={0.1}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 20, padding: '32px 28px', textAlign: 'center', width: 220 }}>
                <div className="icon-3d-navy" style={{ width: 48, height: 48, margin: '0 auto 16px', color: '#D4AF37', background: 'rgba(212,175,55,0.1)' }}>{b.id}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#F5F3F0', marginBottom: 8 }}>{b.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(245,243,240,0.4)', lineHeight: 1.5 }}>{b.desc}</div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      <section style={{ padding: '100px 24px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <SectionReveal style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="label" style={{ marginBottom: 16 }}>Encryption Architecture</div>
            <h2 style={{ fontSize: 32, fontWeight: 700 }}>End-to-End Governance</h2>
          </SectionReveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {LAYERS.map((l, i) => (
              <SectionReveal key={l.n} delay={i * 0.1}>
                <div className="card" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                  <div className="icon-3d-navy" style={{ width: 56, height: 56, fontSize: 18, flexShrink: 0 }}>{l.n}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0B1F3D' }}>{l.title}</h3>
                      <span className="badge-gold" style={{ fontSize: 10 }}>{l.tag}</span>
                    </div>
                    <p style={{ fontSize: 14, color: '#6B7B8D', lineHeight: 1.6, margin: 0 }}>{l.detail}</p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 24px', background: '#F5F3F0' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <SectionReveal style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="label" style={{ marginBottom: 16 }}>FAQ</div>
            <h2 style={{ fontSize: 32, fontWeight: 700 }}>Security Compliance FAQ</h2>
          </SectionReveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { q: 'Is clinical data persisted?', a: 'Only anonymised audit logs are retained for system optimization. No PII is persisted in the inference environment.' },
              { q: 'Where does LLM reasoning occur?', a: 'Inference occurs strictly on the patient’s local machine via Ollama. No clinical entities are transmitted to cloud APIs.' },
              { q: 'How is data encrypted at rest?', a: 'The local database uses AES-256-GCM encryption with periodic key rotation policies.' },
            ].map((f, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <button onClick={() => setFaq(faq === i ? null : i)}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: faq === i ? '#D4AF37' : '#0B1F3D', flex: 1 }}>{f.q}</span>
                  <div className="icon-3d" style={{ width: 32, height: 32 }}>{faq === i ? '—' : '+'}</div>
                </button>
                <motion.div initial={false} animate={{ height: faq === i ? 'auto' : 0, opacity: faq === i ? 1 : 0 }} style={{ overflow: 'hidden' }}>
                  <p style={{ padding: '0 28px 24px', fontSize: 15, color: '#6B7B8D', lineHeight: 1.8, margin: 0 }}>{f.a}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
