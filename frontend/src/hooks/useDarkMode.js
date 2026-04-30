import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('healix-dark-mode') === 'true' } catch { return false }
  })

  // Wrapped toggler — fires a cinematic transition class before switching
  const toggleDark = (val) => {
    const next = typeof val === 'function' ? val(dark) : val

    // Flash overlay: adds .dark-flash, removed after animation completes
    const flash = document.createElement('div')
    flash.id = 'healix-dark-flash'
    flash.style.cssText = `
      position:fixed; inset:0; z-index:99999; pointer-events:none;
      background: ${next ? '#D4AF37' : '#0B1F3D'};
      opacity:0; animation: healixFlash 0.55s cubic-bezier(0.4,0,0.2,1) forwards;
    `
    document.body.appendChild(flash)
    setTimeout(() => flash.remove(), 580)

    // Smooth element transitions
    document.documentElement.classList.add('dark-transitioning')
    setTimeout(() => document.documentElement.classList.remove('dark-transitioning'), 700)

    setDark(next)
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try { localStorage.setItem('healix-dark-mode', dark) } catch {}
  }, [dark])

  return [dark, toggleDark]
}
