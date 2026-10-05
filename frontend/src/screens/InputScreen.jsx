import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import useStore from '../store/useStore'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SectionReveal from '../components/SectionReveal'
import DNA3D from '../components/DNA3D'

const F  = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── City → real hospital & neighborhood clinic dataset ──────────────────────────
const CITY_FACILITIES = {
  Bangalore: [
    { name: 'Manipal Hospital', area: 'Old Airport Road', facility_type: 'hospital', rating: 4.8, distance_km: 2.4, specialties: ['heart','cardiac','chest','emergency','general','orthopedics'] },
    { name: 'Apollo Clinic Indiranagar', area: 'Indiranagar (100ft Rd)', facility_type: 'clinic', rating: 4.7, distance_km: 1.6, specialties: ['general','fever','cardiac','cough','paediatrics','skin'] },
    { name: 'NIMHANS Neuro Centre', area: 'Hosur Road', facility_type: 'hospital', rating: 4.9, distance_km: 3.5, specialties: ['brain','nerve','headache','stroke','seizure','dizziness','migraine'] },
    { name: 'MedPlus Health Clinic', area: 'Koramangala 5th Block', facility_type: 'clinic', rating: 4.6, distance_km: 1.2, specialties: ['general','fever','infection','diabetology','stomach'] },
    { name: 'Sakra World Hospital', area: 'Marathahalli / Bellandur', facility_type: 'hospital', rating: 4.7, distance_km: 4.8, specialties: ['joint','bone','fracture','knee','shoulder','muscle','heart'] },
    { name: 'Practo Care Clinic', area: 'HSR Layout Sector 1', facility_type: 'clinic', rating: 4.8, distance_km: 2.1, specialties: ['orthopedics','joint','stomach','general','physiotherapy'] },
    { name: 'Aster CMI Hospital', area: 'Hebbal', facility_type: 'hospital', rating: 4.7, distance_km: 6.2, specialties: ['stomach','abdomen','nausea','vomit','bowel','indigestion','liver'] },
    { name: 'Aster Clinic Whitefield', area: 'Whitefield Main Rd', facility_type: 'clinic', rating: 4.7, distance_km: 5.4, specialties: ['general','breathing','cough','paediatrics','skin'] },
    { name: 'Fortis Hospital', area: 'Bannerghatta Road', facility_type: 'hospital', rating: 4.8, distance_km: 5.1, specialties: ['breathing','cough','asthma','pneumonia','lungs','heart'] },
    { name: 'Manipal Clinic Jayanagar', area: 'Jayanagar 4th Block', facility_type: 'clinic', rating: 4.8, distance_km: 2.8, specialties: ['general','heart','bone','diabetes','skin'] },
  ],
  Mumbai: [
    { name: 'Kokilaben Dhirubhai Ambani Hospital', area: 'Andheri West', facility_type: 'hospital', rating: 4.8, distance_km: 3.2, specialties: ['heart','cardiac','chest','emergency'] },
    { name: 'Apollo Clinic Bandra', area: 'Bandra West', facility_type: 'clinic', rating: 4.7, distance_km: 1.4, specialties: ['general','fever','cardiac','skin'] },
    { name: 'Lilavati Hospital', area: 'Bandra West', facility_type: 'hospital', rating: 4.7, distance_km: 2.8, specialties: ['general','emergency','heart','cardiac'] },
    { name: 'HealthFirst Family Clinic', area: 'Andheri East', facility_type: 'clinic', rating: 4.6, distance_km: 1.8, specialties: ['general','cough','fever','diabetology'] },
    { name: 'Bombay Hospital', area: 'Marine Lines', facility_type: 'hospital', rating: 4.6, distance_km: 6.0, specialties: ['brain','nerve','headache','stroke','seizure','migraine'] },
  ],
  Delhi: [
    { name: 'AIIMS Delhi', area: 'Ansari Nagar', facility_type: 'hospital', rating: 4.9, distance_km: 4.1, specialties: ['general','emergency','heart','cardiac','brain'] },
    { name: 'Apollo Clinic Saket', area: 'Saket District Centre', facility_type: 'clinic', rating: 4.7, distance_km: 1.5, specialties: ['general','cardiac','pediatrics','skin'] },
    { name: 'Fortis Escorts Heart Institute', area: 'Okhla', facility_type: 'hospital', rating: 4.8, distance_km: 5.2, specialties: ['heart','cardiac','chest','palpitation','emergency'] },
    { name: 'Max MedCentre', area: 'Panchsheel Park', facility_type: 'clinic', rating: 4.8, distance_km: 2.0, specialties: ['general','bone','digestive','diabetes'] },
  ],
  Chennai: [
    { name: 'Apollo Hospital', area: 'Greams Road', facility_type: 'hospital', rating: 4.8, distance_km: 3.0, specialties: ['heart','cardiac','chest','emergency','general'] },
    { name: 'Apollo Clinic Anna Nagar', area: 'Anna Nagar West', facility_type: 'clinic', rating: 4.7, distance_km: 1.8, specialties: ['general','fever','diabetes','pediatrics'] },
    { name: 'Kauvery Hospital', area: 'Alwarpet', facility_type: 'hospital', rating: 4.7, distance_km: 2.5, specialties: ['heart','cardiac','chest','palpitation'] },
  ],
  Hyderabad: [
    { name: 'KIMS Hospital', area: 'Secunderabad', facility_type: 'hospital', rating: 4.8, distance_km: 3.5, specialties: ['heart','cardiac','chest','emergency','general'] },
    { name: 'Apollo Clinic Jubilee Hills', area: 'Road No. 36 Jubilee Hills', facility_type: 'clinic', rating: 4.7, distance_km: 1.7, specialties: ['general','fever','bone','cardio'] },
    { name: 'Star Hospitals', area: 'Banjara Hills', facility_type: 'hospital', rating: 4.7, distance_km: 2.9, specialties: ['heart','cardiac','chest','palpitation','emergency'] },
  ],
  Pune: [
    { name: 'Ruby Hall Clinic', area: 'Sassoon Road', facility_type: 'hospital', rating: 4.7, distance_km: 2.2, specialties: ['heart','cardiac','chest','emergency','general'] },
    { name: 'Apollo Clinic Viman Nagar', area: 'Viman Nagar', facility_type: 'clinic', rating: 4.6, distance_km: 1.4, specialties: ['general','skin','fever','pediatrics'] },
    { name: 'Deenanath Mangeshkar Hospital', area: 'Erandwane', facility_type: 'hospital', rating: 4.8, distance_km: 3.8, specialties: ['heart','cardiac','chest','palpitation'] },
  ],
  Kolkata: [
    { name: 'Apollo Gleneagles Hospital', area: 'Salt Lake', facility_type: 'hospital', rating: 4.8, distance_km: 3.1, specialties: ['heart','cardiac','chest','emergency','general'] },
    { name: 'Fortis Clinic', area: 'Ballygunge', facility_type: 'clinic', rating: 4.7, distance_km: 1.6, specialties: ['general','cardiac','fever','skin'] },
    { name: 'AMRI Hospital', area: 'Dhakuria', facility_type: 'hospital', rating: 4.6, distance_km: 2.8, specialties: ['brain','nerve','headache','stroke','seizure','migraine'] },
  ],
}

