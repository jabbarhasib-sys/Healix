import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MiniDNA } from './DNA3D'
import { useDarkMode } from '../hooks/useDarkMode'

const NAV_LINKS = [
  { label: 'Home',          path: '/' },
  { label: 'Services',      path: '/how-it-works' },
  { label: 'Philosophy',    path: '/why-healix' },
  { label: 'Philosophy',    path: '/why-healix' },
]

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

export default function Navbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useDarkMode()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const getCTA = () => {
    if (pathname === '/hospital-matches') return { label: 'Reserve Access', path: '/welcome' }
    if (pathname === '/dashboard' || pathname === '/intelligence') return { label: 'View Matches', path: '/hospital-matches' }
    if (pathname === '/welcome') return { label: 'Dashboard', path: '/dashboard' }
    return { label: 'Begin Assessment', path: '/input' }
  }
  const cta = getCTA()

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 40px', height: 64,
          background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(245,243,240,0.6)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid rgba(11,31,61,0.08)' : '1px solid transparent',
          boxShadow: scrolled ? '0 2px 8px rgba(11,31,61,0.06), 0 4px 16px rgba(11,31,61,0.03)' : 'none',
          transition: 'all 0.35s ease',
        }}
      >
        <button onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: 0 }}>
          <MiniDNA />
          <div style={{ display: 'flex', flexDirection: 'column', paddingTop: 2 }}>
            <span style={{ fontFamily: F, fontWeight: 700, fontSize: 18, letterSpacing: 2, color: '#0B1F3D', lineHeight: 1 }}>HEALIX</span>
            <span style={{ fontFamily: FM, fontWeight: 600, fontSize: 9, letterSpacing: 1.2, color: '#2E4F78', marginTop: 4, textTransform: 'uppercase' }}>HEAL + Intelligence Exchange</span>
          </div>
        </button>

        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {NAV_LINKS.map(l => {
            const active = pathname === l.path
            return (
              <button key={l.path} onClick={() => navigate(l.path)}
                style={{
                  background: 'transparent', border: 'none',
                  color: active ? '#0B1F3D' : 'rgba(11,31,61,0.45)',
                  padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: F, fontSize: 14, fontWeight: active ? 700 : 400,
                  letterSpacing: 0.5, textTransform: 'uppercase',
                  transition: 'all 0.2s',
                  borderBottom: active ? '2px solid #D4AF37' : '2px solid transparent',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#0B1F3D' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(11,31,61,0.45)' }}
              >{l.label}</button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Dark mode toggle */}
          <motion.button
            onClick={() => setDark(d => !d)}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={dark ? 'Light mode' : 'Dark mode'}
            style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: dark ? 'rgba(212,175,55,0.15)' : 'rgba(11,31,61,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, transition: 'background 0.25s',
            }}
          >
            {dark ? '☀️' : '🌙'}
          </motion.button>

          <motion.button onClick={() => navigate(cta.path)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="hide-mobile btn-primary"
            style={{ padding: '10px 24px', fontSize: 13 }}>{cta.label}</motion.button>

          <button className="hide-desktop" onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <motion.div animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 8 : 0 }}
              style={{ width: 22, height: 2, background: '#0B1F3D', borderRadius: 2 }} />
            <motion.div animate={{ opacity: mobileOpen ? 0 : 1 }}
              style={{ width: 22, height: 2, background: '#0B1F3D', borderRadius: 2 }} />
            <motion.div animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -8 : 0 }}
              style={{ width: 22, height: 2, background: '#0B1F3D', borderRadius: 2 }} />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'fixed', top: 64, right: 0, bottom: 0, width: '75vw', maxWidth: 320, zIndex: 499,
              background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(24px)',
              borderLeft: '1px solid rgba(11,31,61,0.08)', padding: '32px 24px',
              display: 'flex', flexDirection: 'column', gap: 8,
              boxShadow: '-8px 0 24px rgba(11,31,61,0.06)',
            }}>
            {NAV_LINKS.map(l => (
              <button key={l.path} onClick={() => { navigate(l.path); setMobileOpen(false) }}
                style={{ background: pathname === l.path ? 'rgba(212,175,55,0.08)' : 'transparent', border: 'none', borderRadius: 10, padding: '14px 16px', textAlign: 'left', cursor: 'pointer', fontFamily: F, fontSize: 16, fontWeight: 400, color: '#0B1F3D' }}>{l.label}</button>
            ))}
            <div style={{ height: 1, background: 'rgba(11,31,61,0.06)', margin: '12px 0' }} />
            <button onClick={() => { navigate(cta.path); setMobileOpen(false) }} className="btn-primary" style={{ textAlign: 'center', marginTop: 8 }}>{cta.label}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
