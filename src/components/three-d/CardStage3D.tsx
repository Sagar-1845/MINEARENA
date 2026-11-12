import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { gsap, useGSAP } from '@/lib/gsap';

export interface CardField {
  label: string;
  rawValue: string;
  tokenValue: string;
  tokenColor: string;
}

export interface DocumentCardData {
  id: string;
  title: string;
  category: string;
  accentColor: string;
  borderColor: string;
  sampleMark: string;
  fields: CardField[];
}

export const SAMPLE_DOCS: DocumentCardData[] = [
  {
    id: 'aadhaar',
    title: 'Resident Specimen Card',
    category: 'Unique Identifier',
    accentColor: '#FF9933',
    borderColor: '#138808',
    sampleMark: 'SAMPLE RESIDENT SPECIMEN',
    fields: [
      {
        label: 'Legal Name',
        rawValue: 'Aarav Sharma',
        tokenValue: '<PERSON_1>',
        tokenColor: 'border-neon/70 bg-neon/15 text-neon shadow-neon-glow',
      },
      {
        label: 'Aadhaar Number',
        rawValue: 'XXXX XXXX 8921',
        tokenValue: '<AADHAAR_1>',
        tokenColor: 'border-saffron/70 bg-saffron/15 text-saffron shadow-saffron-glow',
      },
      {
        label: 'Date of Birth',
        rawValue: '14/08/1992',
        tokenValue: '<DOB_1>',
        tokenColor: 'border-indiaGreen/70 bg-indiaGreen/15 text-indiaGreen shadow-green-glow',
      },
      {
        label: 'Gender',
        rawValue: 'MALE / पुरुष',
        tokenValue: '<GENDER_1>',
        tokenColor: 'border-cyan-400/70 bg-cyan-400/15 text-cyan-300',
      },
    ],
  },
  {
    id: 'pan',
    title: 'Tax Identifier Specimen',
    category: 'Financial Record',
    accentColor: '#00F5FF',
    borderColor: '#FF9933',
    sampleMark: 'SAMPLE TAX CARD',
    fields: [
      {
        label: 'Cardholder Name',
        rawValue: 'Priya Venkatesh',
        tokenValue: '<PERSON_1>',
        tokenColor: 'border-neon/70 bg-neon/15 text-neon shadow-neon-glow',
      },
      {
        label: 'Permanent Account Number',
        rawValue: 'XXXXX 1234F',
        tokenValue: '<PAN_1>',
        tokenColor: 'border-saffron/70 bg-saffron/15 text-saffron shadow-saffron-glow',
      },
      {
        label: "Father's Name",
        rawValue: 'R. Venkatesh',
        tokenValue: '<PERSON_2>',
        tokenColor: 'border-purple-400/70 bg-purple-400/15 text-purple-300',
      },
      {
        label: 'Date of Birth',
        rawValue: '03/11/1988',
        tokenValue: '<DOB_2>',
        tokenColor: 'border-indiaGreen/70 bg-indiaGreen/15 text-indiaGreen shadow-green-glow',
      },
    ],
  },
  {
    id: 'gstin',
    title: 'GSTIN Certificate Specimen',
    category: 'Commercial Registration',
    accentColor: '#F59E0B',
    borderColor: '#138808',
    sampleMark: 'SAMPLE BUSINESS DOC',
    fields: [
      {
        label: 'Trade Name',
        rawValue: 'Bharat Quantum Tech Pvt Ltd',
        tokenValue: '<ORG_1>',
        tokenColor: 'border-neon/70 bg-neon/15 text-neon shadow-neon-glow',
      },
      {
        label: 'GSTIN Number',
        rawValue: '29 XXXXX 1234 Z1',
        tokenValue: '<GSTIN_1>',
        tokenColor: 'border-amber-400/70 bg-amber-400/15 text-amber-300',
      },
      {
        label: 'Jurisdiction',
        rawValue: 'Karnataka State (29)',
        tokenValue: '<STATE_1>',
        tokenColor: 'border-cyan-400/70 bg-cyan-400/15 text-cyan-300',
      },
      {
        label: 'Taxpayer Status',
        rawValue: 'Regular Taxpayer',
        tokenValue: '<TYPE_1>',
        tokenColor: 'border-indiaGreen/70 bg-indiaGreen/15 text-indiaGreen',
      },
    ],
  },
  {
    id: 'voter',
    title: 'Elector Photo Specimen',
    category: 'Civil Registry',
    accentColor: '#FF9933',
    borderColor: '#818CF8',
    sampleMark: 'SAMPLE ELECTOR IDENTITY',
    fields: [
      {
        label: 'Elector Name',
        rawValue: 'Devika Sundaram',
        tokenValue: '<PERSON_1>',
        tokenColor: 'border-neon/70 bg-neon/15 text-neon shadow-neon-glow',
      },
      {
        label: 'EPIC Number',
        rawValue: 'WXYZ 4829102',
        tokenValue: '<VOTER_ID_1>',
        tokenColor: 'border-orange-400/70 bg-orange-400/15 text-orange-300',
      },
      {
        label: 'Constituency',
        rawValue: 'AC-152 Indiranagar',
        tokenValue: '<CONSTITUENCY_1>',
        tokenColor: 'border-cyan-400/70 bg-cyan-400/15 text-cyan-300',
      },
      {
        label: 'Guardian Name',
        rawValue: 'S. Sundaram',
        tokenValue: '<PERSON_2>',
        tokenColor: 'border-purple-400/70 bg-purple-400/15 text-purple-300',
      },
    ],
  },
  {
    id: 'passport',
    title: 'International Travel Specimen',
    category: 'Passport Book Specimen',
    accentColor: '#3B82F6',
    borderColor: '#10B981',
    sampleMark: 'SAMPLE TRAVEL SPECIMEN',
    fields: [
      {
        label: 'Surname & Given Name',
        rawValue: 'Vikramaditya Roy',
        tokenValue: '<PERSON_1>',
        tokenColor: 'border-neon/70 bg-neon/15 text-neon shadow-neon-glow',
      },
      {
        label: 'Passport Number',
        rawValue: 'Z 8192301',
        tokenValue: '<PASSPORT_1>',
        tokenColor: 'border-emerald-400/70 bg-emerald-400/15 text-emerald-300',
      },
      {
        label: 'Nationality',
        rawValue: 'INDIAN CITIZEN',
        tokenValue: '<NATIONALITY_1>',
        tokenColor: 'border-saffron/70 bg-saffron/15 text-saffron shadow-saffron-glow',
      },
      {
        label: 'Validity Expiry',
        rawValue: '24/09/2032',
        tokenValue: '<EXPIRY_1>',
        tokenColor: 'border-cyan-400/70 bg-cyan-400/15 text-cyan-300',
      },
    ],
  },
];

