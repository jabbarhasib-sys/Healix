const FM = "'DM Mono', monospace"
const F  = "'Times New Roman', Georgia, serif"

const STEPS = [
  { key: 'intake',   label: 'Intake',         icon: '📋', path: '/input' },
  { key: 'analysis', label: 'Analysis',        icon: '🧠', path: '/processing' },
  { key: 'hospital', label: 'Hospital Match',  icon: '🏥', path: '/hospital-matches' },
  { key: 'cost',     label: 'Cost Review',     icon: '💰', path: '/cost-analysis' },
  { key: 'done',     label: 'Done',            icon: '✅', path: '/dashboard' },
]

const ROUTE_TO_STEP = {
  '/input':           0,
  '/processing':      1,
  '/dashboard':       2,
  '/hospital-matches':2,
  '/cost-analysis':   3,
  '/welcome':         4,
}

export default function ProgressTracker({ currentPath }) {
  const activeIdx = ROUTE_TO_STEP[currentPath] ?? 0

  return (
    <div
      role="navigation"
      aria-label="Assessment progress"
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(11,31,61,0.06)',
        borderRadius: 16,
        padding: '20px 16px',
        boxShadow: '0 2px 12px rgba(11,31,61,0.04)',
      }}
    >
      <div style={{ fontFamily: FM, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(11,31,61,0.35)', marginBottom: 16, textTransform: 'uppercase' }}>
        Your Progress
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {STEPS.map((s, i) => {
          const isDone    = i < activeIdx
          const isActive  = i === activeIdx
          const isPending = i > activeIdx

          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative' }}>
              {/* Vertical connector line */}
              {i < STEPS.length - 1 && (
                <div style={{
                  position: 'absolute', left: 15, top: 32,
                  width: 2, height: 28,
                  background: isDone ? '#D4AF37' : 'rgba(11,31,61,0.08)',
                  borderRadius: 1, transition: 'background 0.4s',
                }} />
              )}

              {/* Step circle */}
              <div
                aria-current={isActive ? 'step' : undefined}
                style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isDone ? 13 : 14,
                  background: isDone
                    ? 'linear-gradient(135deg, #D4AF37, #E8D48B)'
                    : isActive
                      ? '#0B1F3D'
                      : 'rgba(11,31,61,0.06)',
                  color: isDone ? '#0B1F3D' : isActive ? '#F5F3F0' : 'rgba(11,31,61,0.3)',
                  boxShadow: isActive ? '0 4px 12px rgba(11,31,61,0.25)' : 'none',
                  transition: 'all 0.35s ease',
                  fontWeight: 700,
                  zIndex: 1,
                }}
              >
                {isDone ? '✓' : s.icon}
              </div>

              {/* Label */}
              <div style={{ paddingBottom: i < STEPS.length - 1 ? 28 : 0, paddingTop: 4 }}>
                <div style={{
                  fontFamily: F, fontSize: 13, fontWeight: isActive ? 700 : 500,
                  color: isDone ? '#D4AF37' : isActive ? '#0B1F3D' : 'rgba(11,31,61,0.3)',
                  transition: 'color 0.3s',
                  lineHeight: 1.3,
                }}>
                  {s.label}
                </div>
                {isActive && (
                  <div style={{ fontFamily: FM, fontSize: 9, color: '#D4AF37', fontWeight: 700, letterSpacing: 0.5, marginTop: 2 }}>
                    ● IN PROGRESS
                  </div>
                )}
                {isDone && (
                  <div style={{ fontFamily: FM, fontSize: 9, color: '#2E7D32', fontWeight: 600, marginTop: 2 }}>
                    COMPLETED
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
