import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// 3D Rotating Privacy Core
function CoreMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.4;
      meshRef.current.rotation.y += delta * 0.5;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.x -= delta * 0.3;
      wireframeRef.current.rotation.y -= delta * 0.35;
    }
  });

  return (
    <group>
      {/* Inner faceted privacy crystal */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.3, 0]} />
        <meshStandardMaterial
          color="#FF9933"
          emissive="#FF9933"
          emissiveIntensity={0.25}
          roughness={0.2}
          metalness={0.8}
          wireframe={false}
        />
      </mesh>

      {/* Outer neon wireframe cage */}
      <mesh ref={wireframeRef}>
        <dodecahedronGeometry args={[1.7, 0]} />
        <meshStandardMaterial
          color="#00F5FF"
          emissive="#00F5FF"
          emissiveIntensity={0.6}
          wireframe
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

// Orbiting Ring Shield
function OrbitingRings() {
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.5;
      ring1Ref.current.rotation.x += delta * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.4;
      ring2Ref.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <>
      {/* Saffron Orbit Ring */}
      <group ref={ring1Ref}>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[2.2, 0.035, 16, 64]} />
          <meshStandardMaterial
            color="#FF9933"
            emissive="#FF9933"
            emissiveIntensity={0.5}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* India Green Orbit Ring */}
      <group ref={ring2Ref}>
        <mesh rotation={[-Math.PI / 4, 0, 0]}>
          <torusGeometry args={[2.5, 0.035, 16, 64]} />
          <meshStandardMaterial
            color="#138808"
            emissive="#138808"
            emissiveIntensity={0.5}
            roughness={0.3}
          />
        </mesh>
      </group>
    </>
  );
}

// Scene wrapper with plain lights (NO CDN / NO Environment preset)
export const PrivacyOrbScene: React.FC = () => {
  return (
    <div
      className="w-full h-full min-h-[220px] max-w-[320px] max-h-[320px] mx-auto relative flex items-center justify-center select-none"
      aria-label="Interactive 3D Privacy Gateway Vault"
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Plain lights only - NO external CDN asset fetches */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 8, 5]} intensity={1.8} color="#FF9933" />
        <directionalLight position={[-6, -8, -4]} intensity={1.4} color="#138808" />
        <pointLight position={[0, 0, 4]} intensity={2.2} color="#00F5FF" distance={12} />

        {/* Floating smooth motion */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
          <CoreMesh />
          <OrbitingRings />
        </Float>
      </Canvas>
    </div>
  );
};

export default PrivacyOrbScene;