// Generate sharp, high-res canvas texture for each 3D card face
function createCardCanvasTexture(doc: DocumentCardData): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 720;
  const ctx = canvas.getContext('2d')!;

  // 1. Dark Rounded Background
  ctx.fillStyle = '#0b0f1a';
  ctx.beginPath();
  ctx.roundRect(0, 0, 512, 720, 24);
  ctx.fill();

  // 2. Subtle Card Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(2, 2, 508, 716, 22);
  ctx.stroke();

  // 3. Top Decorative Gradient Header (No government emblems)
  const headerGrad = ctx.createLinearGradient(0, 0, 512, 0);
  headerGrad.addColorStop(0, doc.accentColor);
  headerGrad.addColorStop(1, doc.borderColor);
  ctx.fillStyle = headerGrad;
  ctx.fillRect(4, 4, 504, 12);

  // 4. "SAMPLE ONLY" Watermark Banner
  ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
  ctx.beginPath();
  ctx.roundRect(28, 36, 456, 36, 8);
  ctx.fill();
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#f87171';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('⚠ SAMPLE ONLY • FICTIONAL SPECIMEN', 256, 60);

  // 5. Category & Title
  ctx.textAlign = 'left';
  ctx.fillStyle = doc.accentColor;
  ctx.font = 'bold 12px monospace';
  ctx.fillText(doc.category.toUpperCase(), 36, 110);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillText(doc.title, 36, 140);

  // 6. Generic Geometric Chip / Security Vault Icon (Strictly NO govt logos)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.beginPath();
  ctx.roundRect(36, 160, 54, 42, 6);
  ctx.fill();
  ctx.strokeStyle = doc.accentColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Internal lines of the geometric vault chip
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.moveTo(46, 181);
  ctx.lineTo(80, 181);
  ctx.moveTo(63, 166);
  ctx.lineTo(63, 196);
  ctx.stroke();

  // 7. Render Card Fictional Fields
  let currentY = 240;
  doc.fields.forEach((field) => {
    // Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText(field.label.toUpperCase(), 36, currentY);

    // Value box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.beginPath();
    ctx.roundRect(36, currentY + 8, 440, 42, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Raw masked value
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(field.rawValue, 48, currentY + 35);

    currentY += 76;
  });

  // 8. Bottom Security Footer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.fillRect(36, 640, 440, 1);

  ctx.fillStyle = '#64748b';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('DPDP ACT 2023 LOCAL PRIVACY ENCLAVE', 256, 670);
  ctx.fillText('NO REAL PII • RESTORED LOCALLY', 256, 688);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

// Sparse Particle Field (under 300 points) of drifting placeholder-colored dots
function DriftingParticleField() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors, count } = useMemo(() => {
    const pointCount = 180;
    const pos = new Float32Array(pointCount * 3);
    const col = new Float32Array(pointCount * 3);

    const palette = [
      new THREE.Color('#FF9933'), // saffron
      new THREE.Color('#00F5FF'), // neon
      new THREE.Color('#138808'), // india green
      new THREE.Color('#F59E0B'), // amber
      new THREE.Color('#E2E8F0'), // white
    ];

    for (let i = 0; i < pointCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return { positions: pos, colors: col, count: pointCount };
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.02;
      pointsRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
}

// Smooth camera easing rig
function CameraRig({ isCardCentered }: { isCardCentered: boolean }) {
  useFrame((state, delta) => {
    const targetZ = isCardCentered ? 5.8 : 7.2;
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      targetZ,
      delta * 3.5
    );
  });
  return null;
}

// Single 3D Card Mesh Component in the arc
interface CardMeshProps {
  index: number;
  doc: DocumentCardData;
  texture: THREE.CanvasTexture;
  isSelected: boolean;
  isOtherSelected: boolean;
  isFocused: boolean;
  onSelect: () => void;
}

function CardMesh({
  index,
  doc,
  texture,
  isSelected,
  isOtherSelected,
  isFocused,
  onSelect,
}: CardMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calculate gentle arc positions (5 cards centered at index 2)
  const { restX, restZ, restRotY, restRotZ } = useMemo(() => {
    const angle = (index - 2) * 0.26; // ~15 deg spacing
    const radius = 6.4;
    return {
      restX: Math.sin(angle) * radius,
      restZ: -(1 - Math.cos(angle)) * 2.4 - 0.2,
      restRotY: -angle * 0.75,
      restRotZ: -angle * 0.12,
    };
  }, [index]);

  // Handle pointer hover tilt toward the pointer
  const handlePointerMove = (e: any) => {
    if (isSelected) return;
    e.stopPropagation();
    // Normalized coordinates on card face (-1 to +1)
    if (e.uv) {
      const px = (e.uv.x - 0.5) * 2;
      const py = (e.uv.y - 0.5) * 2;
      setTilt({ x: -py * 0.28, y: px * 0.32 });
    }
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
    document.body.style.cursor = 'auto';
  };

  // Interpolate card position, rotation, and floating motion
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    const floatY = isSelected ? 0 : Math.sin(time * 1.4 + index * 0.8) * 0.1;

    let targetX = restX;
    let targetY = floatY;
    let targetZ = restZ;
    let targetRotX = tilt.x;
    let targetRotY = restRotY + tilt.y;
    let targetRotZ = restRotZ;
    let targetScale = isFocused ? 1.05 : 1.0;

    if (isSelected) {
      // Card flies to center
      targetX = 0;
      targetY = 0;
      targetZ = 1.35;
      targetRotX = 0;
      targetRotY = 0;
      targetRotZ = 0;
      targetScale = 1.1;
    } else if (isOtherSelected) {
      // Push unselected cards further back and fade slightly
      targetX = restX * 1.15;
      targetY = floatY - 0.3;
      targetZ = restZ - 2.2;
      targetScale = 0.7;
    } else if (hovered) {
      targetScale = 1.06;
      targetZ = restZ + 0.3;
    }

    // Smooth lerp for buttery animation
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX,
      delta * 4.5
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      delta * 4.5
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      targetZ,
      delta * 4.5
    );

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      delta * 5
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      delta * 5
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      targetRotZ,
      delta * 5
    );

    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      delta * 4.5
    );
  });

  return (
    <group
      ref={groupRef}
      position={[restX, 0, restZ]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerMove={handlePointerMove}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* 3D Rounded Card Body */}
      <RoundedBox args={[2.7, 3.8, 0.05]} radius={0.12} smoothness={4}>
        <meshStandardMaterial
          color="#0d111a"
          metalness={0.7}
          roughness={0.3}
        />
      </RoundedBox>

      {/* Front Face with Sharp Canvas Texture */}
      <mesh position={[0, 0, 0.027]}>
        <planeGeometry args={[2.65, 3.75]} />
        <meshBasicMaterial
          map={texture}
          transparent
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>

      {/* Subtle Glow Ring for Focused or Hovered Card */}
      {(hovered || isFocused) && !isSelected && (
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2.85, 3.95]} />
          <meshBasicMaterial
            color={doc.accentColor}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
}

