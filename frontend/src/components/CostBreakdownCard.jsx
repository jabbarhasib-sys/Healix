const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

export default function CostBreakdownCard({ icon, title, amount, percentage, currency = '₹' }) {
  return (
    <div className="card" style={{ padding: '28px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        {/* icon is now a 2-letter professional badge, e.g. "C", "D", "P", "A" */}
        <div className="icon-3d-navy" style={{ width: 40, height: 40, fontSize: 13, flexShrink: 0 }}>{icon}</div>
        <span style={{
          fontFamily: FM,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: 'rgba(11,31,61,0.4)',
        }}>{title}</span>
      </div>
      <div style={{
        fontFamily: F,
        fontSize: 30,
        fontWeight: 700,
        color: '#0B1F3D',
        lineHeight: 1,
        marginBottom: 8,
      }}>
        {currency}{amount?.toLocaleString() || '—'}
      </div>
      {percentage != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <div style={{ flex: 1, height: 3, background: 'rgba(11,31,61,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, #0B1F3D, #2E4F78)', borderRadius: 2 }} />
          </div>
          <span style={{ fontFamily: FM, fontSize: 10, color: 'rgba(11,31,61,0.35)', flexShrink: 0 }}>
            {percentage}%
          </span>
        </div>
      )}
    </div>
  )
}
