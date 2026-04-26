import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

const Landing           = lazy(() => import('./screens/Landing'))
const InputScreen       = lazy(() => import('./screens/InputScreen'))
const Processing        = lazy(() => import('./screens/ProcessingScreen'))
const Dashboard         = lazy(() => import('./screens/Dashboard'))
const HospitalMatches   = lazy(() => import('./screens/HospitalMatches'))
const CostTransparency  = lazy(() => import('./screens/CostTransparency'))
const Welcome           = lazy(() => import('./screens/Welcome'))
const About             = lazy(() => import('./screens/About'))
const Support           = lazy(() => import('./screens/Support'))
const HowItWorks        = lazy(() => import('./screens/HowItWorks'))
const AITechnology      = lazy(() => import('./screens/AITechnology'))
const WhyHealix         = lazy(() => import('./screens/WhyHealix'))
const SecurityCompliance = lazy(() => import('./screens/SecurityCompliance'))
const ImpactResults     = lazy(() => import('./screens/ImpactResults'))

function Loader() {
  return (
    <div style={{
      height: '100vh', width: '100vw',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F5F3F0',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '2px solid rgba(11,31,61,0.08)',
          borderTopColor: '#0B1F3D',
          animation: 'spin 0.7s linear infinite',
        }} />
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10, letterSpacing: 2, color: 'rgba(11,31,61,0.3)',
        }}>LOADING</span>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  return (
    <Suspense fallback={<Loader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"                element={<Landing />} />
          <Route path="/input"           element={<InputScreen />} />
          <Route path="/processing"      element={<Processing />} />
          <Route path="/dashboard"       element={<Dashboard />} />
          <Route path="/intelligence"    element={<Dashboard />} />
          <Route path="/hospital-matches" element={<HospitalMatches />} />
          <Route path="/cost-analysis"   element={<CostTransparency />} />
          <Route path="/welcome"         element={<Welcome />} />
          <Route path="/about"           element={<About />} />
          <Route path="/support"         element={<Support />} />
          <Route path="/how-it-works"    element={<HowItWorks />} />
          <Route path="/technology"      element={<AITechnology />} />
          <Route path="/why-healix"      element={<WhyHealix />} />
          <Route path="/security"        element={<SecurityCompliance />} />
          <Route path="/impact"          element={<ImpactResults />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}
