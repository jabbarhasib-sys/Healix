import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SectionReveal from '../components/SectionReveal'
import DNA3D from '../components/DNA3D'

const F  = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'


// ── City → real hospital data ─────────────────────────────────────────────────
const CITY_HOSPITALS = {
  Bangalore: [
    { name: 'Manipal Hospital', area: 'Old Airport Road', specialties: ['heart','cardiac','chest','emergency','general'] },
    { name: 'Narayana Health City', area: 'Bommasandra', specialties: ['heart','cardiac','chest','emergency'] },
    { name: 'NIMHANS', area: 'Hosur Road', specialties: ['brain','nerve','headache','stroke','seizure','dizziness','migraine'] },
    { name: 'Sakra World Hospital', area: 'Marathahalli', specialties: ['joint','bone','fracture','knee','shoulder','muscle'] },
    { name: 'Aster CMI Hospital', area: 'Hebbal', specialties: ['stomach','abdomen','nausea','vomit','bowel','indigestion'] },
    { name: 'Columbia Asia Hospital', area: 'Whitefield', specialties: ['fever','chills','body ache','dengue','infection','rash'] },
    { name: 'BGS Gleneagles Hospital', area: 'Kengeri', specialties: ['kidney','urinary','urine','kidney stone'] },
    { name: 'Fortis Hospital', area: 'Bannerghatta Road', specialties: ['breathing','cough','asthma','pneumonia','lungs'] },
  ],
  Mumbai: [
    { name: 'Kokilaben Dhirubhai Ambani Hospital', area: 'Andheri West', specialties: ['heart','cardiac','chest','emergency'] },
    { name: 'Lilavati Hospital', area: 'Bandra West', specialties: ['general','emergency','heart','cardiac'] },
    { name: 'Bombay Hospital', area: 'Marine Lines', specialties: ['brain','nerve','headache','stroke','seizure','migraine'] },
    { name: 'Hinduja Hospital', area: 'Mahim', specialties: ['joint','bone','fracture','knee','shoulder','muscle'] },
    { name: 'Jaslok Hospital', area: 'Pedder Road', specialties: ['stomach','abdomen','nausea','bowel','indigestion'] },
    { name: 'Breach Candy Hospital', area: 'Breach Candy', specialties: ['fever','chills','dengue','infection','rash'] },
    { name: 'P.D. Hinduja Hospital', area: 'Mahim', specialties: ['kidney','urinary','urine','kidney stone'] },
    { name: 'Nanavati Hospital', area: 'Vile Parle West', specialties: ['breathing','cough','asthma','pneumonia','lungs'] },
  ],
  Delhi: [
    { name: 'AIIMS Delhi', area: 'Ansari Nagar', specialties: ['general','emergency','heart','cardiac','brain'] },
    { name: 'Fortis Escorts Heart Institute', area: 'Okhla', specialties: ['heart','cardiac','chest','palpitation','emergency'] },
    { name: 'Apollo Hospital', area: 'Sarita Vihar', specialties: ['brain','nerve','headache','stroke','seizure','migraine'] },
    { name: 'Sir Ganga Ram Hospital', area: 'Rajinder Nagar', specialties: ['joint','bone','fracture','knee','muscle'] },
    { name: 'Max Super Speciality Hospital', area: 'Patparganj', specialties: ['stomach','abdomen','nausea','bowel','indigestion'] },
    { name: 'Safdarjung Hospital', area: 'Safdarjung', specialties: ['fever','chills','dengue','malaria','infection'] },
    { name: 'Pushpawati Singhania Hospital', area: 'Sheikh Sarai', specialties: ['kidney','urinary','urine','kidney stone'] },
    { name: 'Batra Hospital', area: 'Tughlakabad', specialties: ['breathing','cough','asthma','pneumonia','lungs'] },
  ],
  Chennai: [
    { name: 'Apollo Hospital', area: 'Greams Road', specialties: ['heart','cardiac','chest','emergency','general'] },
    { name: 'Kauvery Hospital', area: 'Alwarpet', specialties: ['heart','cardiac','chest','palpitation'] },
    { name: 'MIOT International', area: 'Manapakkam', specialties: ['joint','bone','fracture','knee','shoulder','muscle'] },
    { name: 'Vijaya Hospital', area: 'Vadapalani', specialties: ['brain','nerve','headache','stroke','seizure','migraine'] },
    { name: 'Gleneagles Global Hospital', area: 'Perumbakkam', specialties: ['stomach','abdomen','nausea','bowel','liver'] },
    { name: 'Stanley Medical College Hospital', area: 'Royapuram', specialties: ['fever','chills','dengue','malaria','infection'] },
    { name: 'Madras Medical Mission', area: 'Mogappair', specialties: ['kidney','urinary','urine','kidney stone'] },
    { name: 'Sri Ramachandra Hospital', area: 'Porur', specialties: ['breathing','cough','asthma','pneumonia','lungs'] },
  ],
  Hyderabad: [
    { name: 'KIMS Hospital', area: 'Secunderabad', specialties: ['heart','cardiac','chest','emergency','general'] },
    { name: 'Star Hospitals', area: 'Banjara Hills', specialties: ['heart','cardiac','chest','palpitation','emergency'] },
    { name: 'Apollo Hospital', area: 'Jubilee Hills', specialties: ['brain','nerve','headache','stroke','seizure','migraine'] },
    { name: 'Yashoda Hospital', area: 'Malakpet', specialties: ['joint','bone','fracture','knee','shoulder','muscle'] },
    { name: 'AIG Hospitals', area: 'Gachibowli', specialties: ['stomach','abdomen','nausea','bowel','indigestion','liver'] },
    { name: 'NIMS Hospital', area: 'Panjagutta', specialties: ['fever','chills','dengue','malaria','infection','rash'] },
    { name: 'Asian Institute of Nephrology', area: 'Dilsukhnagar', specialties: ['kidney','urinary','urine','kidney stone'] },
    { name: 'Care Hospital', area: 'Banjara Hills', specialties: ['breathing','cough','asthma','pneumonia','lungs'] },
  ],
  Pune: [
    { name: 'Ruby Hall Clinic', area: 'Sassoon Road', specialties: ['heart','cardiac','chest','emergency','general'] },
    { name: 'Deenanath Mangeshkar Hospital', area: 'Erandwane', specialties: ['heart','cardiac','chest','palpitation'] },
    { name: 'Sahyadri Hospital', area: 'Deccan Gymkhana', specialties: ['brain','nerve','headache','stroke','seizure','migraine'] },
    { name: 'Aditya Birla Memorial Hospital', area: 'Chinchwad', specialties: ['joint','bone','fracture','knee','shoulder','muscle'] },
    { name: 'Jehangir Hospital', area: 'Sassoon Road', specialties: ['stomach','abdomen','nausea','bowel','indigestion'] },
    { name: 'KEM Hospital', area: 'Rasta Peth', specialties: ['fever','chills','dengue','infection','rash'] },
    { name: 'Poona Hospital', area: 'Sadashiv Peth', specialties: ['kidney','urinary','urine','kidney stone'] },
    { name: 'Inlaks and Budhrani Hospital', area: 'Koregaon Park', specialties: ['breathing','cough','asthma','pneumonia','lungs'] },
  ],
  Kolkata: [
    { name: 'Apollo Gleneagles Hospital', area: 'Salt Lake', specialties: ['heart','cardiac','chest','emergency','general'] },
    { name: 'Fortis Hospital', area: 'Anandapur', specialties: ['heart','cardiac','chest','palpitation','emergency'] },
    { name: 'AMRI Hospital', area: 'Dhakuria', specialties: ['brain','nerve','headache','stroke','seizure','migraine'] },
    { name: 'Peerless Hospital', area: 'Panchasayar', specialties: ['joint','bone','fracture','knee','shoulder','muscle'] },
    { name: 'Medica Superspecialty Hospital', area: 'Mukundapur', specialties: ['stomach','abdomen','nausea','bowel','indigestion'] },
    { name: 'CMRI Hospital', area: 'Dhakuria', specialties: ['fever','chills','dengue','infection','rash'] },
    { name: 'NRS Medical College Hospital', area: 'Sealdah', specialties: ['kidney','urinary','urine','kidney stone'] },
    { name: 'Belle Vue Clinic', area: 'Park Street', specialties: ['breathing','cough','asthma','pneumonia','lungs'] },
  ],
}

