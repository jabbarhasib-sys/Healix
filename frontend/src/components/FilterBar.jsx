import { useState } from 'react'

const PROXIMITY = ['Any', 'Near (< 5 mi)', '5-15 mi', '15+ mi']
const AFFORD    = ['Any', 'Budget', 'Mid Tier', 'Premium Tier']
const SORT_BY   = ['Success Rate', 'Cost', 'Distance']

export default function FilterBar({ onFilter, specialties = [] }) {
  const [proximity, setProximity] = useState('Any')
  const [afford, setAfford] = useState('Any')
  const [spec, setSpec] = useState('Any')
  const [sort, setSort] = useState('Success Rate')

  const update = (key, val) => {
    const f = { proximity, affordability: afford, specialization: spec, sortBy: sort }
    f[key] = val
    onFilter?.(f)
  }

  const S = {
    select: {
      appearance: 'none', background: '#FFFFFF',
      border: '1px solid rgba(11,31,61,0.10)', borderRadius: 10,
      padding: '10px 14px', fontSize: 14, color: '#0B1F3D',
      fontFamily: "'Times New Roman', Georgia, serif", fontWeight: 400,
      cursor: 'pointer', minWidth: 140,
      boxShadow: '0 1px 2px rgba(11,31,61,0.03)',
    },
    label: {
      fontFamily: "'DM Mono', monospace", fontSize: 9,
      fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase',
      color: 'rgba(11,31,61,0.4)', marginBottom: 6,
    },
  }

  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid rgba(11,31,61,0.06)',
      borderTop: '1px solid rgba(255,255,255,0.9)',
      borderRadius: 16, padding: '20px 24px',
      display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end',
      boxShadow: '0 1px 1px rgba(11,31,61,0.03), 0 2px 4px rgba(11,31,61,0.03), 0 4px 8px rgba(11,31,61,0.03)',
    }}>
      <div>
        <div style={S.label}>Proximity</div>
        <select style={S.select} value={proximity}
          onChange={e => { setProximity(e.target.value); update('proximity', e.target.value) }}>
          {PROXIMITY.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <div style={S.label}>Affordability</div>
        <select style={S.select} value={afford}
          onChange={e => { setAfford(e.target.value); update('affordability', e.target.value) }}>
          {AFFORD.map(a => <option key={a}>{a}</option>)}
        </select>
      </div>
      <div>
        <div style={S.label}>Specialization</div>
        <select style={S.select} value={spec}
          onChange={e => { setSpec(e.target.value); update('specialization', e.target.value) }}>
          <option>Any</option>
          {specialties.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={S.label}>Sort by:</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {SORT_BY.map(s => (
            <button key={s} onClick={() => { setSort(s); update('sortBy', s) }}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13,
                fontFamily: "'Times New Roman', Georgia, serif", fontWeight: sort === s ? 700 : 400,
                border: sort === s ? '1.5px solid #0B1F3D' : '1px solid rgba(11,31,61,0.1)',
                background: sort === s ? '#0B1F3D' : 'transparent',
                color: sort === s ? '#F5F3F0' : '#0B1F3D',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: sort === s ? '0 2px 4px rgba(11,31,61,0.15)' : 'none',
              }}
            >{s}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
