import React from 'react';

/**
 * 1px inset border (about 16px from the edges, rgba white 0.08)
 * with a chamfered top-right corner behind the Menu button.
 */
export const HudFrame: React.FC = () => {
  return (
    <div className="fixed inset-3 sm:inset-4 pointer-events-none z-20 select-none">
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1000 1000"
      >
        <path
          d="M 1 1 L 960 1 L 999 40 L 999 999 L 1 999 Z"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};

export default HudFrame;