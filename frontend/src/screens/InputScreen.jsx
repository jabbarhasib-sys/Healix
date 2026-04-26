import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SectionReveal from '../components/SectionReveal'
import DNA3D from '../components/DNA3D'

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

export default function InputScreen() {
  const navigate = useNavigate()
  const { symptomsText, setSymptomsText } = useStore()
  const [isFocused, setIsFocused] = useState(false)

  const handleNext = () => {
    if (!symptomsText.trim()) return
    navigate('/processing')
  }

  const examples = [
    "Severe chest pain radiating to my left arm for the last 2 hours.",
    "Persistent high fever with severe joint pain and a rash.",
    "Worst headache of my life with sudden neck stiffness.",
    "Abdominal pain in the lower right side with nausea."
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3F0', fontFamily: F, position: 'relative', overflowX: 'hidden' }}>
      <DNA3D />
      <Navbar />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '120px 24px 80px', position: 'relative', zIndex: 1, background: 'radial-gradient(circle, rgba(245,243,240,0.9) 0%, rgba(245,243,240,0) 80%)' }}>
        <SectionReveal>
          <div className="label" style={{ marginBottom: 16, textAlign: 'center' }}>Clinical Intake</div>
          <h1 style={{ 
            fontSize: 'clamp(32px, 5vw, 52px)', 
            fontWeight: 700, 
            textAlign: 'center', 
            color: '#0B1F3D', 
            letterSpacing: -1, 
            lineHeight: 1.1,
            marginBottom: 20
          }}>
            Tell Your <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>Story.</em>
          </h1>
          <p style={{ 
            fontSize: 16, 
            color: '#6B7B8D', 
            textAlign: 'center', 
            maxWidth: 500, 
            margin: '0 auto 48px',
            lineHeight: 1.8 
          }}>
            Describe your symptoms in natural language. Our AI will extract clinical entities and reason through your specific case.
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div style={{ 
            position: 'relative',
            background: '#FFFFFF',
            borderRadius: 24,
            padding: 32,
            boxShadow: isFocused 
              ? '0 12px 48px rgba(11,31,61,0.08), 0 8px 16px rgba(11,31,61,0.06)' 
              : '0 4px 16px rgba(11,31,61,0.04), 0 2px 4px rgba(11,31,61,0.02)',
            border: '1px solid rgba(11,31,61,0.06)',
            borderTop: '1px solid rgba(255,255,255,0.9)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <textarea
              value={symptomsText}
              onChange={(e) => setSymptomsText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="e.g., I have been feeling a sharp pain in my chest..."
              style={{
                width: '100%',
                height: 200,
                background: 'transparent',
                border: 'none',
                resize: 'none',
                fontFamily: F,
                fontSize: 18,
                color: '#0B1F3D',
                lineHeight: 1.6,
                outline: 'none',
                marginBottom: 24
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="icon-3d" style={{ width: 40, height: 40, border: 'none', background: 'rgba(11,31,61,0.03)', color: '#0B1F3D' }}>
                   A
                </button>
              </div>
              <motion.button
                onClick={handleNext}
                disabled={!symptomsText.trim()}
                className="btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ opacity: symptomsText.trim() ? 1 : 0.5 }}
              >
                Analyse Case →
              </motion.button>
            </div>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.2}>
          <div style={{ marginTop: 48 }}>
            <div className="label-muted" style={{ marginBottom: 16, textAlign: 'center' }}>Clinical Examples</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setSymptomsText(ex)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(11,31,61,0.05)',
                    borderRadius: 12,
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontFamily: F,
                    fontSize: 14,
                    color: '#6B7B8D',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)';
                    e.currentTarget.style.color = '#0B1F3D';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(11,31,61,0.04)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(11,31,61,0.05)';
                    e.currentTarget.style.color = '#6B7B8D';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </SectionReveal>
      </div>

      <Footer />
    </div>
  )
}