const SUPPORTED_CITIES = Object.keys(CITY_FACILITIES)

// Comprehensive map — handles city, district, county, state_district variants
const GEO_CITY_MAP = {
  'bangalore': 'Bangalore', 'bengaluru': 'Bangalore',
  'bangalore urban': 'Bangalore', 'bangalore rural': 'Bangalore',
  'bengaluru urban': 'Bangalore', 'bengaluru rural': 'Bangalore',
  'bbmp': 'Bangalore', 'bmc ward': 'Bangalore',
  'mumbai': 'Mumbai', 'bombay': 'Mumbai', 'greater mumbai': 'Mumbai',
  'mumbai city': 'Mumbai', 'mumbai suburban': 'Mumbai',
  'delhi': 'Delhi', 'new delhi': 'Delhi', 'ncr': 'Delhi',
  'south delhi': 'Delhi', 'north delhi': 'Delhi', 'east delhi': 'Delhi', 'west delhi': 'Delhi',
  'chennai': 'Chennai', 'madras': 'Chennai',
  'hyderabad': 'Hyderabad', 'secunderabad': 'Hyderabad', 'cyberabad': 'Hyderabad',
  'pune': 'Pune', 'pimpri': 'Pune', 'chinchwad': 'Pune',
  'kolkata': 'Kolkata', 'calcutta': 'Kolkata', 'north 24 parganas': 'Kolkata',
}

