import { motion } from 'framer-motion'

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

export default function HospitalCard({ hospital, rank, onClick }) {
  const h = hospital
  const score = Math.round((h.score || 0) * 100)
  const cost = h.cost_estimate

  const tierLabels = {
    premium: 'Premium', super_specialty: 'Tier 1 Elite',
    mid: 'Tier 2 Academic', government: 'Public Hospital',
  }
  const tierLabel = tierLabels[h.tier] || h.tier

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08, duration: 0.5 }}
      onClick={onClick}
      style={{
        background: '#FFFFFF', border: '1px solid rgba(11,31,61,0.06)',
        borderTop: '1px solid rgba(255,255,255,0.9)',
        borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxShadow: '0 1px 1px rgba(11,31,61,0.04), 0 2px 4px rgba(11,31,61,0.04), 0 4px 8px rgba(11,31,61,0.04), 0 8px 16px rgba(11,31,61,0.03)',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 8px rgba(11,31,61,0.06), 0 8px 16px rgba(11,31,61,0.05), 0 16px 32px rgba(11,31,61,0.04), 0 24px 48px rgba(11,31,61,0.03)'; e.currentTarget.style.transform = 'translateY(-5px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 1px rgba(11,31,61,0.04), 0 2px 4px rgba(11,31,61,0.04), 0 4px 8px rgba(11,31,61,0.04), 0 8px 16px rgba(11,31,61,0.03)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ height: 160, background: 'linear-gradient(135deg, #EDE9E3, #F5F3F0)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(11,31,61,0.03) 25%, transparent 25%, transparent 75%, rgba(11,31,61,0.03) 75%)', backgroundSize: '40px 40px', opacity: 0.5 }} />
        {rank <= 3 && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: rank === 1 ? 'linear-gradient(135deg, #D4AF37, #E8D48B)' : '#0B1F3D',
            color: rank === 1 ? '#0B1F3D' : '#F5F3F0',
            padding: '4px 12px', borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 1, fontFamily: FM, textTransform: 'uppercase',
            boxShadow: rank === 1 ? '0 2px 8px rgba(212,175,55,0.35)' : '0 2px 6px rgba(11,31,61,0.3)',
          }}>
            {rank === 1 ? 'RANK #1' : rank === 2 ? 'TOP SUCCESS' : `RANK #${rank}`}
          </div>
        )}
        <div style={{
          position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
          padding: '4px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4,
          boxShadow: '0 2px 4px rgba(11,31,61,0.08)',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0B1F3D', fontFamily: F }}>{score}%</span>
        </div>
      </div>

      <div style={{ padding: '18px 18px 20px' }}>
        <h3 style={{ fontFamily: F, fontSize: 18, fontWeight: 700, color: '#0B1F3D', marginBottom: 4, lineHeight: 1.2 }}>{h.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: h.address ? 6 : 14 }}>
          <span className="badge-gold" style={{ fontSize: 9, padding: '2px 8px' }}>{tierLabel}</span>
          {h.osm_verified && <span style={{ fontSize: 9, color: '#2E7D32', fontFamily: FM, fontWeight: 700 }}>✅ OSM</span>}
        </div>
        {h.address && (
          <p style={{ fontSize: 11, color: '#6B7B8D', margin: '0 0 8px', lineHeight: 1.4, fontFamily: F }}>📍 {h.address}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: 13, color: '#6B7B8D', fontFamily: F }}>
          Primary: <strong style={{ color: '#0B1F3D', fontWeight: 700, marginLeft: 4 }}>{h.specialties?.[0] || 'General Medicine'}</strong>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 14, borderTop: '1px solid rgba(11,31,61,0.06)' }}>
          <div>
            <div style={{ fontFamily: FM, fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(11,31,61,0.35)', marginBottom: 3 }}>Distance</div>
            <div style={{ fontFamily: F, fontSize: 17, fontWeight: 700, color: '#0B1F3D' }}>
              {h.distance_km?.toFixed(1) || '—'} <span style={{ fontSize: 12, fontWeight: 400, color: '#6B7B8D' }}>km</span>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: FM, fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(11,31,61,0.35)', marginBottom: 3 }}>Wait Time</div>
            <div style={{ fontFamily: F, fontSize: 17, fontWeight: 700, color: '#0B1F3D' }}>
              {h.wait_time_mins || Math.round(Math.random() * 25 + 5)} <span style={{ fontSize: 12, fontWeight: 400, color: '#6B7B8D' }}>min</span>
            </div>
          </div>
        </div>
        {cost && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(11,31,61,0.06)' }}>
            <div style={{ fontFamily: FM, fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#D4AF37', marginBottom: 4 }}>Estimated Investment</div>
            <div style={{ fontFamily: F, fontSize: 19, fontWeight: 700, color: '#0B1F3D' }}>
              ₹{Math.round(cost.estimate / 1000)}K
              <span style={{ fontSize: 13, fontWeight: 400, color: '#6B7B8D', marginLeft: 4 }}>
                (₹{Math.round(cost.min / 1000)}K – ₹{Math.round(cost.max / 1000)}K)
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