const SUPPORTED_CITIES = Object.keys(CITY_HOSPITALS)

// Geolocation city mapping by approximate timezone/IP lookup name
const GEO_CITY_MAP = {
  'bangalore': 'Bangalore', 'bengaluru': 'Bangalore',
  'mumbai': 'Mumbai', 'bombay': 'Mumbai',
  'delhi': 'Delhi', 'new delhi': 'Delhi',
  'chennai': 'Chennai', 'madras': 'Chennai',
  'hyderabad': 'Hyderabad',
  'pune': 'Pune',
  'kolkata': 'Kolkata', 'calcutta': 'Kolkata',
}

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
  const [selectedCity, setSelectedCity] = useState(location?.city || '')
  const [locationMode, setLocationMode] = useState('select') // 'select' | 'auto'
  const [errors, setErrors] = useState({})

  const isFormValid = patientName.trim() && patientAge && symptomsText.trim()

  const handleNext = () => {
    const newErrors = {}
    if (!patientName.trim()) newErrors.name = 'Patient name is required'
    if (!patientAge)         newErrors.age  = 'Age is required'
    if (!symptomsText.trim()) newErrors.symptoms = 'Please describe your symptoms'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    navigate('/processing')
  }

  // Derive specialty from symptoms for better hospital matching
  const detectSpecialty = () => {
    const t = symptomsText.toLowerCase()
    if (/heart|chest pain|cardiac|palpitation/.test(t)) return 'Cardiology'
    if (/brain|headache|migraine|stroke|seizure|dizziness|nerve/.test(t)) return 'Neurology'
    if (/breathing|breathless|cough|asthma|pneumonia|lungs/.test(t)) return 'Pulmonology'
    if (/stomach|abdomen|nausea|vomit|diarrhea|appendix|bowel/.test(t)) return 'Gastroenterology'
    if (/joint|bone|fracture|knee|shoulder|muscle|arthritis/.test(t)) return 'Orthopedics'
    if (/kidney|urinary|urine|kidney stone|flank/.test(t)) return 'Nephrology'
    if (/fever|dengue|malaria|infection|chills/.test(t)) return 'Infectious'
    return 'General Medicine'
  }

  // Fallback to static list when API key is not set
  const staticFallback = (city) => {
    const cityHospitals = CITY_HOSPITALS[city] || []
    const lowerSymptoms = symptomsText.toLowerCase()
    let filtered = cityHospitals.filter(h => h.specialties.some(s => lowerSymptoms.includes(s)))
    if (filtered.length === 0) filtered = cityHospitals.slice(0, 3)
    return filtered.map((h, i) => ({
      name: h.name,
      address: `${h.area}, ${city}`,
      rating: null,
      user_ratings_total: null,
      photo_url: null,
      maps_url: `https://www.google.com/maps/search/${encodeURIComponent(h.name + ' ' + h.area + ' ' + city)}`,
      open_now: null,
    }))
  }

  const searchHospitalsForCity = async (city) => {
    setLocation({ city, lat: 0, lng: 0 })
    const specialty = detectSpecialty()
    try {
      const res = await fetch(
        `${API_BASE}/api/places/hospitals?city=${encodeURIComponent(city)}&specialty=${encodeURIComponent(specialty)}`
      )
      if (!res.ok) throw new Error('API key not configured')
      const data = await res.json()
      if (data.hospitals && data.hospitals.length > 0) {
        setNearbyHospitals(data.hospitals)
        return
      }
    } catch (e) {
      console.warn('Google Places API not available, using static fallback:', e.message)
    }
    // Fallback to static data
    setNearbyHospitals(staticFallback(city))
  }

  const handleSelectCity = async (city) => {
    if (!city) return
    setSelectedCity(city)
    setIsLocating(true)
    await searchHospitalsForCity(city)
    setIsLocating(false)
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }
    setIsLocating(true)
    setLocationMode('auto')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Reverse geocode using nominatim (free, no key needed)
          const { latitude, longitude } = pos.coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await res.json()
          const raw = (data.address?.city || data.address?.town || data.address?.village || '').toLowerCase()
          const matched = GEO_CITY_MAP[raw] || SUPPORTED_CITIES.find(c => raw.includes(c.toLowerCase()))
          const city = matched || 'Bangalore' // fallback
          setSelectedCity(city)
          searchHospitalsForCity(city)
        } catch {
          setSelectedCity('Bangalore')
          searchHospitalsForCity('Bangalore')
        }
        setIsLocating(false)
      },
      () => {
        // Permission denied or error — fallback to Bangalore
        setSelectedCity('Bangalore')
        searchHospitalsForCity('Bangalore')
        setIsLocating(false)
      },
      { timeout: 8000 }
    )
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
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, textAlign: 'center', color: '#0B1F3D', letterSpacing: -1, lineHeight: 1.1, marginBottom: 20 }}>
            Tell Your <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>Story.</em>
          </h1>
        </SectionReveal>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'flex-start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* ── Patient Info ── */}
            <SectionReveal delay={0.05}>
              <div className="card" style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 80px 120px', gap: 16 }}>
                {/* Patient Name — mandatory */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div className="label-muted">Patient Name</div>
                    <span style={{ fontSize: 10, color: '#C62828', fontFamily: FM, fontWeight: 700 }}>* required</span>
                  </div>
                  <input
                    type="text"
                    value={patientName}
                    onChange={e => { setPatientName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })) }}
                    placeholder="Full Name"
                    style={{
                      width: '100%', background: errors.name ? 'rgba(198,40,40,0.04)' : '#F9F9F9',
                      border: errors.name ? '1.5px solid #C62828' : '1px solid rgba(0,0,0,0.05)',
                      borderRadius: 8, padding: '12px 14px', fontFamily: F, fontSize: 15,
                      outline: 'none', transition: 'border 0.2s'
                    }}
                  />
                  {errors.name && <p style={{ fontSize: 11, color: '#C62828', margin: '5px 0 0', fontFamily: FM }}>⚠ {errors.name}</p>}
                </div>

                {/* Age — mandatory */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div className="label-muted">Age</div>
                    <span style={{ fontSize: 10, color: '#C62828', fontFamily: FM, fontWeight: 700 }}>*</span>
                  </div>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={e => { setPatientAge(e.target.value); setErrors(prev => ({ ...prev, age: undefined })) }}
                    placeholder="yrs"
                    min="0" max="120"
                    style={{
                      width: '100%', background: errors.age ? 'rgba(198,40,40,0.04)' : '#F9F9F9',
                      border: errors.age ? '1.5px solid #C62828' : '1px solid rgba(0,0,0,0.05)',
                      borderRadius: 8, padding: '12px 14px', fontFamily: F, fontSize: 15,
                      outline: 'none', transition: 'border 0.2s'
                    }}
                  />
                  {errors.age && <p style={{ fontSize: 11, color: '#C62828', margin: '5px 0 0', fontFamily: FM }}>⚠</p>}
                </div>

                {/* Gender — optional */}
                <div>
                  <div className="label-muted" style={{ marginBottom: 8 }}>Gender</div>
                  <select value={patientGender} onChange={e => setPatientGender(e.target.value)}
                    style={{ width: '100%', background: '#F9F9F9', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 8, padding: '12px 14px', fontFamily: F, fontSize: 15, cursor: 'pointer' }}>
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
                background: '#FFFFFF', borderRadius: 24, padding: 32,
                boxShadow: isFocused ? '0 12px 48px rgba(11,31,61,0.08)' : '0 4px 16px rgba(11,31,61,0.04)',
                border: '1px solid rgba(11,31,61,0.06)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
                <textarea
                  value={symptomsText}
                  onChange={e => setSymptomsText(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="e.g., I have been feeling a sharp pain in my chest..."
                  style={{ width: '100%', height: 160, background: 'transparent', border: 'none', resize: 'none',
                    fontFamily: F, fontSize: 18, color: '#0B1F3D', lineHeight: 1.6, outline: 'none', marginBottom: 24 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                  {/* ── Location Selector ── */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {/* City Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(11,31,61,0.04)', borderRadius: 8, padding: '4px 10px', gap: 6 }}>
                      <span style={{ fontSize: 14 }}>📍</span>
                      <select
                        value={selectedCity}
                        onChange={e => handleSelectCity(e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: F, fontSize: 13, color: '#0B1F3D', cursor: 'pointer' }}
                      >
                        <option value="">Select City</option>
                        {SUPPORTED_CITIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Use My Location */}
                    <motion.button
                      onClick={handleUseMyLocation}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      disabled={isLocating}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(25,118,210,0.08)', 
                        border: '1px solid rgba(25,118,210,0.2)', borderRadius: 8, padding: '6px 12px', 
                        fontFamily: FM, fontSize: 11, color: '#1565C0', cursor: 'pointer', fontWeight: 600, letterSpacing: 0.3 }}
                    >
                      {isLocating ? (
                        <>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #1976D2', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
                          Locating...
                        </>
                      ) : (
                        <>🎯 Use My Location</>
                      )}
                    </motion.button>
                  </div>

                  <motion.button
                    onClick={handleNext}
                    className="btn-primary"
                    whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                    whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                    style={{ opacity: isFormValid ? 1 : 0.55, padding: '12px 32px', cursor: isFormValid ? 'pointer' : 'not-allowed' }}
                  >
                    Analyse Case →
                  </motion.button>
                </div>
              </div>
            </SectionReveal>

            {/* ── Examples ── */}
            <SectionReveal delay={0.2}>
              <div>
                <div className="label-muted" style={{ marginBottom: 12 }}>Clinical Examples</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {examples.map((ex, i) => (
                    <button key={i} onClick={() => setSymptomsText(ex)}
                      style={{ background: '#FFFFFF', border: '1px solid rgba(11,31,61,0.05)', borderRadius: 12, padding: '12px 14px',
                        textAlign: 'left', fontFamily: F, fontSize: 13, color: '#6B7B8D', cursor: 'pointer', transition: 'all 0.2s', lineHeight: 1.4 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; e.currentTarget.style.color = '#0B1F3D' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(11,31,61,0.05)'; e.currentTarget.style.color = '#6B7B8D' }}
                    >{ex}</button>
                  ))}
                </div>
              </div>
            </SectionReveal>
          </div>

          {/* ── Sidebar: Nearby Hospitals ── */}
          <SectionReveal delay={0.3} direction="left">
            <div className="card" style={{ padding: 24, minHeight: 480 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div className="label">Emergency Routing</div>
                {location?.city && (
                  <span style={{ fontFamily: FM, fontSize: 10, color: '#1976D2', fontWeight: 700, background: 'rgba(25,118,210,0.08)', padding: '3px 8px', borderRadius: 20 }}>
                    📍 {location.city}
                  </span>
                )}
              </div>
              
              {!location ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 32, marginBottom: 16 }}>🗺️</div>
                  <p style={{ fontSize: 13, color: '#6B7B8D', fontFamily: F, lineHeight: 1.7, opacity: 0.7 }}>
                    Select a city from the dropdown or tap<br/>
                    <strong>"Use My Location"</strong> to see relevant hospitals.
                  </p>
                  <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {SUPPORTED_CITIES.map(c => (
                      <button key={c} onClick={() => handleSelectCity(c)}
                        style={{ background: 'rgba(11,31,61,0.03)', border: '1px solid rgba(11,31,61,0.06)', borderRadius: 8, padding: '8px 16px',
                          fontFamily: F, fontSize: 13, color: '#0B1F3D', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(11,31,61,0.03)'; e.currentTarget.style.borderColor = 'rgba(11,31,61,0.06)' }}
                      >📍 {c}</button>
                    ))}
                  </div>
                </div>
              ) : isLocating ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(11,31,61,0.1)', borderTopColor: '#0B1F3D', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
                  <p style={{ fontSize: 13, color: '#6B7B8D' }}>Finding hospitals in {selectedCity}...</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div style={{ padding: '7px 12px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 8, fontSize: 10, color: '#B8962E', fontWeight: 700, textAlign: 'center', letterSpacing: 0.5, marginBottom: 20 }}>
                    MATCHED TO YOUR SYMPTOMS
                  </div>
                  {nearbyHospitals.map((h, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      onClick={() => window.open(h.maps_url || h.mapsUrl, '_blank')}
                      whileHover={{ backgroundColor: 'rgba(11,31,61,0.025)' }}
                      style={{ borderBottom: i < nearbyHospitals.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                        paddingBottom: 20, marginBottom: 20, cursor: 'pointer', borderRadius: 10, padding: 10, transition: 'background 0.2s' }}
                    >
                      {/* Photo */}
                      <div style={{ position: 'relative', marginBottom: 10 }}>
                        <img
                          src={h.photo_url ? `${API_BASE}${h.photo_url}` : (i % 2 === 0 ? '/hospital_mockup_1_1777223441621.png' : '/hospital_mockup_2_1777223462644.png')}
                          alt={h.name}
                          onError={e => { e.target.src = '/hospital_mockup_1_1777223441621.png' }}
                          style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        {/* Emergency badge */}
                        {h.emergency && (
                          <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(200,30,30,0.9)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10, letterSpacing: 0.5 }}>
                            🚨 EMERGENCY
                          </span>
                        )}
                        {/* Distance badge */}
                        {h.distance_km !== undefined && (
                          <span style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(11,31,61,0.82)', color: '#D4AF37', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10, fontFamily: FM }}>
                            {h.distance_km} km
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0B1F3D', lineHeight: 1.3, marginBottom: 3 }}>{h.name}</div>

                      {/* Rating (Google) or OSM source note */}
                      {h.rating ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                          <span style={{ color: '#F4A400', fontSize: 12 }}>{'★'.repeat(Math.round(h.rating))}{'☆'.repeat(5 - Math.round(h.rating))}</span>
                          <span style={{ fontSize: 11, color: '#0B1F3D', fontWeight: 700, fontFamily: FM }}>{h.rating.toFixed(1)}</span>
                          {h.user_ratings_total > 0 && <span style={{ fontSize: 10, color: '#8A97A6' }}>({h.user_ratings_total.toLocaleString()} reviews)</span>}
                        </div>
                      ) : (
                        <div style={{ fontSize: 10, color: '#aaa', fontFamily: FM, marginBottom: 4 }}>📍 OpenStreetMap verified</div>
                      )}

                      <p style={{ fontSize: 12, color: '#6B7B8D', margin: '0 0 4px', lineHeight: 1.4 }}>{h.address}</p>

                      {/* Phone */}
                      {h.phone && (
                        <div style={{ fontSize: 11, color: '#2E7D32', marginBottom: 3 }}
                          onClick={e => { e.stopPropagation(); window.open(`tel:${h.phone}`) }}>
                          📞 {h.phone}
                        </div>
                      )}

                      <span style={{ fontSize: 11, color: '#1976D2', fontWeight: 600 }}>📍 View on Google Maps →</span>
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
