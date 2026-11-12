import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { createMosaicTexture, createSampleCardTexture } from './textureUtils';
import { useCanRun3D } from '@/hooks/useCanRun3D';

interface CinematicSceneProps {
  scrollProgress: number; // 0 to 1
  pointer: { x: number; y: number };
  isMotionOn: boolean;
}

// -------------------------------------------------------------
// STATION 01: GATEWAY (Luminescent Glass Cube + Ripple Water + Orbiting Cards)
// -------------------------------------------------------------
function GatewayStation({
  opacity,
  pointer,
  isMotionOn,
}: {
  opacity: number;
  pointer: { x: number; y: number };
  isMotionOn: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const cubeMeshRef = useRef<THREE.Mesh>(null);
  const waterMeshRef = useRef<THREE.Mesh>(null);
  const orbitGroupRef = useRef<THREE.Group>(null);

  // Procedural mosaic texture
  const mosaicTexture = useMemo(() => createMosaicTexture(), []);

  // 4 Orbiting Sample Card Textures
  const cardTextures = useMemo(
    () => [
      createSampleCardTexture(0),
      createSampleCardTexture(1),
      createSampleCardTexture(2),
      createSampleCardTexture(3),
    ],
    []
  );

  // Clean memory on unmount
  useEffect(() => {
    return () => {
      mosaicTexture.dispose();
      cardTextures.forEach((t) => t.dispose());
    };
  }, [mosaicTexture, cardTextures]);

  // Ripple Water Geometry
  const waterGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(60, 60, 48, 48);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = Math.sin(x * 0.25) * Math.cos(y * 0.25) * 0.3;
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (!isMotionOn) return;
    const time = state.clock.elapsedTime;

    // Cube rotation & mouse parallax tilt
    if (cubeMeshRef.current) {
      cubeMeshRef.current.rotation.y += delta * 0.3;
      cubeMeshRef.current.rotation.x = THREE.MathUtils.lerp(
        cubeMeshRef.current.rotation.x,
        -pointer.y * 0.35 + Math.sin(time * 0.8) * 0.08,
        delta * 3.0
      );
      cubeMeshRef.current.rotation.z = THREE.MathUtils.lerp(
        cubeMeshRef.current.rotation.z,
        pointer.x * 0.35,
        delta * 3.0
      );
    }

    // Ripple water animation
    if (waterMeshRef.current) {
      const pos = waterGeometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = Math.sin(x * 0.25 + time * 1.2) * Math.cos(y * 0.25 + time * 0.8) * 0.25;
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;
    }

    // Orbiting cards
    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.y = time * 0.4;
    }
  });

  if (opacity <= 0.01) return null;

  return (
    <group ref={groupRef} visible={opacity > 0.01}>
      {/* Central Subdivided Glass Mosaic Cube */}
      <group position={[0, 0.85, 0]}>
        <mesh ref={cubeMeshRef}>
          <boxGeometry args={[2.3, 2.3, 2.3, 4, 4, 4]} />
          <meshStandardMaterial
            map={mosaicTexture}
            emissiveMap={mosaicTexture}
            emissive="#0088FF"
            emissiveIntensity={1.2 * opacity}
            roughness={0.12}
            metalness={0.9}
            transparent
            opacity={opacity}
          />
        </mesh>

        {/* Outer glowing wireframe frame */}
        <mesh>
          <boxGeometry args={[2.35, 2.35, 2.35]} />
          <meshBasicMaterial
            color="#37d3fc"
            wireframe
            transparent
            opacity={0.6 * opacity}
          />
        </mesh>
      </group>

      {/* Orbiting Sample Card Outlines (Fictional, "SAMPLE ONLY") */}
      <group ref={orbitGroupRef} position={[0, 0.85, 0]}>
        {[0, 1, 2, 3].map((idx) => {
          const angle = (idx * Math.PI) / 2;
          const radius = 3.6;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          return (
            <mesh key={idx} position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
              <planeGeometry args={[1.5, 0.95]} />
              <meshBasicMaterial
                map={cardTextures[idx]}
                transparent
                opacity={0.85 * opacity}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>

      {/* Ripple Water Plane */}
      <mesh
        ref={waterMeshRef}
        geometry={waterGeometry}
        position={[0, -2.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color="#030816"
          roughness={0.1}
          metalness={0.95}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Low-Poly Mountain Silhouettes with Cyan Rim Light */}
      <group position={[0, -1.9, -6]}>
        <mesh position={[-14, 0, 0]} rotation={[0, 0.3, -0.05]}>
          <coneGeometry args={[10, 7, 5]} />
          <meshStandardMaterial color="#020612" roughness={0.9} transparent opacity={opacity} />
        </mesh>
        <mesh position={[14, 0.5, 0]} rotation={[0, -0.4, 0.05]}>
          <coneGeometry args={[11, 8, 5]} />
          <meshStandardMaterial color="#020612" roughness={0.9} transparent opacity={opacity} />
        </mesh>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// STATION 02: DETECT (Glowing Ribbon Tube Spline + Gliding Cards)
// -------------------------------------------------------------
function DetectStation({ opacity, isMotionOn }: { opacity: number; isMotionOn: boolean }) {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-10, -1.5, -8),
      new THREE.Vector3(-5, 0.5, -3),
      new THREE.Vector3(0, -0.2, 1),
      new THREE.Vector3(5, 1.2, -2),
      new THREE.Vector3(10, -1.0, -7),
    ]);
  }, []);

  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 70, 0.12, 12, false), [curve]);
  const cardTexture = useMemo(() => createSampleCardTexture(0), []);

  const cardRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!isMotionOn || !cardRef.current) return;
    const t = (state.clock.elapsedTime * 0.15) % 1;
    const point = curve.getPointAt(t);
    cardRef.current.position.copy(point);
    const tangent = curve.getTangentAt(t);
    cardRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
  });

  if (opacity <= 0.01) return null;

  return (
    <group visible={opacity > 0.01}>
      {/* Glowing Ribbon Spline */}
      <mesh geometry={tubeGeo}>
        <meshBasicMaterial color="#37d3fc" transparent opacity={0.9 * opacity} />
      </mesh>

      {/* Flanking Dark Rocks */}
      <mesh position={[-4, -0.8, -3]} rotation={[0.4, 0.5, 0]}>
        <dodecahedronGeometry args={[2.5, 0]} />
        <meshStandardMaterial color="#040a1c" roughness={0.8} transparent opacity={opacity} />
      </mesh>
      <mesh position={[4, -0.6, -2]} rotation={[-0.2, -0.6, 0]}>
        <dodecahedronGeometry args={[2.8, 0]} />
        <meshStandardMaterial color="#040a1c" roughness={0.8} transparent opacity={opacity} />
      </mesh>

      {/* Traveling ID Card outline along ribbon */}
      <mesh ref={cardRef}>
        <planeGeometry args={[1.3, 0.8]} />
        <meshBasicMaterial map={cardTexture} transparent opacity={0.9 * opacity} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// STATION 03: MASK (Field of 300 Glowing Flickering Instanced Cubes)
// -------------------------------------------------------------
function MaskStation({ opacity, isMotionOn }: { opacity: number; isMotionOn: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 300;

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Compute terrain grid positions for 300 cubes
  const transforms = useMemo(() => {
    const list: { pos: [number, number, number]; rot: [number, number, number]; scale: number }[] = [];
    const rows = 20;
    const cols = 15;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - cols / 2) * 1.4 + (Math.random() - 0.5) * 0.5;
        const z = (r - rows / 2) * 1.4 - 4;
        const y = Math.sin(x * 0.4) * Math.cos(z * 0.4) * 1.2 - 1.2;
        list.push({
          pos: [x, y, z],
          rot: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
          scale: 0.22 + Math.random() * 0.15,
        });
      }
    }
    return list;
  }, []);

  useFrame((state) => {
    if (!meshRef.current || opacity <= 0.01) return;
    const time = state.clock.elapsedTime;

    transforms.forEach((t, i) => {
      dummy.position.set(...t.pos);
      if (isMotionOn) {
        dummy.rotation.set(t.rot[0] + time * 0.2, t.rot[1] + time * 0.3, 0);
      } else {
        dummy.rotation.set(...t.rot);
      }
      const flicker = isMotionOn ? 1 + Math.sin(time * 4 + i) * 0.25 : 1;
      dummy.scale.setScalar(t.scale * flicker);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (opacity <= 0.01) return null;

  return (
    <group visible={opacity > 0.01}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#061a38"
          emissive="#37d3fc"
          emissiveIntensity={1.4 * opacity}
          roughness={0.2}
          transparent
          opacity={opacity}
        />
      </instancedMesh>
    </group>
  );
}

// -------------------------------------------------------------
// STATION 04: FORWARD (Light Streams Curving Toward Horizon)
// -------------------------------------------------------------
function ForwardStation({ opacity, isMotionOn }: { opacity: number; isMotionOn: boolean }) {
  const streamRef = useRef<THREE.Group>(null);

  const streams = useMemo(() => {
    return [0, 1, 2, 3, 4].map((i) => {
      const spread = (i - 2) * 3.5;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(spread * 0.2, -1.8, 3),
        new THREE.Vector3(spread * 0.6, -0.5, -2),
        new THREE.Vector3(spread * 1.5, 0.8, -12),
        new THREE.Vector3(spread * 3.0, 2.5, -24),
      ]);
      return new THREE.TubeGeometry(curve, 60, 0.08, 8, false);
    });
  }, []);

  useFrame((_, delta) => {
    if (!isMotionOn || !streamRef.current) return;
    streamRef.current.rotation.z += delta * 0.1;
  });

  if (opacity <= 0.01) return null;

  return (
    <group ref={streamRef} visible={opacity > 0.01}>
      {streams.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshBasicMaterial color="#37d3fc" transparent opacity={0.8 * opacity} />
        </mesh>
      ))}
    </group>
  );
}

