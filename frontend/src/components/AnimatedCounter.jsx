import { useRef, useEffect, useState, useCallback } from 'react'

export default function AnimatedCounter({
  end,
  duration = 1800,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  style = {},
}) {
  const ref = useRef()
  const [value, setValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  const animate = useCallback(() => {
    const start = 0
    const startTime = performance.now()
    const step = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(start + (end - start) * eased)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [end, duration])

  useEffect(() => {
    if (hasAnimated) return
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true)
          animate()
          obs.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasAnimated, animate])

  return (
    <span ref={ref} className={`stat-number ${className}`} style={style}>
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  )
}
