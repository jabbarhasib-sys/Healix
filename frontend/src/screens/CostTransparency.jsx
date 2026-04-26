import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SectionReveal from '../components/SectionReveal'
import CostBreakdownCard from '../components/CostBreakdownCard'
import AnimatedCounter from '../components/AnimatedCounter'

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

export default function CostTransparency() {
  const navigate = useNavigate()
  const { result } = useStore()

  if (!result) return (
    <div style={{ minHeight: '100vh', background: '#F5F3F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
      <Navbar /><div style={{ textAlign: 'center' }}><p style={{ color: '#6B7B8D', marginBottom: 16 }}>No analysis found.</p><button onClick={() => navigate('/')} className="btn-primary">Go Home</button></div>
    </div>
  )

  const { hospitals = [], clinical = {} } = result
  const top = clinical?.conditions?.[0]
  const topCost = hospitals[0]?.cost_estimate || {}
  const est = topCost.estimate || 0
  const min = topCost.min || 0
  const max = topCost.max || 0

  const breakdown = [
    { id: 'C', title: 'Consultation', amount: Math.round(est * 0.12), pct: 12 },
    { id: 'D', title: 'Diagnostics',  amount: Math.round(est * 0.28), pct: 28 },
    { id: 'P', title: 'Procedures',   amount: Math.round(est * 0.45), pct: 45 },
    { id: 'A', title: 'Ancillary',    amount: Math.round(est * 0.15), pct: 15 },
  ]

  return (
    <div style={{ minHeight: '100vh', fontFamily: F, background: '#F5F3F0' }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 24px 80px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48, flexWrap: 'wrap', gap: 32 }}>
          <SectionReveal>
            <div className="label" style={{ marginBottom: 16 }}>Financial Analytics</div>
            <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, letterSpacing: -2, lineHeight: 1.05, color: '#0B1F3D' }}>
              Transparency of<br />
              <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>Treatment Cost.</em>
            </h1>
            <p style={{ fontSize: 16, color: '#6B7B8D', marginTop: 16, lineHeight: 1.8, maxWidth: 480 }}>
              Stochastic itemized breakdown for <strong style={{ color: '#0B1F3D' }}>{top?.name || 'this condition'}</strong> based on current hospital pricing tiers.
            </p>
          </SectionReveal>

          <SectionReveal delay={0.15}>
            <div className="card" style={{ padding: '32px 40px', minWidth: 340 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40 }}>
                <div>
                  <div className="data-label" style={{ marginBottom: 8 }}>Investment Range</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#0B1F3D' }}>
                    ₹{Math.round(min / 1000)}K – ₹{Math.round(max / 1000)}K
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="data-label" style={{ marginBottom: 8 }}>Estimate</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#D4AF37' }}>
                    ₹<AnimatedCounter end={Math.round(est / 1000)} style={{ fontSize: 28, fontWeight: 700 }} />K
                  </div>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>

        <SectionReveal delay={0.2} style={{ marginBottom: 56 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {breakdown.map(b => (
              <CostBreakdownCard key={b.title} icon={b.id} title={b.title} amount={b.amount} percentage={b.pct} />
            ))}
          </div>
        </SectionReveal>

        <SectionReveal delay={0.3} style={{ marginBottom: 56 }}>
          <div className="label" style={{ marginBottom: 12 }}>Comparative Index</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#0B1F3D', marginBottom: 24 }}>Vetted Network Pricing</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {hospitals.slice(0, 6).map((h, i) => {
              const hCost = h.cost_estimate?.estimate || 0
              return (
                <div key={h.id || i} className="card" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0B1F3D', marginBottom: 6 }}>{h.name}</h3>
                      <span className="badge-navy" style={{ fontSize: 9 }}>{h.tier?.replace('_', ' ').toUpperCase()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <div key={s} style={{ width: 8, height: 8, borderRadius: '50%', background: s <= Math.round(h.rating || 0) ? '#D4AF37' : 'rgba(11,31,61,0.08)' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#0B1F3D' }}>
                    ₹{Math.round(hCost / 1000).toLocaleString()},000
                  </div>
                </div>
              )
            })}
          </div>
        </SectionReveal>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.button onClick={() => navigate('/welcome')} className="btn-gold"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '16px 48px', fontSize: 16, marginRight: 16 }}>
            Confirm Enrollment
          </motion.button>
          <button onClick={() => navigate('/hospital-matches')} className="btn-outline" style={{ padding: '16px 32px', fontSize: 15 }}>
            ← Back to Matches
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
