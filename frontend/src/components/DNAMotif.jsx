import React from 'react';

/**
 * DNAMotif - A decorative SVG DNA helix designed to fill whitespace.
 * 
 * @param {string} color - Stroke color of the DNA strands and base pairs.
 * @param {number} opacity - Transparency of the motif.
 * @param {string|number} height - Height of the SVG element.
 */
export default function DNAMotif({ color = "#0B1F3D", opacity = 0.08, height = "100%" }) {
  return (
    <div style={{ height, width: '120px', pointerEvents: 'none' }}>
      <svg 
        width="100%" height="100%" viewBox="0 0 100 800" 
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity, animation: 'dna-float 20s ease-in-out infinite' }}
        role="presentation" aria-hidden="true"
      >
        <style>{`
          @keyframes dna-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
        <defs>
          <linearGradient id="dnaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="20%" stopColor={color} stopOpacity="1" />
            <stop offset="80%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Helical Strand 1 */}
        <path 
          d="M50 0 Q 90 100 50 200 T 50 400 T 50 600 T 50 800" 
          fill="none" 
          stroke="url(#dnaGradient)" 
          strokeWidth="2" 
        />
        
        {/* Helical Strand 2 */}
        <path 
          d="M50 0 Q 10 100 50 200 T 50 400 T 50 600 T 50 800" 
          fill="none" 
          stroke="url(#dnaGradient)" 
          strokeWidth="2" 
        />

        {/* Base Pairs (Decorative rungs) */}
        {[...Array(16)].map((_, i) => {
          const y = i * 50 + 25;
          const xOffset = Math.sin((y / 800) * Math.PI * 8) * 30;
          return (
            <line 
              key={i} 
              x1={50 - xOffset} y1={y} 
              x2={50 + xOffset} y2={y} 
              stroke={color} 
              strokeWidth="0.5" 
              strokeDasharray="1,3" 
            />
          );
        })}

        {/* Aesthetic "Nodes" at junctions */}
        {[...Array(9)].map((_, i) => (
          <circle 
            key={`node-${i}`} 
            cx="50" cy={i * 100} 
            r="1.5" 
            fill={color} 
          />
        ))}
      </svg>
    </div>
  );
}
