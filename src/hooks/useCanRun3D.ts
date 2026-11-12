import { useEffect, useState } from 'react';

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
}

function checkHardwareConcurrency(): boolean {
  if (typeof navigator === 'undefined') return true;
  if (typeof navigator.hardwareConcurrency === 'number') {
    return navigator.hardwareConcurrency >= 4;
  }
  return true;
}

function evaluateCanRun3D(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  if (prefersReducedMotion) return false;

  // 2. Viewport under 768px
  if (window.innerWidth < 768) return false;

  // 3. WebGL support
  if (!checkWebGLSupport()) return false;

  // 4. Hardware concurrency under 4
  if (!checkHardwareConcurrency()) return false;

  return true;
}

/**
 * Custom hook to detect if the client environment is capable and permitted to run 3D WebGL scenes.
 * Returns false when:
 *  - prefers-reduced-motion is true
 *  - viewport width < 768px
 *  - no WebGL support
 *  - navigator.hardwareConcurrency < 4
 */
export function useCanRun3D(): boolean {
  const [canRun, setCanRun] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return evaluateCanRun3D();
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateCapability = () => {
      setCanRun(evaluateCanRun3D());
    };

    updateCapability();

    // Listen to resize
    window.addEventListener('resize', updateCapability);

    // Listen to media query changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateCapability);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(updateCapability);
    }

    return () => {
      window.removeEventListener('resize', updateCapability);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateCapability);
      } else if ((mediaQuery as any).removeListener) {
        (mediaQuery as any).removeListener(updateCapability);
      }
    };
  }, []);

  return canRun;
}

export default useCanRun3D;
