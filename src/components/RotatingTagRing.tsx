import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const ALL_TAGS = [
  { tag: '<PERSON_1>', color: 'border-neon/60 bg-neon/15 text-neon' },
  { tag: '<AADHAAR_1>', color: 'border-saffron/60 bg-saffron/15 text-saffron' },
  { tag: '<PAN_1>', color: 'border-indiaGreen/60 bg-indiaGreen/15 text-indiaGreen' },
  { tag: '<GSTIN_1>', color: 'border-amber-400/60 bg-amber-400/15 text-amber-300' },
  { tag: '<ADDRESS_1>', color: 'border-cyan-400/60 bg-cyan-400/15 text-cyan-300' },
  { tag: '<PASSPORT_1>', color: 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300' },
  { tag: '<VOTER_ID_1>', color: 'border-orange-400/60 bg-orange-400/15 text-orange-300' },
];

export const RotatingTagRing: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Below 640px show at most 4 tags; otherwise show all 7
  const visibleTags = isMobile ? ALL_TAGS.slice(0, 4) : ALL_TAGS;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 pointer-events-none flex items-center justify-center overflow-hidden opacity-20 select-none"
    >
      {/* Decorative Outer Orbital Track */}
      <div className="w-[300px] h-[300px] sm:w-[480px] sm:h-[480px] md:w-[620px] md:h-[620px] rounded-full border border-border/40 border-dashed absolute" />

      {/* Rotating Orbit Ring */}
      <motion.div
        className="relative w-[300px] h-[300px] sm:w-[480px] sm:h-[480px] md:w-[600px] md:h-[600px] flex items-center justify-center"
        animate={shouldReduceMotion ? { rotate: 0 } : { rotate: 360 }}
        transition={{
          duration: isMobile ? 35 : 45,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {visibleTags.map((item, index) => {
          const total = visibleTags.length;
          const angle = (index * 360) / total;

          return (
            <div
              key={item.tag}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                // Below 640px: smaller radius so it remains in outer background without intersecting text
                transform: `rotate(${angle}deg) translate(clamp(130px, ${isMobile ? '36vw' : '28vw'}, 275px)) rotate(-${angle}deg)`,
              }}
            >
              {/* Counter-rotate each tag so text stays readable */}
              <motion.div
                animate={shouldReduceMotion ? { rotate: 0 } : { rotate: -360 }}
                transition={{
                  duration: isMobile ? 35 : 45,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className={`font-mono text-[9px] sm:text-[11px] font-bold px-2.5 py-0.5 sm:py-1 rounded-full border backdrop-blur-sm whitespace-nowrap ${item.color}`}
              >
                {item.tag}
              </motion.div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};
