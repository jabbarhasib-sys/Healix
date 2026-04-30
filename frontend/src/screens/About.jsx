import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SectionReveal from '../components/SectionReveal'
import HealixLogo from '../components/HealixLogo'

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

export default function About() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: F, background: '#F5F3F0' }}>
      <Navbar />

      <section style={{ padding: '140px 24px 80px', textAlign: 'center', background: 'linear-gradient(180deg, #F5F3F0 0%, #EDE9E3 100%)' }}>
        <SectionReveal>
          <HealixLogo size={90} />
          <div style={{ marginTop: 40 }}>
            <div className="label" style={{ marginBottom: 16 }}>Clinical Philosophy</div>
            <h1 style={{ fontSize: 'clamp(38px,6vw,68px)', fontWeight: 700, letterSpacing: -1.5, marginBottom: 24, lineHeight: 1 }}>
              Decision<br />
              <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>Intelligence.</em>
            </h1>
            <p style={{ fontSize: 18, color: '#6B7B8D', maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>
              HEALIX is a 6-module AI pipeline designed to democratize clinical reasoning.
              Built by <strong style={{ color: '#0B1F3D' }}>Jabbar Hasib</strong>.
            </p>
          </div>
        </SectionReveal>
      </section>

      <section style={{ padding: '100px 24px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionReveal>
            <div className="label" style={{ marginBottom: 16 }}>Our Mission</div>
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>Transparent Healthcare</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {[
                { id: 'PR', title: 'The Problem', desc: 'Patients lack access to informed decisions. Hidden costs and delayed treatments are systemic issues.' },
                { id: 'SL', title: 'The Solution', desc: 'AI-powered clinical reasoning with full transparency. Actionable intelligence in under 3 seconds.' },
                { id: 'PV', title: 'Privacy First', desc: 'On-device LLM inference. Your clinical data never leaves your machine. Zero cloud dependency.' },
                { id: 'EX', title: 'Explainability', desc: 'Reasoning traces for every output. Patients understand the clinical path, not just the result.' },
              ].map(c => (
                <div key={c.id} className="card" style={{ padding: 32 }}>
                  <div className="icon-3d-navy" style={{ width: 44, height: 44, fontSize: 13, marginBottom: 16 }}>{c.id}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0B1F3D', marginBottom: 12 }}>{c.title}</h3>
                  <p style={{ fontSize: 15, color: '#6B7B8D', lineHeight: 1.7, margin: 0 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      <section style={{ padding: '100px 24px', background: '#F5F3F0' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <SectionReveal>
            <div className="label" style={{ marginBottom: 16 }}>The Creator</div>
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>Jabbar Hasib</h2>
            <div className="card" style={{ padding: 48 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0B1F3D', marginBottom: 12 }}>AI Engineer & Developer</div>
              <p style={{ fontSize: 16, color: '#6B7B8D', lineHeight: 1.8, marginBottom: 16 }}>
                Focused on clinical AI systems, on-device LLM integration, and explainable intelligence for real-world healthcare impact.
              </p>
              <a href="mailto:jabbar.hasib@gmail.com" style={{ display: 'inline-block', fontSize: 15, fontWeight: 600, color: '#1976D2', textDecoration: 'none', background: 'rgba(25,118,210,0.08)', padding: '8px 16px', borderRadius: 20 }}>
                jabbar.hasib@gmail.com
              </a>
            </div>
          </SectionReveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}
