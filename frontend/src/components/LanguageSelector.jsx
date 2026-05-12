import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../i18n/index.js'
import { useDarkMode } from '../hooks/useDarkMode'

const FM = "'DM Mono', monospace"

export default function LanguageSelector() {
  const { i18n } = useTranslation()
  const [dark] = useDarkMode()

  const handleChange = (e) => {
    const lang = e.target.value
    i18n.changeLanguage(lang)
    localStorage.setItem('healix-lang', lang)
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span style={{
        position: 'absolute', left: 8, fontSize: 14,
        pointerEvents: 'none', zIndex: 1, lineHeight: 1
      }}>🌐</span>
      <select
        value={i18n.language}
        onChange={handleChange}
        aria-label="Select language"
        style={{
          appearance: 'none', WebkitAppearance: 'none',
          paddingLeft: 28, paddingRight: 22, paddingTop: 7, paddingBottom: 7,
          background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(11,31,61,0.05)',
          color: dark ? '#FFF' : '#0B1F3D',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(11,31,61,0.12)'}`,
          borderRadius: 8,
          fontFamily: FM, fontSize: 12,
          cursor: 'pointer', fontWeight: 600, letterSpacing: 0.3,
          outline: 'none', transition: 'all 0.2s',
        }}
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.native}
          </option>
        ))}
      </select>
      <span style={{
        position: 'absolute', right: 7, fontSize: 8,
        pointerEvents: 'none',
        color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(11,31,61,0.4)'
      }}>▼</span>
    </div>
  )
}
