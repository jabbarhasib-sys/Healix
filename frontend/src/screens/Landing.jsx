import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HealixLogo from '../components/HealixLogo'
import SectionReveal from '../components/SectionReveal'
import AnimatedCounter from '../components/AnimatedCounter'
import useStore from '../store/useStore'
import DNA3D from '../components/DNA3D'
import OnboardingTutorial from '../components/OnboardingTutorial'
import { useDarkMode } from '../hooks/useDarkMode'


const STATS = [
  { end: 6,   suffix: '',   label: 'AI Modules' },
  { end: 500, suffix: '+',  label: 'Hospitals' },
  { end: 20,  suffix: '+',  label: 'Conditions' },
  { end: 3,   prefix: '<',  suffix: 's', label: 'Analysis Time' },
]

const STEPS = [
  { n: '01', title: 'Describe', sub: 'Type your symptoms naturally — AI handles the rest' },
  { n: '02', title: 'Analyse',  sub: '6 AI modules run in sequence, streaming live results' },
  { n: '03', title: 'Decide',   sub: 'Get ranked hospitals, cost estimates, full reasoning' },
]

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

export default function Landing() {
  const navigate = useNavigate()
  const { reset } = useStore()
  const handleStart = () => { reset(); navigate('/input') }

  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem('healix-onboarding-done') } catch { return false }
  })
  const handleOnboardingDone = () => {
    try { localStorage.setItem('healix-onboarding-done', 'true') } catch {}
    setShowOnboarding(false)
  }

  const [isDark] = useDarkMode()

  return (
    <div style={{ background: isDark ? '#1e2229' : '#F5F3F0', color: isDark ? '#e8ecf1' : '#0B1F3D', fontFamily: F, overflowX: 'hidden' }}>
      <Navbar />
      {showOnboarding && <OnboardingTutorial onDone={handleOnboardingDone} />}

      {/* ═══ HERO ═══ */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        textAlign: 'center', padding: '120px 24px 80px', position: 'relative',
        overflow: 'visible',
        background: isDark ? 'linear-gradient(180deg, #1e2229 0%, #141920 100%)' : 'linear-gradient(180deg, #F5F3F0 0%, #EDE9E3 100%)',
      }}>
        {/* Live 3D DNA Background */}
        <DNA3D />

        <div style={{
          maxWidth: 900, position: 'relative', zIndex: 1, padding: '60px',
          paddingBottom: '40px',
          background: 'transparent',
        }}>
          
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ 
              fontSize: 'clamp(60px, 12vw, 140px)', 
              fontWeight: 900, 
              letterSpacing: '0.05em', 
              lineHeight: 1, 
              margin: 0, 
              fontFamily: "'Montserrat', sans-serif",
              color: '#0B1F3D',
              textShadow: '0px 8px 16px rgba(11, 31, 61, 0.1)',
            }}>
            HEALIX
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7 }}
            style={{ 
              fontSize: 'clamp(14px, 2vw, 24px)', 
              color: '#2E4F78', 
              letterSpacing: '0.15em',
              fontWeight: 700, 
              marginTop: 8,
              marginBottom: 24, 
              fontFamily: "'Montserrat', sans-serif" 
            }}>
            HEAL + INTELLIGENCE EXCHANGE
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7 }}
            style={{ fontSize: 'clamp(15px,1.6vw,18px)', color: '#6B7B8D', maxWidth: 640, lineHeight: 1.6, fontWeight: 500, margin: '0 auto 40px', fontFamily: F }}>
            A clinical decision intelligence engine delivering differential diagnosis, ranked hospitals, and cost estimates in under 3 seconds.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.6 }}
            style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <motion.button onClick={handleStart} className="btn-primary" whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(11,31,61,0.2)' }} whileTap={{ scale: 0.95 }}
              style={{ padding: '16px 48px', fontSize: 16, background: '#0B1F3D', color: '#FFFFFF', border: 'none', fontWeight: 700, borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Begin Assessment
            </motion.button>
            <motion.button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-outline" whileHover={{ scale: 1.02 }}
              style={{ padding: '16px 32px', fontSize: 15, color: '#0B1F3D', borderColor: 'rgba(11,31,61,0.2)', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px', background: 'transparent' }}>
              Explore Platform
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ═══ WHAT IS HEALIX ═══ */}
      <section style={{ padding: '100px 24px', background: '#F5F3F0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <SectionReveal>
              <div className="gold-accent-line" style={{ marginBottom: 20 }} />
              <div className="label" style={{ marginBottom: 14 }}>What is HEALIX</div>
              <h2 style={{ fontSize: 'clamp(30px,4vw,50px)', fontWeight: 700, letterSpacing: -1, lineHeight: 1.1, marginBottom: 24, fontFamily: F }}>
                Not a symptom<br /><em style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>checker.</em>
              </h2>
              <p style={{ fontSize: 16, color: '#6B7B8D', lineHeight: 1.85, fontWeight: 400, marginBottom: 16, fontFamily: F }}>
                HEALIX is a clinical decision intelligence engine — designed to think like a physician, reason through uncertainty, and explain every output.
              </p>
              <p style={{ fontSize: 15, color: '#8A97A6', lineHeight: 1.85, fontWeight: 400, fontFamily: F }}>
                Built for real-world healthcare access. When you don't know which hospital, which doctor, or how much it costs — HEALIX answers in seconds.
              </p>
            </SectionReveal>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { id: 'CA', title: 'Clinical Accuracy', body: 'Differential diagnosis backed by ICD-10 standards and probabilistic scoring across 20+ conditions.' },
                { id: 'PL', title: 'Private & Local', body: 'Ollama runs the LLM on your own machine. Your symptoms never leave your device.' },
                { id: 'ZJ', title: 'Zero Jargon', body: 'Every output is explained in plain English. Patients understand, not just physicians.' },
              ].map((c, i) => (
                <SectionReveal key={c.id} delay={i * 0.1}>
                  <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div className="icon-3d" style={{ width: 44, height: 44, fontSize: 13, flexShrink: 0, borderRadius: 12 }}>{c.id}</div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#0B1F3D', marginBottom: 5, fontFamily: F }}>{c.title}</p>
                      <p style={{ fontSize: 14, color: '#6B7B8D', lineHeight: 1.7, margin: 0, fontFamily: F }}>{c.body}</p>
                    </div>
                  </div>
                </SectionReveal>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" style={{ padding: '100px 24px', background: '#F5F3F0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionReveal style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="label" style={{ marginBottom: 14 }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(26px,3.5vw,46px)', fontWeight: 700, letterSpacing: -1, fontFamily: F }}>
              Three steps.<br /><span style={{ color: '#6B7B8D', fontWeight: 400, fontSize: '0.7em' }}>From symptoms to answers.</span>
            </h2>
          </SectionReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
            {STEPS.map((s, i) => (
              <SectionReveal key={s.n} delay={i * 0.12}>
                <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                  <div className="icon-3d-navy" style={{ width: 72, height: 72, margin: '0 auto 20px', fontSize: 22 }}>{s.n}</div>
                  <h3 style={{ fontSize: 24, fontWeight: 700, color: '#0B1F3D', letterSpacing: -0.5, marginBottom: 10, fontFamily: F }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: '#6B7B8D', lineHeight: 1.75, fontFamily: F }}>{s.sub}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>



      {/* ═══ FINAL CTA ═══ */}
      <section style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px', background: '#F5F3F0' }}>
        <SectionReveal>
          <div className="gold-accent-line" style={{ margin: '0 auto 24px' }} />
          <div className="label" style={{ marginBottom: 20 }}>Ready</div>
          <h2 style={{ fontSize: 'clamp(38px,6vw,72px)', fontWeight: 700, letterSpacing: -1, lineHeight: 0.95, marginBottom: 20, fontFamily: F }}>
            <span style={{ display: 'block', color: '#0B1F3D' }}>Describe.</span>
            <span style={{ display: 'block' }}><em style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>Decide.</em></span>
            <span style={{ display: 'block', color: 'rgba(11,31,61,0.2)', fontWeight: 400, fontSize: '0.42em', marginTop: 12 }}>Powered by HEALIX AI</span>
          </h2>
          <p style={{ fontSize: 14, color: '#8A97A6', marginBottom: 40, fontStyle: 'italic', fontFamily: F }}>Not a substitute for professional medical advice.</p>
          <motion.button onClick={handleStart} className="btn-primary" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{ padding: '18px 56px', fontSize: 17 }}>Begin Assessment →</motion.button>
        </SectionReveal>
      </section>

      <Footer />
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.75)}}`}</style>
    </div>
  )
}
