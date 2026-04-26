export default function HealixLogo({ size = 80, variant = 'default' }) {
  const isDark = variant === 'dark'
  const navyColor = isDark ? '#F5F3F0' : '#0B1F3D'
  const goldColor = '#D4AF37'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shield shape */}
        <path
          d="M50 5 L88 22 L88 55 C88 75 70 92 50 97 C30 92 12 75 12 55 L12 22 Z"
          fill={navyColor}
          stroke={goldColor}
          strokeWidth="1.5"
        />
        {/* Inner shield accent */}
        <path
          d="M50 12 L82 26 L82 53 C82 70 66 85 50 90 C34 85 18 70 18 53 L18 26 Z"
          fill="none"
          stroke={goldColor}
          strokeWidth="0.8"
          opacity="0.3"
        />
        {/* H letter */}
        <text
          x="50" y="58"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={goldColor}
          fontFamily="Montserrat, sans-serif"
          fontWeight="800"
          fontSize="36"
          letterSpacing="-1"
        >H</text>
        {/* ECG line across H */}
        <path
          d="M30 55 L38 55 L42 47 L46 63 L50 50 L54 55 L70 55"
          stroke={isDark ? navyColor : '#F5F3F0'}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.35"
        />
        {/* Gold dots */}
        <circle cx="30" cy="55" r="1.5" fill={goldColor} opacity="0.6" />
        <circle cx="70" cy="55" r="1.5" fill={goldColor} opacity="0.6" />
      </svg>

      {/* Wordmark */}
      <div style={{ textAlign: 'center', lineHeight: 1 }}>
        <div style={{
          fontSize: size * 0.24, fontWeight: 800, letterSpacing: size * 0.05,
          color: navyColor,
          fontFamily: "'Montserrat', sans-serif",
        }}>Heal +</div>
        <div style={{
          fontSize: size * 0.09, letterSpacing: size * 0.025,
          color: goldColor,
          fontFamily: "'DM Mono', monospace",
          marginTop: 4, fontWeight: 500,
          textTransform: 'uppercase',
        }}>Intelligence Exchange</div>
        <div style={{
          fontSize: size * 0.08, letterSpacing: size * 0.02,
          color: navyColor,
          opacity: 0.7,
          fontFamily: "'Montserrat', sans-serif",
          marginTop: 4, fontWeight: 600,
        }}>Healix</div>
      </div>
    </div>
  )
}
