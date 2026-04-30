import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Environment } from '@react-three/drei'
import * as THREE from 'three'

export function MetallicDNA({ isVertical = false, color = '#E2E8F0' }) {
  const group = useRef()
  
  // Make it much longer and larger to cover the landscape screen
  const numPairs = 24
  const radius = 3.5
  const height = 40
  
  // Generate continuous strands and nodes
  const { curve1, curve2, innerCurve1, innerCurve2, nodes } = useMemo(() => {
    const points1 = []
    const points2 = []
    const innerPoints1 = []
    const innerPoints2 = []
    const nodesArr = []
    
    const steps = numPairs * 2
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const angle = t * Math.PI * 4 // 2 full turns
      const y = (t - 0.5) * height
      
      const x1 = Math.cos(angle) * radius
      const z1 = Math.sin(angle) * radius
      points1.push(new THREE.Vector3(x1, y, z1))
      
      const x2 = Math.cos(angle + Math.PI) * radius
      const z2 = Math.sin(angle + Math.PI) * radius
      points2.push(new THREE.Vector3(x2, y, z2))
      
      // Inner helix
      const innerRadius = radius * 0.4
      const innerAngle = angle - Math.PI / 4 // Offset phase slightly
      
      const ix1 = Math.cos(innerAngle) * innerRadius
      const iz1 = Math.sin(innerAngle) * innerRadius
      innerPoints1.push(new THREE.Vector3(ix1, y, iz1))
      
      const ix2 = Math.cos(innerAngle + Math.PI) * innerRadius
      const iz2 = Math.sin(innerAngle + Math.PI) * innerRadius
      innerPoints2.push(new THREE.Vector3(ix2, y, iz2))

      // Random circuit nodes along the backbone
      if (i % 3 === 0 && i !== 0 && i !== steps) {
         nodesArr.push({ pos: new THREE.Vector3(x1, y, z1), type: Math.random() > 0.4 ? 'ring' : 'solid', rot: [Math.random(), Math.random(), 0] })
         nodesArr.push({ pos: new THREE.Vector3(x2, y, z2), type: Math.random() > 0.4 ? 'ring' : 'solid', rot: [Math.random(), Math.random(), 0] })
      }
    }
    
    return {
      curve1: new THREE.CatmullRomCurve3(points1),
      curve2: new THREE.CatmullRomCurve3(points2),
      innerCurve1: new THREE.CatmullRomCurve3(innerPoints1),
      innerCurve2: new THREE.CatmullRomCurve3(innerPoints2),
      nodes: nodesArr
    }
  }, [numPairs, radius, height])

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  const materialProps = {
    color: color,
    metalness: 1,
    roughness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.5
  }

  return (
    <group ref={group} rotation={[0, 0, isVertical ? 0 : Math.PI / 2]}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        
        {/* Backbone 1 */}
        <mesh>
          <tubeGeometry args={[curve1, 64, 0.3, 16, false]} />
          <meshPhysicalMaterial attach="material" {...materialProps} />
        </mesh>
        
        {/* Backbone 2 */}
        <mesh>
          <tubeGeometry args={[curve2, 64, 0.3, 16, false]} />
          <meshPhysicalMaterial attach="material" {...materialProps} />
        </mesh>

        {/* Inner Helix 1 */}
        <mesh>
          <tubeGeometry args={[innerCurve1, 64, 0.12, 12, false]} />
          <meshPhysicalMaterial attach="material" {...materialProps} />
        </mesh>
        
        {/* Inner Helix 2 */}
        <mesh>
          <tubeGeometry args={[innerCurve2, 64, 0.12, 12, false]} />
          <meshPhysicalMaterial attach="material" {...materialProps} />
        </mesh>

        {/* Circuit Nodes */}
        {nodes.map((n, i) => (
          <mesh key={`node-${i}`} position={n.pos} rotation={n.rot}>
            {n.type === 'ring' ? (
              <torusGeometry args={[0.5, 0.15, 16, 32]} />
            ) : (
              <cylinderGeometry args={[0.6, 0.6, 0.2, 32]} />
            )}
            <meshPhysicalMaterial attach="material" {...materialProps} />
          </mesh>
        ))}

      </Float>
    </group>
  )
}

export function MiniDNA({ color = '#1976D2' }) {
  return (
    <div style={{ width: 44, height: 44, pointerEvents: 'none' }}>
      <Canvas gl={{ alpha: true, antialias: true }} camera={{ position: [0, 0, 15], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 20, 10]} intensity={2} color="#ffffff" />
          <directionalLight position={[-10, -10, -10]} intensity={1} color="#a0c0ff" />
          <Environment preset="studio" />
          <group scale={0.4}>
            <MetallicDNA isVertical={true} color={color} />
          </group>
        </Suspense>
      </Canvas>
    </div>
  )
}


export default function DNA3D() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}>
      <Canvas gl={{ alpha: true, antialias: true }} camera={{ position: [0, 0, 22], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 20, 10]} intensity={2} color="#ffffff" />
          <directionalLight position={[-10, -10, -10]} intensity={1} color="#a0c0ff" />
          <Environment preset="studio" />
          <MetallicDNA />
        </Suspense>
      </Canvas>
    </div>
  )
}
