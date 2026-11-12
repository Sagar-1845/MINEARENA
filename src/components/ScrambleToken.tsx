import React, { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

interface ScrambleTokenProps {
  text: string;
  className?: string;
  chars?: string;
  duration?: number;
}

export const ScrambleToken: React.FC<ScrambleTokenProps> = ({
  text,
  className = '',
  chars = '0123456789!@#$%^&*<>_[]{}',
  duration = 0.6,
}) => {
  const textRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!textRef.current) return;

      // Run GSAP ScrambleText animation on text or prop change with automatic cleanup
      gsap.to(textRef.current, {
        duration,
        scrambleText: {
          text,
          chars,
          revealDelay: 0.15,
          speed: 0.4,
        },
        ease: 'power2.out',
      });
    },
    { dependencies: [text, chars, duration], scope: textRef }
  );

  return (
    <span ref={textRef} className={className}>
      {text}
    </span>
  );
};

export default ScrambleToken;
