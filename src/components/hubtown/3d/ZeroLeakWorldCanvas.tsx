import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCanRun3D } from '@/hooks/useCanRun3D';
import { ThreeErrorBoundary } from '@/components/ThreeErrorBoundary';

// 1. The Luminescent Electric Blue Floating Cube (Hubtown Signature)
function GlowingHeroCube({ scrollProgress, pointer }: { scrollProgress: number; pointer: { x: number; y: number } }) {
  const cubeGroupRef = useRef<THREE.Group>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
  const wireframeMeshRef = useRef<THREE.LineSegments>(null);
  const innerLightRef = useRef<THREE.PointLight>(null);

  // Intricate tech-lines wireframe geometry
  const wireframeGeometry = useMemo(() => {
    const boxGeo = new THREE.BoxGeometry(2.4, 2.4, 2.4, 4, 4, 4);
    return new THREE.WireframeGeometry(boxGeo);
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    if (cubeGroupRef.current) {
      // Base gentle hovering & rotation
      const baseRotY = time * 0.25;
      const baseRotX = Math.sin(time * 0.4) * 0.08;
      
      // Pointer parallax tilt (tilts toward user cursor)
      const targetParallaxX = -pointer.y * 0.35;
      const targetParallaxY = pointer.x * 0.45;

      // Scroll-driven morphological rotation & translation
      const scrollRotX = scrollProgress * Math.PI * 1.5;
      const scrollRotY = scrollProgress * Math.PI * 2.0;
      const scrollPosY = Math.sin(time * 1.2) * 0.12 - scrollProgress * 1.8;
      const scrollPosZ = -scrollProgress * 2.5;

      cubeGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        cubeGroupRef.current.rotation.x,
        baseRotX + targetParallaxX + scrollRotX,
        delta * 3.5
      );
      cubeGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        cubeGroupRef.current.rotation.y,
        baseRotY + targetParallaxY + scrollRotY,
        delta * 3.5
      );
      cubeGroupRef.current.position.y = THREE.MathUtils.lerp(
        cubeGroupRef.current.position.y,
        0.85 + scrollPosY,
        delta * 4.0
      );
      cubeGroupRef.current.position.z = THREE.MathUtils.lerp(
        cubeGroupRef.current.position.z,
        scrollPosZ,
        delta * 3.5
      );
    }

    // Pulsate inner light intensity
    if (innerLightRef.current) {
      innerLightRef.current.intensity = 2.8 + Math.sin(time * 3.0) * 0.6;
    }
  });

  return (
    <group ref={cubeGroupRef} position={[0, 0.85, 0]}>
      {/* High-intensity internal point light casting glow outward */}
      <pointLight ref={innerLightRef} color="#00F5FF" intensity={3.2} distance={12} />

      {/* Solid Tech Cube with glowing electric blue/cyan material */}
      <mesh ref={coreMeshRef}>
        <boxGeometry args={[2.36, 2.36, 2.36]} />
        <meshStandardMaterial
          color="#04122e"
          emissive="#0088FF"
          emissiveIntensity={0.85}
          roughness={0.18}
          metalness={0.88}
        />
      </mesh>

      {/* Glowing Neon Cyan Wireframe Matrix Lines */}
      <lineSegments ref={wireframeMeshRef} geometry={wireframeGeometry}>
        <lineBasicMaterial color="#00F5FF" transparent opacity={0.85} linewidth={2} />
      </lineSegments>

      {/* Orbiting Tech Rings */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[3.2, 0.025, 16, 64]} />
        <meshStandardMaterial color="#00F5FF" emissive="#00F5FF" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

// 2. Dark Water / Reflective Terrain Surface (Hubtown Signature Ground)
function ReflectiveWaterSurface() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate gentle wavy terrain grid
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(50, 50, 40, 40);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Subtle undulation
      const z = Math.sin(x * 0.3) * Math.cos(y * 0.3) * 0.25;
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime * 0.6;
      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = Math.sin(x * 0.3 + time) * Math.cos(y * 0.3 + time) * 0.2;
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <group position={[0, -2.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Reflective Dark Ground Plane */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color="#020712"
          roughness={0.12}
          metalness={0.92}
        />
      </mesh>

      {/* Subtle Cyan Grid Overlay */}
      <gridHelper
        args={[50, 40, '#00F5FF', '#081a38']}
        position={[0, 0, 0.02]}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

// 3. Mountain Ridge Dunes on Left & Right Silhouettes (Hubtown Signature Horizon)
function MountainSilhouettes() {
  const leftRidge = useMemo(() => {
    const geo = new THREE.ConeGeometry(8, 6, 5);
    return geo;
  }, []);

  const rightRidge = useMemo(() => {
    const geo = new THREE.ConeGeometry(9, 7, 5);
    return geo;
  }, []);

  return (
    <group position={[0, -1.8, -4]}>
      {/* Left Mountain Silhouette */}
      <mesh geometry={leftRidge} position={[-11, 0, -2]} rotation={[0, 0.4, -0.05]}>
        <meshStandardMaterial color="#020610" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Right Mountain Silhouette with Blue Rim Highlight */}
      <mesh geometry={rightRidge} position={[12, 0.5, -3]} rotation={[0, -0.6, 0.05]}>
        <meshStandardMaterial color="#020610" roughness={0.8} metalness={0.2} />
      </mesh>
    </group>
  );
}

// 4. Atmospheric Drifting Dust Particles
function AtmosphericDust() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors, count } = useMemo(() => {
    const pCount = 320;
    const pos = new Float32Array(pCount * 3);
    const col = new Float32Array(pCount * 3);

    const cyan = new THREE.Color('#00F5FF');
    const blue = new THREE.Color('#3B82F6');
    const white = new THREE.Color('#D5E0FF');

    for (let i = 0; i < pCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 1;

      const pick = Math.random();
      const c = pick < 0.6 ? cyan : pick < 0.85 ? blue : white;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return { positions: pos, colors: col, count: pCount };
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.015;
      pointsRef.current.rotation.x += delta * 0.008;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

// 5. Camera Rig Tracking Scroll
function CameraController({ scrollProgress }: { scrollProgress: number }) {
  useFrame((state, delta) => {
    const targetZ = 7.2 - scrollProgress * 1.5;
    const targetY = -scrollProgress * 0.5;
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, delta * 3.0);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, delta * 3.0);
  });
  return null;
}

// 6. High-Fidelity 2D/CSS Fallback when WebGL is unavailable
const StaticWorldFallback: React.FC = () => (
  <div
    role="img"
    aria-label="ZeroLeak AI Monolith Visual"
    className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden bg-[#020A19]"
  >
    {/* Dark Reflective Horizon Gradient */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#01050F] via-[#020A19] to-[#04122E] opacity-90" />
    
    {/* Mountain Dune Silhouettes */}
    <div className="absolute bottom-0 left-0 w-1/2 h-72 bg-[#020712] rounded-tr-[100%] opacity-80 blur-sm" />
    <div className="absolute bottom-0 right-0 w-1/2 h-80 bg-[#020712] rounded-tl-[100%] opacity-80 blur-sm" />

    {/* Glowing Blue Cube Fallback positioned in upper-center */}
    <div className="relative flex flex-col items-center justify-center -mt-36 mb-12">
      <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl border-2 border-[#00F5FF]/80 bg-[#00F5FF]/10 shadow-[0_0_80px_rgba(0,245,255,0.45)] backdrop-blur-md rotate-12 flex items-center justify-center">
        <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl border border-[#00F5FF]/60 bg-[#020A19]/80 flex items-center justify-center -rotate-6">
          <span className="font-mono text-[11px] font-bold tracking-widest text-[#00F5FF]">ZEROLEAK CUBE</span>
        </div>
      </div>
      {/* Reflection under the cube */}
      <div className="w-56 h-7 mt-5 bg-[#00F5FF]/20 rounded-full blur-xl" />
    </div>
  </div>
);

export const ZeroLeakWorldCanvas: React.FC = () => {
  const canRun3D = useCanRun3D();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        setScrollProgress(Math.min(1, Math.max(0, window.scrollY / maxScroll)));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize pointer coordinates -1 to +1
      setPointer({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!canRun3D) {
    return <StaticWorldFallback />;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 select-none overflow-hidden bg-[#020A19]">
      <ThreeErrorBoundary fallback={<StaticWorldFallback />}>
        <Canvas
          camera={{ position: [0, 0, 7.2], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
        >
          {/* Native Lights Only - Zero CDN Fetching */}
          <ambientLight intensity={0.65} />
          
          {/* Main Electric Cyan Key Light */}
          <directionalLight position={[6, 8, 5]} intensity={2.2} color="#00F5FF" />
          
          {/* Deep Blue Fill Light */}
          <directionalLight position={[-6, -4, -4]} intensity={1.5} color="#3B82F6" />
          
          {/* Front Specular Point Light */}
          <pointLight position={[0, 1, 4.5]} intensity={2.0} color="#00F5FF" distance={14} />

          <CameraController scrollProgress={scrollProgress} />
          <AtmosphericDust />
          <MountainSilhouettes />
          <ReflectiveWaterSurface />
          <GlowingHeroCube scrollProgress={scrollProgress} pointer={pointer} />
        </Canvas>
      </ThreeErrorBoundary>
    </div>
  );
};

export default ZeroLeakWorldCanvas;