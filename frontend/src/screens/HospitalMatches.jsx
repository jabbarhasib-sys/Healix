import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HospitalCard from '../components/HospitalCard'
import FilterBar from '../components/FilterBar'
import SectionReveal from '../components/SectionReveal'
import { MiniDNA } from '../components/DNA3D'

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

export default function HospitalMatches() {
  const navigate = useNavigate()
  const { result } = useStore()
  const [filters, setFilters] = useState({})

  if (!result) return (
    <div style={{ minHeight: '100vh', background: '#F5F3F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
      <Navbar />
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#6B7B8D', marginBottom: 16 }}>No analysis found. Run an assessment first.</p>
        <button onClick={() => navigate('/input')} className="btn-primary">Begin Assessment</button>
      </div>
    </div>
  )

  const { hospitals = [], clinical = {}, confidence } = result
  const top = clinical?.conditions?.[0]
  const confPct = Math.round((confidence?.percentage || 0))

  return (
    <div style={{ minHeight: '100vh', fontFamily: F, background: '#F5F3F0' }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px 64px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48, flexWrap: 'wrap', gap: 24 }}>
          <SectionReveal>
            <div className="label" style={{ marginBottom: 12 }}>Matched Facilities</div>
            <h1 style={{
              fontSize: 'clamp(32px,5vw,52px)',
              fontWeight: 700,
              letterSpacing: -1.5,
              lineHeight: 1.05,
              color: '#0B1F3D',
              fontFamily: F
            }}>
              Elite Medical<br />
              <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>Network.</em>
            </h1>
          </SectionReveal>

          {top && (
            <SectionReveal delay={0.15}>
              <div className="card" style={{ padding: '24px 32px', minWidth: 320 }}>
                <div className="data-label" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Case Synthesis</span>
                  <div style={{ transform: 'scale(0.7)', margin: '-20px -20px -20px 0', opacity: 0.8 }}><MiniDNA /></div>
                </div>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#0B1F3D', marginBottom: 6, fontFamily: F }}>
                  {top.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 100, height: 4, background: 'rgba(11,31,61,0.06)', borderRadius: 2 }}>
                    <div style={{ width: `${confPct}%`, height: '100%', background: '#D4AF37', borderRadius: 2 }} />
                  </div>
                  <span style={{ fontFamily: FM, fontSize: 11, color: '#6B7B8D' }}>{confPct}% Confidence</span>
                </div>
              </div>
            </SectionReveal>
          )}
        </div>

        <SectionReveal delay={0.2} style={{ marginBottom: 32 }}>
          <div style={{ padding: 4 }}>
            <FilterBar
              onFilter={setFilters}
              specialties={top ? [top.recommended_specialty].filter(Boolean) : []}
            />
          </div>
        </SectionReveal>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 24, marginBottom: 56,
        }}>
          {hospitals.slice(0, 8).map((h, i) => (
            <HospitalCard key={h.id || i} hospital={h} rank={i + 1} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.button onClick={() => navigate('/cost-analysis')} className="btn-primary"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '16px 48px', fontSize: 16, marginRight: 16 }}>
            Financial Transparency →
          </motion.button>
          <button onClick={() => navigate('/dashboard')} className="btn-outline" style={{ padding: '16px 32px', fontSize: 15 }}>
            ← Intelligence Results
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#8A97A6', fontStyle: 'italic', fontFamily: F }}>
          HEALIX AI · Intelligence Exchange · National Hackathon 2026
          By team Neural Navigators
        </p>
      </div>

      <Footer />
    </div>
  )
}