/**
 * Robustly parse a Nominatim reverse-geocode address object into { city, suburb }.
 * Prioritizes granular city/town fields over district/state_district to avoid
 * showing Maharashtra districts when the user is in Bangalore.
 */
function parseCityFromNominatim(addr) {
  // Direct city candidates — in order of precision
  const cityCandidates = [
    addr.city,
    addr.town,
    addr.municipality,
    addr.city_district,
    // Do NOT include county/district/state_district here — those are too broad
    // and cause the Maharashtra confusion
  ].filter(Boolean).map(s => s.toLowerCase())

  for (const candidate of cityCandidates) {
    // Try exact match first
    if (GEO_CITY_MAP[candidate]) return GEO_CITY_MAP[candidate]
    // Try partial match (e.g., 'bengaluru urban district' contains 'bengaluru')
    for (const [key, val] of Object.entries(GEO_CITY_MAP)) {
      if (candidate.includes(key) || key.includes(candidate)) return val
    }
    // Try against supported cities list
    const found = SUPPORTED_CITIES.find(c => candidate.includes(c.toLowerCase()))
    if (found) return found
  }

  // Only fall back to state_district / county if no city match found above
  const broadCandidates = [
    addr.county,
    addr.state_district,
    addr.suburb,
    addr.neighbourhood,
  ].filter(Boolean).map(s => s.toLowerCase())

  for (const candidate of broadCandidates) {
    if (GEO_CITY_MAP[candidate]) return GEO_CITY_MAP[candidate]
    for (const [key, val] of Object.entries(GEO_CITY_MAP)) {
      if (candidate.includes(key) || key.includes(candidate)) return val
    }
  }

  return null  // caller will handle fallback
}