// Scramble field with GSAP ScrambleText on HTML overlay
interface ScrambleFieldProps {
  label: string;
  rawValue: string;
  tokenValue: string;
  tokenColor: string;
  isMasked: boolean;
}

const ScrambleField: React.FC<ScrambleFieldProps> = ({
  label,
  rawValue,
  tokenValue,
  tokenColor,
  isMasked,
}) => {
  const textRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!textRef.current) return;
      const targetText = isMasked ? tokenValue : rawValue;

      gsap.to(textRef.current, {
        duration: 0.65,
        scrambleText: {
          text: targetText,
          chars: '0123456789!@#$%^&*<>_[]{}',
          revealDelay: 0.1,
          speed: 0.45,
        },
        ease: 'power2.out',
      });
    },
    { dependencies: [isMasked, tokenValue, rawValue], scope: textRef }
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:py-2.5 px-3 rounded-lg bg-card/60 border border-border/50 gap-1.5 transition-colors hover:bg-secondary/40">
      <span className="text-xs font-mono text-muted-foreground">{label}</span>
      <span
        ref={textRef}
        className={cn(
          'font-mono text-xs sm:text-sm px-2.5 py-1 rounded-md border select-all transition-all duration-300',
          isMasked
            ? tokenColor
            : 'border-border/80 bg-secondary/80 text-foreground'
        )}
      >
        {isMasked ? tokenValue : rawValue}
      </span>
    </div>
  );
};

