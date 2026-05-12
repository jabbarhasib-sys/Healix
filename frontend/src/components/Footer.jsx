import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MiniDNA } from './DNA3D'

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

const LINK_COLS = [
  { headingKey: 'footer.platform', items: [
    { labelKey: 'footer.howItWorks', path: '/how-it-works' },
    { labelKey: 'footer.aiTechnology', path: '/technology' },
    { labelKey: 'footer.whyHealix', path: '/why-healix' },
  ]},
  { headingKey: 'footer.trust', items: [
    { labelKey: 'footer.security', path: '/security' },
    { labelKey: 'footer.support', path: '/support' },
    { labelKey: 'footer.about', path: '/about' },
  ]},
]

export default function Footer() {
  const navigate = useNavigate()
  const { t } = useTranslation()
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
            {t('footer.tagline')}
            </p>
          </div>

          {/* Link Columns */}
          {LINK_COLS.map(col => (
            <div key={col.headingKey}>
              <p style={{ fontFamily: FM, fontSize: 10, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase', color: '#D4AF37', marginBottom: 16 }}>{t(col.headingKey)}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.items.map(item => (
                  <button key={item.path} onClick={() => navigate(item.path)}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(245,243,240,0.55)', fontSize: 14, fontFamily: F, cursor: 'pointer', textAlign: 'left', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#F5F3F0'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,243,240,0.55)'}
                  >{t(item.labelKey)}</button>
                ))}
              </div>
            </div>
          ))}


        </div>

        <div style={{ height: 1, background: 'rgba(245,243,240,0.06)', marginBottom: 24 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'rgba(245,243,240,0.25)', margin: 0, fontFamily: F }}>
            {t('footer.copyright', { year })}
          </p>
          <a href="mailto:jabbar.hasib@gmail.com"
            style={{ fontSize: 12, color: 'rgba(245,243,240,0.35)', margin: 0, fontFamily: F, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'rgba(212,175,55,0.8)'}
            onMouseLeave={e => e.target.style.color = 'rgba(245,243,240,0.35)'}>
            jabbar.hasib@gmail.com
          </a>
          <p style={{ fontSize: 11, color: 'rgba(245,243,240,0.18)', margin: 0, fontStyle: 'italic', fontFamily: F }}>
            {t('footer.disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  )
}
