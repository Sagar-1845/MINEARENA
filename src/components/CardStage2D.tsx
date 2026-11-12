import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Fingerprint,
  Cpu,
  Building2,
  Vote,
  Globe,
  RotateCcw,
  Sparkles,
  Lock,
  Layers,
  CheckCircle2,
  Shield,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrambleToken } from '@/components/ScrambleToken';

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
  genericIcon: React.ElementType;
  accentBorder: string;
  sampleMark: string;
  fields: CardField[];
}

const SAMPLE_DOCUMENTS: DocumentCardData[] = [
  {
    id: 'aadhaar',
    title: 'Resident Specimen Card',
    category: 'Unique Identifier',
    genericIcon: Fingerprint,
    accentBorder: 'from-saffron via-white/40 to-indiaGreen',
    sampleMark: 'SAMPLE RESIDENT SPECIMEN',
    fields: [
      {
        label: 'Legal Name',
        rawValue: 'Aarav Sharma',
        tokenValue: '<PERSON_1>',
        tokenColor: 'border-neon/60 bg-neon/15 text-neon shadow-neon-glow',
      },
      {
        label: 'Aadhaar Number',
        rawValue: 'XXXX XXXX 8921',
        tokenValue: '<AADHAAR_1>',
        tokenColor: 'border-saffron/60 bg-saffron/15 text-saffron shadow-saffron-glow',
      },
      {
        label: 'Date of Birth',
        rawValue: '14/08/1992',
        tokenValue: '<DOB_1>',
        tokenColor: 'border-indiaGreen/60 bg-indiaGreen/15 text-indiaGreen shadow-green-glow',
      },
      {
        label: 'Gender',
        rawValue: 'MALE / पुरुष',
        tokenValue: '<GENDER_1>',
        tokenColor: 'border-cyan-400/60 bg-cyan-400/15 text-cyan-300',
      },
    ],
  },
  {
    id: 'pan',
    title: 'Tax Identifier Specimen',
    category: 'Financial Record',
    genericIcon: Cpu,
    accentBorder: 'from-cyan-500 via-indiaGreen to-saffron',
    sampleMark: 'SAMPLE TAX CARD',
    fields: [
      {
        label: 'Cardholder Name',
        rawValue: 'Priya Venkatesh',
        tokenValue: '<PERSON_1>',
        tokenColor: 'border-neon/60 bg-neon/15 text-neon shadow-neon-glow',
      },
      {
        label: 'Permanent Account Number',
        rawValue: 'XXXXX 1234F',
        tokenValue: '<PAN_1>',
        tokenColor: 'border-saffron/60 bg-saffron/15 text-saffron shadow-saffron-glow',
      },
      {
        label: "Father's Name",
        rawValue: 'R. Venkatesh',
        tokenValue: '<PERSON_2>',
        tokenColor: 'border-purple-400/60 bg-purple-400/15 text-purple-300',
      },
      {
        label: 'Date of Birth',
        rawValue: '03/11/1988',
        tokenValue: '<DOB_2>',
        tokenColor: 'border-indiaGreen/60 bg-indiaGreen/15 text-indiaGreen shadow-green-glow',
      },
    ],
  },
  {
    id: 'gstin',
    title: 'GSTIN Certificate Specimen',
    category: 'Commercial Registration',
    genericIcon: Building2,
    accentBorder: 'from-amber-500 via-orange-500 to-indiaGreen',
    sampleMark: 'SAMPLE BUSINESS DOC',
    fields: [
      {
        label: 'Trade Name',
        rawValue: 'Bharat Quantum Tech Pvt Ltd',
        tokenValue: '<ORG_1>',
        tokenColor: 'border-neon/60 bg-neon/15 text-neon shadow-neon-glow',
      },
      {
        label: 'GSTIN Number',
        rawValue: '29 XXXXX 1234 Z1',
        tokenValue: '<GSTIN_1>',
        tokenColor: 'border-amber-400/60 bg-amber-400/15 text-amber-300',
      },
      {
        label: 'Jurisdiction',
        rawValue: 'Karnataka State (29)',
        tokenValue: '<STATE_1>',
        tokenColor: 'border-cyan-400/60 bg-cyan-400/15 text-cyan-300',
      },
      {
        label: 'Taxpayer Status',
        rawValue: 'Regular Taxpayer',
        tokenValue: '<TYPE_1>',
        tokenColor: 'border-indiaGreen/60 bg-indiaGreen/15 text-indiaGreen',
      },
    ],
  },
  {
    id: 'voter',
    title: 'Elector Photo Specimen',
    category: 'Civil Registry',
    genericIcon: Vote,
    accentBorder: 'from-saffron via-rose-500 to-indigo-500',
    sampleMark: 'SAMPLE ELECTOR IDENTITY',
    fields: [
      {
        label: 'Elector Name',
        rawValue: 'Devika Sundaram',
        tokenValue: '<PERSON_1>',
        tokenColor: 'border-neon/60 bg-neon/15 text-neon shadow-neon-glow',
      },
      {
        label: 'EPIC Number',
        rawValue: 'WXYZ 4829102',
        tokenValue: '<VOTER_ID_1>',
        tokenColor: 'border-orange-400/60 bg-orange-400/15 text-orange-300',
      },
      {
        label: 'Constituency',
        rawValue: 'AC-152 Indiranagar',
        tokenValue: '<CONSTITUENCY_1>',
        tokenColor: 'border-cyan-400/60 bg-cyan-400/15 text-cyan-300',
      },
      {
        label: 'Guardian Name',
        rawValue: 'S. Sundaram',
        tokenValue: '<PERSON_2>',
        tokenColor: 'border-purple-400/60 bg-purple-400/15 text-purple-300',
      },
    ],
  },
  {
    id: 'passport',
    title: 'International Travel Specimen',
    category: 'Passport Book Specimen',
    genericIcon: Globe,
    accentBorder: 'from-blue-600 via-indigo-500 to-emerald-500',
    sampleMark: 'SAMPLE TRAVEL SPECIMEN',
    fields: [
      {
        label: 'Surname & Given Name',
        rawValue: 'Vikramaditya Roy',
        tokenValue: '<PERSON_1>',
        tokenColor: 'border-neon/60 bg-neon/15 text-neon shadow-neon-glow',
      },
      {
        label: 'Passport Number',
        rawValue: 'Z 8192301',
        tokenValue: '<PASSPORT_1>',
        tokenColor: 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300',
      },
      {
        label: 'Nationality',
        rawValue: 'INDIAN CITIZEN',
        tokenValue: '<NATIONALITY_1>',
        tokenColor: 'border-saffron/60 bg-saffron/15 text-saffron shadow-saffron-glow',
      },
      {
        label: 'Validity Expiry',
        rawValue: '24/09/2032',
        tokenValue: '<EXPIRY_1>',
        tokenColor: 'border-cyan-400/60 bg-cyan-400/15 text-cyan-300',
      },
    ],
  },
];

