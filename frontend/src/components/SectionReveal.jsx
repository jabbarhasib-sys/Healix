import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function SectionReveal({
  children,
  delay = 0,
  direction = 'up', // up, left, right, scale
  duration = 0.75,
  className = '',
  style = {},
  once = true,
  threshold = 0.15,
}) {
  const ref = useRef()
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) obs.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [once, threshold])

  const variants = {
    up:    { hidden: { opacity: 0, y: 36 },  visible: { opacity: 1, y: 0 } },
    left:  { hidden: { opacity: 0, x: -36 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: 36 },  visible: { opacity: 1, x: 0 } },
    scale: { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 } },
  }

  const v = variants[direction] || variants.up

  return (
    <motion.div
      ref={ref}
      initial={v.hidden}
      animate={inView ? v.visible : v.hidden}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}