// Main 3D Card Stage Component
export interface CardStage3DProps {
  scrollProgress?: number;
}

export const CardStage3D: React.FC<CardStage3DProps> = ({ scrollProgress }) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(2);
  const [isMasked, setIsMasked] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with ScrollTrigger pin scrub: scroll progress animates raw -> masked state
  useEffect(() => {
    if (scrollProgress === undefined) return;

    if (scrollProgress < 0.15) {
      setSelectedDocId(null);
    } else {
      setSelectedDocId((prev) => prev || 'aadhaar');
    }

    if (scrollProgress >= 0.45) {
      setIsMasked(true);
    } else {
      setIsMasked(false);
    }
  }, [scrollProgress]);

  // Generate canvas textures once for all 5 sample cards
  const textures = useMemo(() => {
    return SAMPLE_DOCS.map((doc) => createCardCanvasTexture(doc));
  }, []);

  // Dispose textures, geometries on unmount
  useEffect(() => {
    return () => {
      textures.forEach((tex) => tex.dispose());
    };
  }, [textures]);

  // Pause rendering when offscreen or tab is hidden
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsPaused(!entry.isIntersecting || document.hidden);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);

    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Keyboard navigation: Arrow keys move, Enter selects, Escape resets
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : SAMPLE_DOCS.length - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev < SAMPLE_DOCS.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setSelectedDocId(SAMPLE_DOCS[focusedIndex].id);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedDocId(null);
      }
    },
    [focusedIndex]
  );

  const selectedDoc = SAMPLE_DOCS.find((d) => d.id === selectedDocId) ?? null;

  return (
    <section
      id="card-stage"
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="3D Interactive Sample Identity Cards"
      className="py-16 sm:py-24 border-t border-border/80 relative bg-background overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-neon/50"
    >
      {/* Background Cyber Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 security-grid opacity-25" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-saffron/15 via-neon/10 to-indiaGreen/15 blur-[140px] pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <Badge
            variant="outline"
            className="mb-3 px-3 py-1 text-xs font-mono border-neon/40 text-neon bg-neon/5 gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3D INTERACTIVE VAULT</span>
          </Badge>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Choose Your Document.
          </h2>

          <p className="mt-3 text-sm sm:text-base text-muted-foreground font-medium">
            Click any card to lift it to center stage. Real values are detected
            and masked on your side before reaching the LLM.
          </p>

          <div className="mt-2 text-xs font-mono text-muted-foreground/80 flex items-center justify-center gap-3">
            <span>Arrow keys: Navigate</span>
            <span>•</span>
            <span>Enter: Select</span>
            <span>•</span>
            <span>Esc: Reset</span>
          </div>
        </div>

        {/* 3D Canvas Stage */}
        <div className="relative w-full h-[460px] sm:h-[560px] md:h-[620px] rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xl overflow-hidden">
          <Canvas
            camera={{ position: [0, 0, 7.2], fov: 46 }}
            dpr={[1, 1.5]}
            frameloop={isPaused ? 'never' : 'always'}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
            }}
          >
            {/* Plain lights only - NO CDN assets */}
            <ambientLight intensity={0.9} />
            <directionalLight position={[6, 8, 5]} intensity={1.6} color="#FF9933" />
            <directionalLight position={[-6, -6, -4]} intensity={1.3} color="#138808" />
            <pointLight position={[0, 0, 4]} intensity={2.2} color="#00F5FF" distance={15} />

            {/* Camera smooth zoom */}
            <CameraRig isCardCentered={selectedDoc !== null} />

            {/* Drifting particle field */}
            <DriftingParticleField />

            {/* 5 Rounded 3D Cards in gentle arc */}
            {SAMPLE_DOCS.map((doc, idx) => (
              <CardMesh
                key={doc.id}
                index={idx}
                doc={doc}
                texture={textures[idx]}
                isSelected={selectedDocId === doc.id}
                isOtherSelected={selectedDocId !== null && selectedDocId !== doc.id}
                isFocused={focusedIndex === idx}
                onSelect={() => {
                  setSelectedDocId(doc.id);
                  setFocusedIndex(idx);
                }}
              />
            ))}
          </Canvas>

          {/* Centered HTML Overlay with GSAP ScrambleText when card is centered */}
          {selectedDoc && (
            <div
              className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm pointer-events-auto transition-opacity duration-300"
              role="dialog"
              aria-modal="true"
              aria-label={`${selectedDoc.title} Masking Stage`}
            >
              <div className="w-full max-w-lg rounded-2xl border-2 border-border/90 bg-card/95 backdrop-blur-xl p-5 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-neon">
                        {selectedDoc.category}
                      </span>
                      <span className="text-border">•</span>
                      <span className="text-[10px] font-mono text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-500/30">
                        SAMPLE ONLY
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                      {selectedDoc.title}
                    </h3>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDocId(null)}
                    className="gap-1.5 text-xs font-mono border-border/80 hover:border-neon focus-visible:ring-2 focus-visible:ring-neon"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </Button>
                </div>

                {/* Scramble Fields with Selectable Real DOM Text */}
                <div className="mt-4 space-y-2">
                  <div className="text-[11px] font-mono text-muted-foreground flex items-center justify-between px-1">
                    <span>DETECTED ENTITY FIELDS</span>
                    <span className="text-neon flex items-center gap-1 font-semibold">
                      <Lock className="w-3 h-3 text-neon" /> Local Vault
                    </span>
                  </div>

                  {selectedDoc.fields.map((field, idx) => (
                    <ScrambleField
                      key={idx}
                      label={field.label}
                      rawValue={field.rawValue}
                      tokenValue={field.tokenValue}
                      tokenColor={field.tokenColor}
                      isMasked={isMasked}
                    />
                  ))}
                </div>

                {/* Action Bar */}
                <div className="mt-6 pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-muted-foreground">Mode:</span>
                    <Button
                      variant={isMasked ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setIsMasked(!isMasked)}
                      className={cn(
                        'h-8 text-xs font-mono gap-1.5',
                        isMasked
                          ? 'bg-neon/20 hover:bg-neon/30 text-neon border border-neon/50'
                          : 'border-border/80 text-foreground'
                      )}
                    >
                      {isMasked ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Masked Tokens Active</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Show Raw Specimen PII</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    variant="saffron"
                    size="sm"
                    onClick={() => setSelectedDocId(null)}
                    className="w-full sm:w-auto h-8 text-xs font-bold gap-1.5"
                  >
                    <span>Return to Deck</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Privacy Guarantee Footer */}
                <div className="mt-3 text-center text-[10px] font-mono text-muted-foreground/80 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-indiaGreen" />
                  <span>0 raw values leak outside your environment</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CardStage3D;