export default function InputScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
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
  const [gpsTracking, setGpsTracking] = useState(false)
  const [selectedCity, setSelectedCity] = useState(location?.city || 'Bangalore')
  const [facilityFilter, setFacilityFilter] = useState('all') // 'all' | 'hospital' | 'clinic'
  const [liveLocationText, setLiveLocationText] = useState(location?.area || '')
  const [gmapsNearbyUrl, setGmapsNearbyUrl] = useState('')
  const [errors, setErrors] = useState({})
  const watchIdRef = useRef(null)   // GPS watchPosition ID
  const lastSearchRef = useRef('')  // prevent duplicate searches

  const isFormValid = patientName.trim() && patientAge && symptomsText.trim()

  // Cleanup GPS watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  const handleNext = () => {
    const newErrors = {}
    if (!patientName.trim()) newErrors.name = t('input.errName')
    if (!patientAge)         newErrors.age  = t('input.errAge')
    if (!symptomsText.trim()) newErrors.symptoms = t('input.errSymptoms')
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    navigate('/processing')
  }

  // Derive specialty from symptoms for better facility matching
  const detectSpecialty = () => {
    const txt = symptomsText.toLowerCase()
    if (/heart|chest pain|cardiac|palpitation/.test(txt)) return 'Cardiology'
    if (/brain|headache|migraine|stroke|seizure|dizziness|nerve/.test(txt)) return 'Neurology'
    if (/breathing|breathless|cough|asthma|pneumonia|lungs/.test(txt)) return 'Pulmonology'
    if (/stomach|abdomen|nausea|vomit|diarrhea|appendix|bowel/.test(txt)) return 'Gastroenterology'
    if (/joint|bone|fracture|knee|shoulder|muscle|arthritis/.test(txt)) return 'Orthopedics'
    if (/kidney|urinary|urine|kidney stone|flank/.test(txt)) return 'Nephrology'
    if (/fever|dengue|malaria|infection|chills/.test(txt)) return 'Infectious'
    return 'General Medicine'
  }

  // Fallback to static data with both hospitals & clinics
  const staticFallback = (city, lat, lng) => {
    const list = CITY_FACILITIES[city] || CITY_FACILITIES['Bangalore']
    const lower = symptomsText.toLowerCase()
    let filtered = list.filter(h => h.specialties.some(s => lower.includes(s)))
    if (filtered.length === 0) filtered = list

    return filtered.map((h, i) => ({
      name: h.name,
      city: city,
      area: h.area,
      address: `${h.area}, ${city}`,
      facility_type: h.facility_type || (h.name.toLowerCase().includes('clinic') ? 'clinic' : 'hospital'),
      rating: h.rating || 4.7,
      distance_km: h.distance_km || (1.2 + i * 0.7),
      specialties: h.specialties,
      maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + ' ' + h.area + ' ' + city)}`,
      er_capable: h.facility_type === 'hospital',
      emergency: h.facility_type === 'hospital' && i % 2 === 0,
    }))
  }

  const searchHospitalsForCity = async (city, lat, lng, areaName = '') => {
    const specialty = detectSpecialty()
    try {
      let url = `${API_BASE}/api/places/hospitals?city=${encodeURIComponent(city)}&specialty=${encodeURIComponent(specialty)}&radius=12000`
      if (lat && lng) url += `&lat=${lat}&lng=${lng}`
      
      const res = await fetch(url)
      if (!res.ok) throw new Error('Places API returned error')
      const data = await res.json()
      // Capture Google Maps nearby URL always
      if (data.gmaps_nearby_url) setGmapsNearbyUrl(data.gmaps_nearby_url)
      if (data.hospitals && data.hospitals.length > 0) {
        setNearbyHospitals(data.hospitals)
        return
      }
    } catch (e) {
      console.warn('Live Places API fallback to internal dataset:', e.message)
    }
    // Fallback to static catalog with realistic distances
    setNearbyHospitals(staticFallback(city, lat, lng))
    // Set a fallback Google Maps URL based on available coords
    if (lat && lng) {
      setGmapsNearbyUrl(`https://www.google.com/maps/search/hospitals+clinics/@${lat},${lng},15z`)
    } else {
      setGmapsNearbyUrl(`https://www.google.com/maps/search/hospitals+near+${encodeURIComponent(city)}`)
    }
  }

  // Initial load
  useEffect(() => {
    const initCity = location?.city || 'Bangalore'
    setSelectedCity(initCity)
    if (!nearbyHospitals || nearbyHospitals.length === 0) {
      searchHospitalsForCity(initCity, location?.lat, location?.lng, location?.area)
    }
  }, [])

  const handleSelectCity = async (city) => {
    if (!city) return
    setSelectedCity(city)
    setLiveLocationText(city)
    setLocation({ city, lat: null, lng: null, area: city, isLive: false })
    setIsLocating(true)
    await searchHospitalsForCity(city)
    setIsLocating(false)
  }

  const reverseGeocodeAndSearch = async (latitude, longitude, accuracy) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      const addr = data.address || {}
      
      // Use robust parser — avoids Maharashtra confusion
      const city = parseCityFromNominatim(addr) || 'Bangalore'
      
      // Build human-readable area label (suburb/neighbourhood within the detected city)
      const suburb = addr.suburb || addr.neighbourhood || addr.residential
                     || addr.quarter || addr.village || addr.road || ''
      const fullArea = suburb ? `${suburb}, ${city}` : city
      const accText  = accuracy ? ` (±${Math.round(accuracy)}m)` : ''

      setSelectedCity(city)
      setLiveLocationText(`📍 ${fullArea}${accText}`)
      setLocation({
        city,
        lat: latitude,
        lng: longitude,
        area: fullArea,
        address: data.display_name,
        isLive: true,
      })

      // Only re-search if city or coords changed significantly
      const key = `${city}|${latitude.toFixed(3)}|${longitude.toFixed(3)}`
      if (lastSearchRef.current !== key) {
        lastSearchRef.current = key
        await searchHospitalsForCity(city, latitude, longitude, fullArea)
      }
    } catch (err) {
      console.warn('Reverse geocode failed, defaulting to Bangalore:', err)
      const city = 'Bangalore'
      setSelectedCity(city)
      setLiveLocationText(`📍 Bangalore (GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`)
      setLocation({ city, lat: latitude, lng: longitude, area: city, isLive: true })
      await searchHospitalsForCity(city, latitude, longitude)
    }
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }

    // Stop any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    setIsLocating(true)
    setGpsTracking(false)

    // One-shot high-accuracy fix first
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        await reverseGeocodeAndSearch(latitude, longitude, accuracy)
        setIsLocating(false)
        setGpsTracking(true)

        // Then watch for continuous updates (moves > ~50 m will trigger refresh)
        watchIdRef.current = navigator.geolocation.watchPosition(
          async (wpos) => {
            const { latitude: wlat, longitude: wlng, accuracy: wacc } = wpos.coords
            await reverseGeocodeAndSearch(wlat, wlng, wacc)
          },
          (err) => console.warn('GPS watch error:', err),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
        )
      },
      (err) => {
        console.warn('Geolocation denied/timeout:', err.message)
        // Friendly fallback — use Bangalore city center
        setSelectedCity('Bangalore')
        setLiveLocationText('📍 Bangalore (location denied)')
        setLocation({ city: 'Bangalore', lat: 12.9716, lng: 77.5946, area: 'Bangalore Center', isLive: false })
        searchHospitalsForCity('Bangalore', 12.9716, 77.5946)
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    )
  }

  const handleStopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setGpsTracking(false)
    setLocation(prev => ({ ...prev, isLive: false }))
    setLiveLocationText(selectedCity)
  }

  // Filter facilities in sidebar
  const displayedFacilities = (nearbyHospitals || []).filter(h => {
    if (facilityFilter === 'all') return true
    const isClinic = h.facility_type === 'clinic' || /clinic|dispensary|health centre|polyclinic/i.test(h.name)
    if (facilityFilter === 'clinic') return isClinic
    if (facilityFilter === 'hospital') return !isClinic
    return true
  })

  const examples = [
    t('input.ex1'),
    t('input.ex2'),
    t('input.ex3'),
    t('input.ex4'),
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3F0', fontFamily: F, position: 'relative', overflowX: 'hidden' }}>
      <Navbar />

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '120px 24px 80px', position: 'relative', zIndex: 1 }}>
        <SectionReveal>
          <div className="label" style={{ marginBottom: 16, textAlign: 'center' }}>{t('input.label')}</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 50px)', fontWeight: 700, textAlign: 'center', color: '#0B1F3D', letterSpacing: -1, lineHeight: 1.1, marginBottom: 20 }}>
            {t('input.heading')}
          </h1>
        </SectionReveal>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 380px', gap: 28, alignItems: 'flex-start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* ── Patient Info ── */}
            <SectionReveal delay={0.05}>
              <div className="card" style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 90px 120px', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div className="label-muted">{t('input.patientName')}</div>
                    <span style={{ fontSize: 10, color: '#C62828', fontFamily: FM, fontWeight: 700 }}>* {t('input.required')}</span>
                  </div>
                  <input
                    type="text"
                    value={patientName}
                    onChange={e => { setPatientName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })) }}
                    placeholder={t('input.namePlaceholder')}
                    style={{
                      width: '100%', background: errors.name ? 'rgba(198,40,40,0.04)' : '#F9F9F9',
                      border: errors.name ? '1.5px solid #C62828' : '1px solid rgba(0,0,0,0.05)',
                      borderRadius: 8, padding: '12px 14px', fontFamily: F, fontSize: 15,
                      outline: 'none', transition: 'border 0.2s'
                    }}
                  />
                  {errors.name && <p style={{ fontSize: 11, color: '#C62828', margin: '5px 0 0', fontFamily: FM }}>⚠ {errors.name}</p>}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div className="label-muted">{t('input.age')}</div>
                    <span style={{ fontSize: 10, color: '#C62828', fontFamily: FM, fontWeight: 700 }}>*</span>
                  </div>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={e => { setPatientAge(e.target.value); setErrors(prev => ({ ...prev, age: undefined })) }}
                    placeholder={t('input.agePlaceholder')}
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

                <div>
                  <div className="label-muted" style={{ marginBottom: 8 }}>{t('input.gender')}</div>
                  <select value={patientGender} onChange={e => setPatientGender(e.target.value)}
                    style={{ width: '100%', background: '#F9F9F9', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 8, padding: '12px 14px', fontFamily: F, fontSize: 15, cursor: 'pointer' }}>
                    <option value="">{t('input.genderSelect')}</option>
                    <option value="male">{t('input.genderMale')}</option>
                    <option value="female">{t('input.genderFemale')}</option>
                    <option value="other">{t('input.genderOther')}</option>
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
                  placeholder={t('input.symptomsPlaceholder')}
                  style={{ width: '100%', height: 160, background: 'transparent', border: 'none', resize: 'none',
                    fontFamily: F, fontSize: 18, color: '#0B1F3D', lineHeight: 1.6, outline: 'none', marginBottom: 24 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>

                  {/* Location Selector */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(11,31,61,0.04)', borderRadius: 8, padding: '6px 12px', gap: 6 }}>
                      <span style={{ fontSize: 14 }}>📍</span>
                      <select
                        value={selectedCity}
                        onChange={e => handleSelectCity(e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: F, fontSize: 13, color: '#0B1F3D', cursor: 'pointer', fontWeight: 600 }}
                      >
                        {SUPPORTED_CITIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* GPS Tracking Button */}
                    {gpsTracking ? (
                      <motion.button
                        onClick={handleStopTracking}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          background: 'rgba(46,125,50,0.1)',
                          border: '1.5px solid rgba(46,125,50,0.35)',
                          borderRadius: 8, padding: '7px 14px',
                          fontFamily: FM, fontSize: 11, color: '#2E7D32',
                          cursor: 'pointer', fontWeight: 700, letterSpacing: 0.3
                        }}
                      >
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%', background: '#2E7D32',
                          display: 'inline-block', animation: 'gpsPulse 1.2s ease-in-out infinite',
                        }} />
                        Live GPS · Stop
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={handleUseMyLocation}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        disabled={isLocating}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          background: isLocating ? 'rgba(25,118,210,0.04)' : 'rgba(25,118,210,0.08)',
                          border: '1px solid rgba(25,118,210,0.25)',
                          borderRadius: 8, padding: '7px 14px',
                          fontFamily: FM, fontSize: 11, color: '#1565C0',
                          cursor: isLocating ? 'not-allowed' : 'pointer', fontWeight: 700, letterSpacing: 0.3
                        }}
                      >
                        {isLocating ? (
                          <>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #1976D2', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
                            Locating…
                          </>
                        ) : (
                          <>🎯 Use My Location</>
                        )}
                      </motion.button>
                    )}
                  </div>

                  <motion.button
                    onClick={handleNext}
                    className="btn-primary"
                    whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                    whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                    style={{ opacity: isFormValid ? 1 : 0.55, padding: '12px 32px', cursor: isFormValid ? 'pointer' : 'not-allowed' }}
                  >
                    {t('input.analyseBtn')}
                  </motion.button>
                </div>
              </div>
            </SectionReveal>

            {/* ── Examples ── */}
            <SectionReveal delay={0.2}>
              <div>
                <div className="label-muted" style={{ marginBottom: 12 }}>{t('input.examples')}</div>
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

          {/* ── Sidebar: Live Hospital & Clinic Routing ── */}
          <SectionReveal delay={0.3} direction="left">
            <div className="card" style={{ padding: 22, minHeight: 520 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div className="label">Nearby Medical Facilities</div>
                {gpsTracking && (
                  <span style={{
                    fontFamily: FM, fontSize: 9, fontWeight: 700,
                    color: '#2E7D32', background: 'rgba(46,125,50,0.1)',
                    padding: '2px 7px', borderRadius: 20,
                    display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2E7D32', display: 'inline-block', animation: 'gpsPulse 1.2s ease-in-out infinite' }} />
                    LIVE GPS
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: '#6B7B8D', marginBottom: 14, fontFamily: FM, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {liveLocationText || `📍 ${selectedCity}`}
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: '#F5F3F0', padding: 4, borderRadius: 8 }}>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'hospital', label: '🏥 Hospitals' },
                  { id: 'clinic', label: '🩺 Clinics' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFacilityFilter(tab.id)}
                    style={{
                      flex: 1, padding: '6px 4px', border: 'none', borderRadius: 6, fontSize: 11, fontFamily: FM, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s',
                      background: facilityFilter === tab.id ? '#0B1F3D' : 'transparent',
                      color: facilityFilter === tab.id ? '#F5F3F0' : '#6B7B8D',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {isLocating ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(11,31,61,0.1)', borderTopColor: '#0B1F3D', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
                  <p style={{ fontSize: 13, color: '#6B7B8D' }}>Tracking live clinics & hospitals near you...</p>
                </div>
              ) : displayedFacilities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ fontSize: 13, color: '#6B7B8D' }}>No facilities found for this filter. Try selecting 'All'.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 580, overflowY: 'auto', paddingRight: 4 }}>
                  {displayedFacilities.slice(0, 7).map((h, i) => {
                    const isClinic = h.facility_type === 'clinic' || /clinic|dispensary|health centre|polyclinic/i.test(h.name)
                    const mapsUrl = h.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + ' ' + (h.area || selectedCity))}`

                    return (
                      <motion.div key={i}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        onClick={() => window.open(mapsUrl, '_blank')}
                        whileHover={{ scale: 1.01, backgroundColor: 'rgba(11,31,61,0.03)' }}
                        style={{
                          border: '1px solid rgba(11,31,61,0.06)',
                          borderRadius: 12, padding: 12, cursor: 'pointer', background: '#FFFFFF',
                          transition: 'all 0.2s', position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                          <span style={{
                            fontSize: 9, fontFamily: FM, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                            background: isClinic ? 'rgba(0,137,123,0.12)' : 'rgba(212,175,55,0.15)',
                            color: isClinic ? '#00695C' : '#B8962E',
                          }}>
                            {isClinic ? '🩺 Neighborhood Clinic' : '🏥 Major Hospital'}
                          </span>
                          <span style={{ fontSize: 10, fontFamily: FM, fontWeight: 700, color: '#1565C0' }}>
                            📍 {h.distance_km !== undefined ? `${Number(h.distance_km).toFixed(1)} km` : 'Near'}
                          </span>
                        </div>

                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0B1F3D', lineHeight: 1.25, marginBottom: 4 }}>
                          {h.name}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#6B7B8D' }}>
                          <span>{h.area || h.address || selectedCity}</span>
                          {h.rating && <span style={{ color: '#B8962E', fontWeight: 700, fontFamily: FM }}>★ {Number(h.rating).toFixed(1)}</span>}
                        </div>

                        <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(0,0,0,0.06)', paddingTop: 6 }}>
                          <span style={{ fontSize: 10, color: '#1976D2', fontFamily: FM, fontWeight: 700 }}>
                            🧭 Get Directions →
                          </span>
                          {h.emergency && (
                            <span style={{ fontSize: 9, color: '#C62828', fontWeight: 700, fontFamily: FM }}>🚨 24/7 ER</span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Google Maps Fallback Button */}
              {gmapsNearbyUrl && (
                <a
                  href={gmapsNearbyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    marginTop: 14, padding: '9px 16px',
                    background: 'rgba(25,118,210,0.06)',
                    border: '1px dashed rgba(25,118,210,0.3)',
                    borderRadius: 10, textDecoration: 'none',
                    fontFamily: FM, fontSize: 10, fontWeight: 700,
                    color: '#1565C0', letterSpacing: 0.3, transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(25,118,210,0.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(25,118,210,0.06)' }}
                >
                  🗺️ Search hospitals near me on Google Maps →
                </a>
              )}
            </div>
          </SectionReveal>

        </div>
      </div>

      <Footer />
    </div>
  )
}
