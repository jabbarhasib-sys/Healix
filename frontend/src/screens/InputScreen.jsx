import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SectionReveal from '../components/SectionReveal'
import DNA3D from '../components/DNA3D'

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

export default function InputScreen() {
  const navigate = useNavigate()
  const { 
    symptomsText, setSymptomsText,
    patientName, setPatientName,
    patientAge, setPatientAge,
    patientGender, setPatientGender,
    location, setLocation,
    nearbyHospitals, setNearbyHospitals
  } = useStore()
  
  const [isFocused, setIsFocused] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [cityInput, setCityInput] = useState(location?.city || '')

  const handleNext = () => {
    if (!symptomsText.trim()) return
    navigate('/processing')
  }

  // Database of hospitals with specialties
  const MASTER_HOSPITALS = [
    { 
      name: 'CardioCare Heart Institute', 
      address: 'Plot 42, Health City, Mumbai', 
      distance: '1.2 km', 
      img: '/hospital_mockup_1_1777223441621.png',
      specialties: ['heart', 'cardiac', 'chest', 'breath', 'emergency']
    },
    { 
      name: 'NeuroLink Brain Center', 
      address: 'B-Block, Metro Plaza, Mumbai', 
      distance: '2.5 km', 
      img: '/hospital_mockup_2_1777223462644.png',
      specialties: ['brain', 'nerve', 'headache', 'stroke', 'seizure', 'neurology']
    },
    { 
      name: 'LifeLine General Hospital', 
      address: '7th Avenue, West Side, Mumbai', 
      distance: '0.9 km', 
      img: '/hospital_mockup_1_1777223441621.png',
      specialties: ['general', 'fever', 'flu', 'emergency', 'abdominal']
    },
    { 
      name: 'Apollo Ortho & Spine', 
      address: 'Link Road, South Mumbai', 
      distance: '4.1 km', 
      img: '/hospital_mockup_2_1777223462644.png',
      specialties: ['bone', 'joint', 'spine', 'back', 'accident']
    }
  ]

  const handleSearchHospitals = () => {
    if (!cityInput.trim()) return
    setIsLocating(true)
    
    // Simulate API delay
    setTimeout(() => {
      setLocation({ city: cityInput, lat: 0, lng: 0 })
      
      const lowerSymptoms = symptomsText.toLowerCase()
      
      // Filter hospitals based on keywords in symptoms
      let filtered = MASTER_HOSPITALS.filter(h => 
        h.specialties.some(s => lowerSymptoms.includes(s))
      )
      
      // If no specific match, show general hospitals or all
      if (filtered.length === 0) filtered = MASTER_HOSPITALS.filter(h => h.specialties.includes('general'))
      if (filtered.length === 0) filtered = [MASTER_HOSPITALS[2]] // Fallback to general

      setNearbyHospitals(filtered)
      setIsLocating(false)
    }, 1200)
  }

  const examples = [
    "Severe chest pain radiating to my left arm for the last 2 hours.",
    "Persistent high fever with severe joint pain and a rash.",
    "Worst headache of my life with sudden neck stiffness.",
    "Abdominal pain in the lower right side with nausea."
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3F0', fontFamily: F, position: 'relative', overflowX: 'hidden' }}>
      <DNA3D />
      <Navbar />

      <div style={{ maxWidth: 950, margin: '0 auto', padding: '120px 24px 80px', position: 'relative', zIndex: 1, background: 'radial-gradient(circle, rgba(245,243,240,0.9) 0%, rgba(245,243,240,0) 80%)' }}>
        <SectionReveal>
          <div className="label" style={{ marginBottom: 16, textAlign: 'center' }}>Clinical Intake</div>
          <h1 style={{ 
            fontSize: 'clamp(32px, 5vw, 52px)', 
            fontWeight: 700, 
            textAlign: 'center', 
            color: '#0B1F3D', 
            letterSpacing: -1, 
            lineHeight: 1.1,
            marginBottom: 20
          }}>
            Tell Your <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>Story.</em>
          </h1>
        </SectionReveal>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'flex-start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* ── Patient Info ── */}
            <SectionReveal delay={0.05}>
              <div className="card" style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 80px 120px', gap: 16 }}>
                <div>
                  <div className="label-muted" style={{ marginBottom: 8 }}>Patient Name</div>
                  <input 
                    type="text" 
                    value={patientName} 
                    onChange={e => setPatientName(e.target.value)}
                    placeholder="Full Name"
                    style={{ width: '100%', background: '#F9F9F9', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 8, padding: '12px 14px', fontFamily: F, fontSize: 15 }}
                  />
                </div>
                <div>
                  <div className="label-muted" style={{ marginBottom: 8 }}>Age</div>
                  <input 
                    type="number" 
                    value={patientAge} 
                    onChange={e => setPatientAge(e.target.value)}
                    placeholder="yrs"
                    style={{ width: '100%', background: '#F9F9F9', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 8, padding: '12px 14px', fontFamily: F, fontSize: 15 }}
                  />
                </div>
                <div>
                  <div className="label-muted" style={{ marginBottom: 8 }}>Gender</div>
                  <select 
                    value={patientGender} 
                    onChange={e => setPatientGender(e.target.value)}
                    style={{ width: '100%', background: '#F9F9F9', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 8, padding: '12px 14px', fontFamily: F, fontSize: 15, cursor: 'pointer' }}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </SectionReveal>

            {/* ── Symptoms Input ── */}
            <SectionReveal delay={0.1}>
              <div style={{ 
                position: 'relative',
                background: '#FFFFFF',
                borderRadius: 24,
                padding: 32,
                boxShadow: isFocused 
                  ? '0 12px 48px rgba(11,31,61,0.08), 0 8px 16px rgba(11,31,61,0.06)' 
                  : '0 4px 16px rgba(11,31,61,0.04), 0 2px 4px rgba(11,31,61,0.02)',
                border: '1px solid rgba(11,31,61,0.06)',
                borderTop: '1px solid rgba(255,255,255,0.9)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
                <textarea
                  value={symptomsText}
                  onChange={(e) => setSymptomsText(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="e.g., I have been feeling a sharp pain in my chest..."
                  style={{
                    width: '100%', height: 160, background: 'transparent', border: 'none', resize: 'none',
                    fontFamily: F, fontSize: 18, color: '#0B1F3D', lineHeight: 1.6, outline: 'none', marginBottom: 24
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(11,31,61,0.03)', padding: '4px 4px 4px 12px', borderRadius: 8 }}>
                    <span style={{ fontSize: 14 }}>📍</span>
                    <input 
                      type="text"
                      value={cityInput}
                      onChange={e => setCityInput(e.target.value)}
                      placeholder="Enter City"
                      style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: F, fontSize: 14, width: 100, color: '#0B1F3D' }}
                    />
                    <button onClick={handleSearchHospitals} className="btn-outline" style={{ padding: '6px 12px', fontSize: 11, border: 'none', background: '#0B1F3D', color: '#FFF' }}>
                      {isLocating ? '...' : 'Search'}
                    </button>
                  </div>
                  <motion.button
                    onClick={handleNext}
                    disabled={!symptomsText.trim()}
                    className="btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ opacity: symptomsText.trim() ? 1 : 0.5, padding: '12px 32px' }}
                  >
                    Analyse Case →
                  </motion.button>
                </div>
              </div>
            </SectionReveal>

            {/* ── Examples ── */}
            <SectionReveal delay={0.2}>
              <div style={{ marginTop: 10 }}>
                <div className="label-muted" style={{ marginBottom: 12 }}>Clinical Examples</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {examples.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setSymptomsText(ex)}
                      style={{
                        background: '#FFFFFF', border: '1px solid rgba(11,31,61,0.05)', borderRadius: 12, padding: '12px 14px',
                        textAlign: 'left', fontFamily: F, fontSize: 13, color: '#6B7B8D', cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)', lineHeight: 1.4
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; e.currentTarget.style.color = '#0B1F3D'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(11,31,61,0.05)'; e.currentTarget.style.color = '#6B7B8D'; }}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </SectionReveal>
          </div>

          {/* ── Sidebar: Nearby Hospitals ── */}
          <SectionReveal delay={0.3} direction="left">
            <div className="card" style={{ padding: 24, minHeight: 480 }}>
              <div className="label" style={{ marginBottom: 20 }}>Emergency Routing</div>
              
              {!location ? (
                <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>🏥</div>
                  <p style={{ fontSize: 13, color: '#6B7B8D', fontFamily: F, lineHeight: 1.6 }}>
                    Enter your location and symptoms to see relevant emergency facilities.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ padding: '8px 12px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 8, fontSize: 11, color: '#B8962E', fontWeight: 700, textAlign: 'center', letterSpacing: 0.5 }}>
                    SUGGESTED FOR YOUR EMERGENCY
                  </div>
                  {nearbyHospitals.map((h, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                      style={{ borderBottom: i < nearbyHospitals.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none', paddingBottom: 24 }}
                    >
                      <img src={h.img} alt={h.name} style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 12, marginBottom: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#0B1F3D' }}>{h.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#D4AF37', fontFamily: FM }}>{h.distance}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#6B7B8D', margin: 0, lineHeight: 1.4 }}>{h.address}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </SectionReveal>

        </div>
      </div>

      <Footer />
    </div>
  )
}
