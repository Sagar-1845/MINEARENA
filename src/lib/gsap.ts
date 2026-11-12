import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

// Register all requested GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrambleTextPlugin, ScrollTrigger, SplitText);
}

export { gsap, useGSAP, ScrambleTextPlugin, ScrollTrigger, SplitText };