export interface CardStage2DProps {
  scrollProgress?: number;
}

export const CardStage2D: React.FC<CardStage2DProps> = ({ scrollProgress }) => {
  const [selectedDocId, setSelectedDocId] = useState<string>('aadhaar');
  const [isMaskedStage, setIsMaskedStage] = useState<boolean>(true);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const centerStageRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Sync with scrollProgress when pinned
  useEffect(() => {
    if (scrollProgress === undefined) return;
    setIsMaskedStage(scrollProgress >= 0.5);
  }, [scrollProgress]);

  const selectedDoc =
    SAMPLE_DOCUMENTS.find((d) => d.id === selectedDocId) || SAMPLE_DOCUMENTS[0];

  // Mouse move parallax/tilt effect for center stage card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !centerStageRef.current) return;
    const rect = centerStageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Normalized tilt
    const maxTilt = 12; // degrees
    const tiltX = -(y / (rect.height / 2)) * maxTilt;
    const tiltY = (x / (rect.width / 2)) * maxTilt;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleReset = () => {
    setIsMaskedStage(false);
  };

  const handleToggleMask = () => {
    setIsMaskedStage((prev) => !prev);
  };

  return (
    <section id="card-stage" className="py-20 sm:py-28 border-t border-border/80 relative bg-background">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[400px] rounded-full bg-saffron/5 blur-[160px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Badge variant="outline" className="border-neon/40 text-neon font-mono text-xs mb-3">
            <Layers className="w-3.5 h-3.5 mr-1 text-neon" /> INTERACTIVE CARD STAGE
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Choose Your Document
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-2xl mx-auto">
            Click any stylized sample card below to lift it to center stage. Watch its
            sensitive fields sequentially tokenize into cryptographically sealed chips.
          </p>
        </div>

        {/* Carousel / Row of 5 Sample Cards */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory px-2">
          {SAMPLE_DOCUMENTS.map((doc) => {
            const Icon = doc.genericIcon;
            const isSelected = doc.id === selectedDocId;

            return (
              <div
                key={doc.id}
                role="button"
                tabIndex={0}
                aria-label={`Select ${doc.title}`}
                onClick={() => {
                  setSelectedDocId(doc.id);
                  setIsMaskedStage(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedDocId(doc.id);
                    setIsMaskedStage(true);
                  }
                }}
                className={cn(
                  'flex-shrink-0 w-[200px] sm:w-[220px] rounded-2xl p-4 transition-all duration-300 cursor-pointer snap-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-neon border relative overflow-hidden',
                  isSelected
                    ? 'bg-card border-neon shadow-neon-glow -translate-y-2'
                    : 'bg-card/70 border-border/80 hover:border-foreground/30 hover:bg-card/90'
                )}
              >
                {/* Sample Strip */}
                <div className="absolute -right-10 top-4 rotate-45 pointer-events-none">
                  <div className="bg-destructive/20 border-y border-destructive/40 text-destructive text-[7px] font-mono font-bold tracking-widest px-8 py-0.5">
                    SAMPLE
                  </div>
                </div>

                <div className="flex items-center gap-2.5 mb-2.5">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center border',
                      isSelected
                        ? 'bg-neon/15 text-neon border-neon/40'
                        : 'bg-secondary text-muted-foreground border-border'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase block truncate">
                      {doc.category}
                    </span>
                    <h3 className="text-xs font-bold text-foreground truncate">
                      {doc.title.split(' ')[0]} Card
                    </h3>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground font-mono truncate">
                  {doc.fields[0].rawValue}
                </p>
                <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-muted-foreground truncate">{doc.fields[1].rawValue}</span>
                  {isSelected && (
                    <span className="text-neon text-[9px] font-bold">ACTIVE</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Stage Lift Area */}
        <div className="mt-8 sm:mt-12 flex flex-col items-center">
          {/* Controls Bar */}
          <div className="w-full max-w-xl flex items-center justify-between gap-3 mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">Center Stage:</span>
              <Badge variant="outline" className="border-border font-mono text-xs text-foreground">
                {selectedDoc.title}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1.5 text-xs font-mono min-h-[40px] px-3.5 rounded-xl border-border hover:text-saffron focus-visible:ring-2 focus-visible:ring-neon"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>

              <Button
                variant={isMaskedStage ? 'neon' : 'saffron'}
                size="sm"
                onClick={handleToggleMask}
                className="gap-1.5 text-xs font-mono min-h-[40px] px-3.5 rounded-xl focus-visible:ring-2 focus-visible:ring-neon"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isMaskedStage ? 'Reveal Raw PII' : 'Animate to Tokens'}</span>
              </Button>
            </div>
          </div>

          {/* 3D Tilt Stage Card */}
          <div
            ref={centerStageRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full max-w-xl perspective-1000 py-2 sm:py-4"
          >
            <motion.div
              style={{
                transformStyle: 'preserve-3d',
                transform: shouldReduceMotion
                  ? 'none'
                  : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              }}
              className="relative w-full rounded-3xl border border-border/90 bg-card/95 p-4 sm:p-7 shadow-2xl backdrop-blur-2xl transition-transform duration-150 overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div
                className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${selectedDoc.accentBorder}`}
              />

              {/* Diagonal Watermark (NO government emblem) */}
              <div className="absolute -right-14 top-8 rotate-45 pointer-events-none z-20">
                <div className="bg-destructive/20 border-y border-destructive/50 text-destructive text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] px-14 py-1 shadow-sm">
                  {selectedDoc.sampleMark}
                </div>
              </div>

              {/* Stage Card Header */}
              <div className="flex items-center justify-between border-b border-border/70 pb-4 pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/80 border border-border flex items-center justify-center text-foreground">
                    <selectedDoc.genericIcon className="w-5 h-5 text-saffron" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-foreground">
                      {selectedDoc.title}
                    </h4>
                    <p className="text-[10px] sm:text-xs font-mono text-muted-foreground">
                      Synthetic DPDP Gateway Fixture • Non-Official
                    </p>
                  </div>
                </div>

                <Badge variant="outline" className="border-border font-mono text-[10px] text-muted-foreground mr-10 sm:mr-0">
                  FICTIONAL DATA
                </Badge>
              </div>

              {/* Sequential Animated Fields Grid */}
              <div className="mt-6 space-y-4">
                {selectedDoc.fields.map((field, idx) => {
                  return (
                    <div
                      key={field.label}
                      className="p-3 sm:p-3.5 rounded-xl border border-border/60 bg-background/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors hover:border-foreground/30"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">
                          {field.label}
                        </span>
                        <div className="relative min-h-[28px] flex items-center">
                          <AnimatePresence mode="wait">
                            {!isMaskedStage ? (
                              <motion.span
                                key={`raw-${field.label}`}
                                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="font-mono text-xs sm:text-sm font-semibold text-foreground/90 truncate"
                              >
                                {field.rawValue}
                              </motion.span>
                            ) : (
                              <motion.span
                                key={`token-${field.label}`}
                                initial={
                                  shouldReduceMotion
                                    ? { opacity: 0 }
                                    : { opacity: 0, scale: 0.8, y: 5 }
                                }
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={
                                  shouldReduceMotion
                                    ? { opacity: 0 }
                                    : { opacity: 0, scale: 0.8, y: -5 }
                                }
                                transition={{
                                  duration: 0.3,
                                  delay: shouldReduceMotion ? 0 : idx * 0.15,
                                  type: 'spring',
                                  stiffness: 400,
                                  damping: 25,
                                }}
                                className={cn(
                                  'font-mono text-xs sm:text-sm font-bold px-2.5 py-1 rounded-md border inline-flex items-center gap-1.5 shadow-sm',
                                  field.tokenColor
                                )}
                              >
                                <Lock className="w-3 h-3 flex-shrink-0" />
                                <ScrambleToken text={field.tokenValue} />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono text-muted-foreground sm:text-right">
                        {isMaskedStage ? (
                          <span className="text-neon flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-neon" /> Guarded
                          </span>
                        ) : (
                          <span className="text-saffron flex items-center gap-1">
                            Raw PII
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Center Stage Footer Banner */}
              <div className="mt-6 pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indiaGreen" />
                  <span>On-Prem Vault Isolation</span>
                </span>
                <span>NO GOVT EMBLEM OR LOGO</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
