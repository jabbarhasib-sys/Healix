import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HospitalCard from '../components/HospitalCard'
import FilterBar from '../components/FilterBar'
import SectionReveal from '../components/SectionReveal'
import { MiniDNA } from '../components/DNA3D'

const F  = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

export default function HospitalMatches() {
  const navigate = useNavigate()
  const { result, location } = useStore()
  const [filters, setFilters]         = useState({})
  const [osmHospitals, setOsmHospitals] = useState([])
  const [loading, setLoading]          = useState(false)
  const [source, setSource]            = useState('pipeline') // 'osm' | 'pipeline'

  if (!result) return (
    <div style={{ minHeight: '100vh', background: '#F5F3F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
      <Navbar />
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#6B7B8D', marginBottom: 16 }}>No analysis found. Run an assessment first.</p>
        <button onClick={() => navigate('/input')} className="btn-primary">Begin Assessment</button>
      </div>
    </div>
  )

  const { hospitals: pipelineHospitals = [], clinical = {}, confidence } = result
  const top     = clinical?.conditions?.[0]
  const confPct = Math.round((confidence?.percentage || 0))
  const specialty = top?.recommended_specialty || 'General Medicine'
  const city      = location?.city || 'Bangalore'

  // Fetch real hospitals from OSM on mount
  useEffect(() => {
    const fetchOSM = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `http://localhost:8000/api/places/hospitals?city=${encodeURIComponent(city)}&specialty=${encodeURIComponent(specialty)}`
        )
        if (!res.ok) throw new Error('OSM fetch failed')
        const data = await res.json()

        if (data.hospitals && data.hospitals.length > 0) {
          // Merge OSM real-world data with pipeline cost estimates
          const merged = data.hospitals.map((h, i) => {
            const pipelineH = pipelineHospitals[i] || pipelineHospitals[0] || {}
            return {
              // Real fields from OSM
              id:            h.name.replace(/\s+/g, '-').toLowerCase() + '-' + i,
              name:          h.name,
              city:          city,
              address:       h.address,
              distance_km:   h.distance_km,
              emergency:     h.emergency,
              phone:         h.phone,
              website:       h.website,
              maps_url:      h.maps_url,
              // Meaningful fields from pipeline (scoring, cost, specialty)
              score:         pipelineH.score         || (0.95 - i * 0.05),
              specialties:   pipelineH.specialties   || [specialty],
              tier:          pipelineH.tier          || 'super_specialty',
              cost_estimate: pipelineH.cost_estimate || null,
              wait_time_mins:pipelineH.wait_time_mins|| Math.round(10 + i * 4),
              er_capable:    h.emergency || pipelineH.er_capable || false,
              rating:        h.rating,
              osm_verified:  true,
            }
          })
          setOsmHospitals(merged)
          setSource('osm')
        }
      } catch (e) {
        console.warn('OSM fetch failed, showing pipeline data:', e.message)
        setSource('pipeline')
      }
      setLoading(false)
    }
    fetchOSM()
  }, [city, specialty])

  const displayHospitals = source === 'osm' && osmHospitals.length > 0
    ? osmHospitals
    : pipelineHospitals

  return (
    <div style={{ minHeight: '100vh', fontFamily: F, background: '#F5F3F0' }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px 64px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48, flexWrap: 'wrap', gap: 24 }}>
          <SectionReveal>
            <div className="label" style={{ marginBottom: 12 }}>Matched Facilities</div>
            <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.05, color: '#0B1F3D', fontFamily: F }}>
              {city} Medical<br />
              <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>Network.</em>
            </h1>
            {/* Source badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <span style={{ fontFamily: FM, fontSize: 10, color: source === 'osm' ? '#2E7D32' : '#B8962E',
                background: source === 'osm' ? 'rgba(46,125,50,0.1)' : 'rgba(184,150,46,0.1)',
                padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>
                {loading ? '⏳ Fetching real hospitals...' : source === 'osm' ? '✅ Live OpenStreetMap Data' : '📋 Curated Hospital Data'}
              </span>
              <span style={{ fontFamily: FM, fontSize: 10, color: '#6B7B8D' }}>📍 {city}</span>
            </div>
          </SectionReveal>

          {top && (
            <SectionReveal delay={0.15}>
              <div className="card" style={{ padding: '24px 32px', minWidth: 320 }}>
                <div className="data-label" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Case Synthesis</span>
                  <div style={{ transform: 'scale(0.7)', margin: '-20px -20px -20px 0', opacity: 0.8 }}><MiniDNA /></div>
                </div>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#0B1F3D', marginBottom: 6, fontFamily: F }}>{top.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 100, height: 4, background: 'rgba(11,31,61,0.06)', borderRadius: 2 }}>
                    <div style={{ width: `${confPct}%`, height: '100%', background: '#D4AF37', borderRadius: 2 }} />
                  </div>
                  <span style={{ fontFamily: FM, fontSize: 11, color: '#6B7B8D' }}>{confPct}% Confidence</span>
                </div>
                <span style={{ fontFamily: FM, fontSize: 10, color: '#1976D2', background: 'rgba(25,118,210,0.08)', padding: '2px 8px', borderRadius: 10 }}>
                  {specialty}
                </span>
              </div>
            </SectionReveal>
          )}
        </div>

        <SectionReveal delay={0.2} style={{ marginBottom: 32 }}>
          <div style={{ padding: 4 }}>
            <FilterBar onFilter={setFilters} specialties={top ? [top.recommended_specialty].filter(Boolean) : []} />
          </div>
        </SectionReveal>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(11,31,61,0.1)', borderTopColor: '#0B1F3D', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontFamily: FM, fontSize: 13, color: '#6B7B8D' }}>Searching real hospitals in {city}...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24, marginBottom: 56 }}>
            {displayHospitals.slice(0, 8).map((h, i) => (
              <HospitalCard
                key={h.id || i}
                hospital={h}
                rank={i + 1}
                onClick={() => h.maps_url && window.open(h.maps_url, '_blank')}
              />
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.button onClick={() => navigate('/cost-analysis')} className="btn-primary"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '16px 48px', fontSize: 16, marginRight: 16 }}>
            Financial Transparency →
          </motion.button>
          <button onClick={() => navigate('/dashboard')} className="btn-outline" style={{ padding: '16px 32px', fontSize: 15 }}>
            ← Intelligence Results
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#8A97A6', fontStyle: 'italic', fontFamily: F }}>
          HEALIX AI · Built by Jabbar Hasib
        </p>
      </div>

      <Footer />
    </div>
  )
}