// -------------------------------------------------------------
// STATION 05: REINSERT (Curving Streams Converging into Core)
// -------------------------------------------------------------
function ReinsertStation({ opacity, isMotionOn }: { opacity: number; isMotionOn: boolean }) {
  const convergeRef = useRef<THREE.Group>(null);

  const streams = useMemo(() => {
    return [0, 1, 2, 3, 4].map((i) => {
      const spread = (i - 2) * 4.0;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(spread * 2.5, 2.0, -18),
        new THREE.Vector3(spread * 1.2, 0.4, -8),
        new THREE.Vector3(spread * 0.4, -0.2, -2),
        new THREE.Vector3(0, 0.85, 0),
      ]);
      return new THREE.TubeGeometry(curve, 60, 0.09, 8, false);
    });
  }, []);

  useFrame((_, delta) => {
    if (!isMotionOn || !convergeRef.current) return;
    convergeRef.current.rotation.z -= delta * 0.12;
  });

  if (opacity <= 0.01) return null;

  return (
    <group ref={convergeRef} visible={opacity > 0.01}>
      {streams.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshBasicMaterial color="#00FFD1" transparent opacity={0.85 * opacity} />
        </mesh>
      ))}

      {/* Reinserted Core Glow */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[1.2, 24, 24]} />
        <meshStandardMaterial
          color="#050a1c"
          emissive="#00FFD1"
          emissiveIntensity={1.8 * opacity}
          transparent
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// STATION 06: PROOF (Network of Nodes Over Blue Dune)
// -------------------------------------------------------------
function ProofStation({ opacity, isMotionOn }: { opacity: number; isMotionOn: boolean }) {
  const nodeCount = 28;

  const { nodePositions, lineGeo } = useMemo(() => {
    const pos: [number, number, number][] = [];
    const points: THREE.Vector3[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 14;
      const z = (Math.random() - 0.5) * 10 - 2;
      const y = Math.sin(x * 0.3) * 0.8 + 0.2;
      pos.push([x, y, z]);
    }

    // Connect close neighbors with lines
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const v1 = new THREE.Vector3(...pos[i]);
        const v2 = new THREE.Vector3(...pos[j]);
        if (v1.distanceTo(v2) < 4.0) {
          points.push(v1, v2);
        }
      }
    }

    const lGeo = new THREE.BufferGeometry().setFromPoints(points);
    return { nodePositions: pos, lineGeo: lGeo };
  }, []);

  if (opacity <= 0.01) return null;

  return (
    <group visible={opacity > 0.01}>
      {/* Dynamic Network Connecting Lines */}
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color="#37d3fc" transparent opacity={0.45 * opacity} />
      </lineSegments>

      {/* Network Nodes (Spheres) */}
      {nodePositions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color="#d5ddfd" transparent opacity={0.9 * opacity} />
        </mesh>
      ))}

      {/* Blue Dune Ground */}
      <mesh position={[0, -2.0, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#041433" roughness={0.3} metalness={0.7} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// ATMOSPHERIC DUST (800 Twinkling Particles)
// -------------------------------------------------------------
function AtmosphericDust({ isMotionOn }: { isMotionOn: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 800;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const cyan = new THREE.Color('#37d3fc');
    const lavender = new THREE.Color('#d5ddfd');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 36;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 24 - 2;

      const c = Math.random() > 0.4 ? cyan : lavender;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame((_, delta) => {
    if (!isMotionOn || !pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.02;
    pointsRef.current.rotation.x += delta * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.07} vertexColors transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

// -------------------------------------------------------------
// CAMERA CONTROLLER: Moves between 6 stations as user scrolls
// -------------------------------------------------------------
function CameraRig({
  scrollProgress,
  pointer,
  isMotionOn,
}: {
  scrollProgress: number;
  pointer: { x: number; y: number };
  isMotionOn: boolean;
}) {
  useFrame((state, delta) => {
    // 6 Spatial stations across 0 to 1
    // Station 0: z=7.0, y=0.5
    // Station 1: z=6.0, y=0.0
    // Station 2: z=4.5, y=-0.5 (low altitude through cubes)
    // Station 3: z=6.5, y=0.8
    // Station 4: z=6.8, y=0.4
    // Station 5: z=7.2, y=0.6

    const p = Math.max(0, Math.min(1, scrollProgress));
    const targetZ = 7.0 - p * 2.2 + Math.sin(p * Math.PI) * 1.5;
    const targetY = 0.5 - p * 0.6;

    // Mouse parallax offset
    const parallaxX = isMotionOn ? pointer.x * 0.45 : 0;
    const parallaxY = isMotionOn ? pointer.y * 0.35 : 0;

    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      parallaxX,
      delta * 3.0
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      targetY + parallaxY,
      delta * 3.0
    );
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      targetZ,
      delta * 3.0
    );

    state.camera.lookAt(0, 0.4, 0);
  });

  return null;
}

// -------------------------------------------------------------
// MAIN SCENE CONTAINER: Cross-fades groups based on scroll progress
// -------------------------------------------------------------
function SceneGraph({ scrollProgress, pointer, isMotionOn }: CinematicSceneProps) {
  // Compute cross-fade opacity for each of the 6 stations
  // Stations: 0: 0.0, 1: 0.2, 2: 0.4, 3: 0.6, 4: 0.8, 5: 1.0
  const opacities = useMemo(() => {
    const p = Math.max(0, Math.min(1, scrollProgress));
    const stationTargets = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
    const halfWidth = 0.18;

    return stationTargets.map((center) => {
      const dist = Math.abs(p - center);
      if (dist > halfWidth) return 0;
      return Math.cos((dist / halfWidth) * (Math.PI / 2));
    });
  }, [scrollProgress]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 8, 5]} intensity={2.2} color="#37d3fc" />
      <directionalLight position={[-6, -4, -4]} intensity={1.5} color="#0a1f3d" />
      <pointLight position={[0, 1, 4.5]} intensity={2.5} color="#37d3fc" distance={15} />

      <CameraRig scrollProgress={scrollProgress} pointer={pointer} isMotionOn={isMotionOn} />
      <AtmosphericDust isMotionOn={isMotionOn} />

      <GatewayStation opacity={opacities[0]} pointer={pointer} isMotionOn={isMotionOn} />
      <DetectStation opacity={opacities[1]} isMotionOn={isMotionOn} />
      <MaskStation opacity={opacities[2]} isMotionOn={isMotionOn} />
      <ForwardStation opacity={opacities[3]} isMotionOn={isMotionOn} />
      <ReinsertStation opacity={opacities[4]} isMotionOn={isMotionOn} />
      <ProofStation opacity={opacities[5]} isMotionOn={isMotionOn} />

      {/* Bloom post-processing */}
      {isMotionOn && (
        <EffectComposer enableNormalPass={false} multisampling={0}>
          <Bloom luminanceThreshold={0.55} luminanceSmoothing={0.3} intensity={0.9} />
        </EffectComposer>
      )}
    </>
  );
}

// -------------------------------------------------------------
// EXPORTED CANVAS WRAPPER (Lazy-loadable, handles reduced motion / tab visibility)
// -------------------------------------------------------------
export const CinematicCanvas: React.FC<CinematicSceneProps> = (props) => {
  const canRun3D = useCanRun3D();

  // Mobile / Low-spec fallback: Simplified glowing cube over gradient
  if (!canRun3D) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-b from-[#050a1c] to-[#0a1f3d] flex items-center justify-center">
        <div className="w-52 h-52 rounded-2xl border border-[#37d3fc]/70 bg-[#37d3fc]/10 shadow-[0_0_80px_rgba(55,211,252,0.4)] backdrop-blur-md rotate-12 flex items-center justify-center -mt-24">
          <div className="w-36 h-36 rounded-xl border border-[#37d3fc]/50 bg-[#050a1c]/80 flex items-center justify-center -rotate-6">
            <span className="font-ui text-xs font-bold tracking-widest text-[#37d3fc]">
              ZEROLEAK VAULT
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 select-none overflow-hidden bg-gradient-to-br from-[#050a1c] to-[#0a1f3d]">
      <Canvas
        camera={{ position: [0, 0.5, 7.0], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <fog attach="fog" args={['#050a1c', 6, 32]} />
        <SceneGraph {...props} />
      </Canvas>
    </div>
  );
};

export default CinematicCanvas;