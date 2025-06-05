import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

interface TruthOrbProps {
  truthScore: number;
  size?: number;
  className?: string;
}

function AnimatedOrb({ truthScore }: { truthScore: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const orbColor = useMemo(() => {
    // Color based on truth score (0-100)
    const ratio = Math.min(truthScore / 100, 1);
    if (ratio < 0.3) return '#ef4444'; // Red for low scores
    if (ratio < 0.7) return '#f59e0b'; // Orange for medium scores
    return '#10b981'; // Green for high scores
  }, [truthScore]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color={orbColor}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
      
      {/* Glowing ring around the orb */}
      <mesh>
        <ringGeometry args={[1.2, 1.3, 32]} />
        <meshBasicMaterial 
          color={orbColor} 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Float>
  );
}

export function TruthOrb({ truthScore, size = 120, className = '' }: TruthOrbProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        className="rounded-full"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        <AnimatedOrb truthScore={truthScore} />
      </Canvas>
      
      {/* Score overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white font-bold text-lg">
            {truthScore.toFixed(1)}
          </div>
          <div className="text-white/70 text-xs font-medium">
            TRUTH
          </div>
        </div>
      </div>
    </div>
  );
} 