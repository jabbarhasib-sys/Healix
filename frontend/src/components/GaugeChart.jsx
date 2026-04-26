import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

export default function GaugeChart({
  value = 0,
  size = 140,
  strokeWidth = 8,
  label = 'Confidence',
  color,
  className = '',
}) {
  const ref = useRef()
  const [animated, setAnimated] = useState(false)
  const [displayVal, setDisplayVal] = useState(0)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const target = circumference * (1 - value / 100)

  // professional color scale: green / amber / red
  const autoColor = value >= 80 ? '#2E7D32' : value >= 50 ? '#E65100' : '#C62828'
  const strokeColor = color || autoColor

  const animateValue = useCallback(() => {
    const start = performance.now()
    const dur = 1600
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplayVal(value * eased)
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])

  useEffect(() => {
    if (animated) return
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true)
          animateValue()
          obs.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [animated, animateValue])

  return (
    <div ref={ref} className={className}
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="rgba(11,31,61,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Animated arc */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={animated ? { strokeDashoffset: target } : {}}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        {/* Center number — Times New Roman */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: F,
            fontSize: size * 0.22,
            fontWeight: 700,
            color: '#0B1F3D',
            lineHeight: 1,
          }}>
            {displayVal.toFixed(1)}
          </span>
          <span style={{
            fontFamily: FM,
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: 'rgba(11,31,61,0.35)',
            marginTop: 4,
          }}>
            {label}
          </span>
        </div>
      </div>
    </div>
  )
}
