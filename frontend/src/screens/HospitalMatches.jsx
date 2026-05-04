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
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'


export default function HospitalMatches() {
  const navigate = useNavigate()
  const { result, location } = useStore()
  const [filters, setFilters]           = useState({})
  const [osmHospitals, setOsmHospitals] = useState([])
  const [loading, setLoading]           = useState(false)
  const [source, setSource]             = useState('pipeline')

  if (!result) return (
    <div style={{ minHeight: '100vh', background: '#F5F3F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
      <Navbar />
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#6B7B8D', marginBottom: 16 }}>No analysis found. Run an assessment first.</p>
        <button onClick={() => navigate('/input')} className="btn-primary">Begin Assessment</button>
      </div>
    </div>
  )

  const { hospitals: pipelineHospitals = [], clinical = {}, confidence, risk = {} } = result
  const top       = clinical?.conditions?.[0]
  const confPct   = Math.round((confidence?.percentage || 0))
  const specialty = top?.recommended_specialty || 'General Medicine'
  const city      = location?.city || 'Bangalore'
  const userLat   = location?.lat
  const userLng   = location?.lng
  const isEmergency = risk?.is_emergency || false

  // Nearest ER hospital for emergency banner
  const nearestER = osmHospitals.find(h => h.er_capable) || osmHospitals[0]

  useEffect(() => {
    const fetchOSM = async () => {
      setLoading(true)
      try {
        // Build URL — use exact coords if available (5km radius), else city center (8km)
        let url = `${API_BASE}/api/places/hospitals?city=${encodeURIComponent(city)}&specialty=${encodeURIComponent(specialty)}&radius=5000`
        if (userLat && userLng) url += `&lat=${userLat}&lng=${userLng}`

        const res = await fetch(url)
        if (!res.ok) throw new Error('OSM fetch failed')
        const data = await res.json()

        if (data.hospitals && data.hospitals.length > 0) {
          const merged = data.hospitals.map((h, i) => {
            const pipelineH = pipelineHospitals[i] || pipelineHospitals[0] || {}
            return {
              id:             h.name.replace(/\s+/g, '-').toLowerCase() + '-' + i,
              name:           h.name,
              city:           city,
              address:        h.address,
              distance_km:    h.distance_km,
              emergency:      h.emergency,
              er_capable:     h.emergency || pipelineH.er_capable || false,
              phone:          h.phone,
              website:        h.website,
              maps_url:       h.maps_url,
              score:          pipelineH.score         || (0.95 - i * 0.05),
              specialties:    pipelineH.specialties   || [specialty],
              tier:           pipelineH.tier          || 'general',
              cost_estimate:  pipelineH.cost_estimate || null,
              wait_time_mins: pipelineH.wait_time_mins|| Math.round(10 + i * 4),
              rating:         h.rating,
              osm_verified:   true,
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
  }, [city, specialty, userLat, userLng])

  const displayHospitals = source === 'osm' && osmHospitals.length > 0
    ? osmHospitals
    : pipelineHospitals

  return (
    <div style={{ minHeight: '100vh', fontFamily: F, background: '#F5F3F0' }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px 64px' }}>

        {/* ── EMERGENCY BANNER ───────────────────────────── */}
        {isEmergency && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #C62828, #B71C1C)',
              borderRadius: 16,
              padding: '20px 28px',
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              boxShadow: '0 4px 24px rgba(198,40,40,0.35)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 36 }}>🚨</span>
              <div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: 0, fontFamily: F }}>
                  Emergency Detected — Go to Nearest ER Immediately
                </p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: '4px 0 0', fontFamily: FM }}>
                  {nearestER
                    ? `Nearest hospital: ${nearestER.name} (${nearestER.distance_km} km away)`
                    : 'Call 112 or go to the nearest emergency room now'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="tel:112"
                style={{ background: '#fff', color: '#C62828', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontFamily: FM, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                📞 Call 112
              </a>
              {nearestER?.maps_url && (
                <a href={nearestER.maps_url} target="_blank" rel="noopener noreferrer"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontFamily: FM, fontSize: 13, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                  🗺 Navigate to ER →
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* ── HEADER ──────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48, flexWrap: 'wrap', gap: 24 }}>
          <SectionReveal>
            <div className="label" style={{ marginBottom: 12 }}>Matched Facilities</div>
            <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.05, color: '#0B1F3D', fontFamily: F }}>
              {city} Medical<br />
              <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>Network.</em>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: FM, fontSize: 10, color: source === 'osm' ? '#2E7D32' : '#B8962E',
                background: source === 'osm' ? 'rgba(46,125,50,0.1)' : 'rgba(184,150,46,0.1)',
                padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>
                {loading ? '⏳ Finding hospitals near you...' : source === 'osm' ? '✅ Real Hospitals — Live Data' : '📋 Curated Hospital Data'}
              </span>
              <span style={{ fontFamily: FM, fontSize: 10, color: '#6B7B8D' }}>
                📍 {userLat && userLng ? 'Your exact location' : city} · within 5 km
              </span>
            </div>
          </SectionReveal>

          {top && (
            <SectionReveal delay={0.15}>
              <div className="card" style={{ padding: '24px 32px', minWidth: 280 }}>
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
            <p style={{ fontFamily: FM, fontSize: 13, color: '#6B7B8D' }}>Searching hospitals within 5 km of your location...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24, marginBottom: 56 }}>
            {displayHospitals.slice(0, 8).map((h, i) => (
              <HospitalCard
                key={h.id || i}
                hospital={h}
                rank={i + 1}
                onClick={() => {
                  const url = h.maps_url
                    || `https://www.google.com/maps/search/${encodeURIComponent((h.name || '') + ' ' + (h.city || city) + ' hospital')}`
                  window.open(url, '_blank', 'noopener,noreferrer')
                }}
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
