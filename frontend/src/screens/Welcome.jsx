import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DNA3D from '../components/DNA3D'

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3F0', fontFamily: F, display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
      <DNA3D />
      <Navbar />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '140px 24px 80px', position: 'relative', zIndex: 1, background: 'radial-gradient(circle, rgba(245,243,240,0.95) 0%, rgba(245,243,240,0) 80%)' }}>
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>

          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8, type: 'spring', stiffness: 200 }}
            style={{
              width: 90, height: 90, borderRadius: '50%',
              background: '#FFFFFF', border: '1px solid rgba(11,31,61,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 32px',
              boxShadow: '0 8px 16px rgba(11,31,61,0.06), 0 4px 8px rgba(11,31,61,0.04)',
            }}>
            <div className="icon-3d-navy" style={{ width: 48, height: 48, fontSize: 18 }}>✓</div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <div className="label" style={{ marginBottom: 24 }}>Enrollment Complete</div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            style={{
              fontSize: 'clamp(42px,7vw,72px)', fontWeight: 700,
              letterSpacing: -2, lineHeight: 0.95, color: '#0B1F3D',
              marginBottom: 24,
            }}>
            Access<br />
            <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>Confirmed.</em>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            style={{
              fontSize: 18, color: '#6B7B8D', maxWidth: 520,
              margin: '0 auto 48px', lineHeight: 1.8, fontWeight: 400,
            }}>
            Your HEALIX Concierge membership is active. You have transitioned to the pinnacle of data-driven clinical intelligence.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button onClick={() => navigate('/dashboard')} className="btn-primary"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ padding: '18px 56px', fontSize: 16 }}>
              Dashboard
            </motion.button>
            <button onClick={() => navigate('/')} className="btn-outline" style={{ padding: '18px 32px', fontSize: 16 }}>
              Home
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            style={{
              marginTop: 72, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24, maxWidth: 600, margin: '72px auto 0',
            }}>
            {[
              { label: 'Access Level', value: 'Concierge' },
              { label: 'AI Status',    value: 'Verified' },
              { label: 'Priority',     value: 'Platinum' },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div className="data-label" style={{ marginBottom: 8 }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0B1F3D' }}>{item.value}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}
