import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'

const F  = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

const STEPS = [
  {
    icon: '🩺',
    step: 1,
    title: 'Describe Your Symptoms',
    desc: 'Type in how you feel — pain, duration, severity. The more detail, the better the analysis.',
    highlight: 'Enter your symptoms',
  },
  {
    icon: '🧠',
    step: 2,
    title: 'Get Your AI Diagnosis',
    desc: 'Healix runs a 6-stage clinical pipeline — parsing, reasoning, risk scoring — in seconds.',
    highlight: 'Get your diagnosis',
  },
  {
    icon: '🏥',
    step: 3,
    title: 'Find a Hospital Near You',
    desc: 'Select your city and instantly see real, specialty-matched hospitals you can navigate to.',
    highlight: 'Find a hospital near you',
  },
]

export default function OnboardingTutorial({ onDone }) {
  const [step, setStep] = useState(0)

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else onDone()
  }, [step, onDone])

  const handleSkip = useCallback(() => onDone(), [onDone])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext()
      if (e.key === 'Escape') handleSkip()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleNext, handleSkip])

  const cur = STEPS[step]

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(11,31,61,0.72)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Onboarding step ${step + 1} of ${STEPS.length}: ${cur.title}`}
      >
        {/* Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 32, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: '#FFFFFF', borderRadius: 24, padding: '48px 44px',
            maxWidth: 480, width: '100%', textAlign: 'center',
            boxShadow: '0 32px 80px rgba(11,31,61,0.35)',
            position: 'relative',
          }}
        >
          {/* Skip */}
          <button
            onClick={handleSkip}
            aria-label="Skip tutorial"
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: FM, fontSize: 11, color: '#8A97A6', fontWeight: 600, letterSpacing: 0.5,
            }}
          >
            SKIP ✕
          </button>

          {/* Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 260 }}
            style={{ fontSize: 56, marginBottom: 20 }}
            aria-hidden="true"
          >
            {cur.icon}
          </motion.div>

          {/* Step badge */}
          <div style={{
            display: 'inline-block', fontFamily: FM, fontSize: 10,
            color: '#D4AF37', background: 'rgba(212,175,55,0.1)',
            padding: '3px 12px', borderRadius: 20, marginBottom: 14, fontWeight: 700, letterSpacing: 1,
          }}>
            STEP {cur.step} OF {STEPS.length}
          </div>

          {/* Title */}
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0B1F3D', fontFamily: F, marginBottom: 14, lineHeight: 1.2 }}>
            {cur.title}
          </h2>

          {/* Description */}
          <p style={{ fontSize: 15, color: '#6B7B8D', fontFamily: F, lineHeight: 1.75, marginBottom: 36 }}>
            {cur.desc}
          </p>

          {/* Dot progress */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }} aria-label="Progress">
            {STEPS.map((_, i) => (
              <motion.div
                key={i}
                animate={{ width: i === step ? 24 : 8, background: i === step ? '#0B1F3D' : i < step ? '#D4AF37' : 'rgba(11,31,61,0.12)' }}
                transition={{ duration: 0.3 }}
                style={{ height: 8, borderRadius: 4 }}
                aria-current={i === step ? 'step' : undefined}
              />
            ))}
          </div>

          {/* CTA */}
          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary"
            style={{ width: '100%', padding: '15px 32px', fontSize: 16 }}
          >
            {step < STEPS.length - 1 ? 'Next →' : "Let's Begin →"}
          </motion.button>

          {/* Keyboard hint */}
          <p style={{ fontFamily: FM, fontSize: 10, color: 'rgba(11,31,61,0.25)', marginTop: 16 }}>
            Press → to advance · ESC to skip
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
