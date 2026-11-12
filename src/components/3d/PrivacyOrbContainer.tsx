import React, { lazy, Suspense } from 'react';
import { useCanRun3D } from '@/hooks/useCanRun3D';
import { ThreeErrorBoundary } from '@/components/ThreeErrorBoundary';
import { PrivacyOrbFallback } from '@/components/3d/PrivacyOrbFallback';

// Lazy-load every 3D file with React.lazy + Suspense
const LazyPrivacyOrbScene = lazy(() => import('@/components/3d/PrivacyOrbScene'));

interface PrivacyOrbContainerProps {
  className?: string;
}

export const PrivacyOrbContainer: React.FC<PrivacyOrbContainerProps> = ({
  className = '',
}) => {
  const canRun3D = useCanRun3D();

  // All 3D must check useCanRun3D and show a static fallback otherwise
  if (!canRun3D) {
    return <PrivacyOrbFallback className={className} />;
  }

  return (
    <ThreeErrorBoundary fallback={<PrivacyOrbFallback className={className} />}>
      <Suspense fallback={<PrivacyOrbFallback className={className} />}>
        <LazyPrivacyOrbScene />
      </Suspense>
    </ThreeErrorBoundary>
  );
};

export default PrivacyOrbContainer;
