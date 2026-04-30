import { useNavigate } from 'react-router-dom'
import { MiniDNA } from './DNA3D'

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

const LINKS = [
  { heading: 'Platform', items: [
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'AI Technology', path: '/technology' },
    { label: 'Why HEALIX', path: '/why-healix' },
    { label: 'Impact & Results', path: '/impact' },
  ]},
  { heading: 'Trust', items: [
    { label: 'Security', path: '/security' },
    { label: 'Support', path: '/support' },
    { label: 'About', path: '/about' },
  ]},
]

export default function Footer() {
  const navigate = useNavigate()
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: '#0B1F3D', color: '#F5F3F0', padding: '64px 24px 32px', fontFamily: F }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <MiniDNA color="#2196F3" />
              <span style={{ fontFamily: F, fontWeight: 700, fontSize: 16, letterSpacing: 3, color: '#F5F3F0' }}>HEALIX</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(245,243,240,0.45)', lineHeight: 1.75, maxWidth: 260, fontFamily: F }}>
              Clinical Decision Intelligence Engine. AI-powered diagnosis, hospital matching, and cost transparency.
            </p>
          </div>

          {/* Link Columns */}
          {LINKS.map(col => (
            <div key={col.heading}>
              <p style={{ fontFamily: FM, fontSize: 10, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase', color: '#D4AF37', marginBottom: 16 }}>{col.heading}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.items.map(item => (
                  <button key={item.path} onClick={() => navigate(item.path)}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(245,243,240,0.55)', fontSize: 14, fontFamily: F, cursor: 'pointer', textAlign: 'left', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#F5F3F0'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,243,240,0.55)'}
                  >{item.label}</button>
                ))}
              </div>
            </div>
          ))}

          {/* Compliance — redesigned, no boxy badges */}
          <div>
            <p style={{ fontFamily: FM, fontSize: 10, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase', color: '#D4AF37', marginBottom: 16 }}>Compliance</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { code: 'HIPAA', full: 'Health Insurance Portability' },
                { code: 'SOC 2', full: 'Service Organization Control' },
                { code: 'GDPR', full: 'Data Protection Regulation' },
                { code: 'HITRUST', full: 'Health Information Trust' },
              ].map(b => (
                <div key={b.code} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#D4AF37', flexShrink: 0,
                    boxShadow: '0 0 6px rgba(212,175,55,0.4)',
                  }} />
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#F5F3F0', fontFamily: F }}>{b.code}</span>
                    <span style={{ fontSize: 11, color: 'rgba(245,243,240,0.3)', marginLeft: 8, fontFamily: F }}>{b.full}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(245,243,240,0.06)', marginBottom: 24 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'rgba(245,243,240,0.25)', margin: 0, fontFamily: F }}>
            © {year} HEALIX AI · Built by Jabbar Hasib
          </p>
          <a href="mailto:jabbar.hasib@gmail.com"
            style={{ fontSize: 12, color: 'rgba(245,243,240,0.35)', margin: 0, fontFamily: F, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'rgba(212,175,55,0.8)'}
            onMouseLeave={e => e.target.style.color = 'rgba(245,243,240,0.35)'}>
            jabbar.hasib@gmail.com
          </a>
          <p style={{ fontSize: 11, color: 'rgba(245,243,240,0.18)', margin: 0, fontStyle: 'italic', fontFamily: F }}>
            Not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </footer>
  )
}
