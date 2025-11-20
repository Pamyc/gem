import React from 'react';

interface CCMLogoProps {
  className?: string;
}

export const CCMLogo: React.FC<CCMLogoProps> = ({ className = "" }) => {
  return (
    <svg 
      viewBox="0 0 200 400" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Outer Frame with Triangle Caps */}
      <path 
        d="M20 60 L100 20 L180 60 V340 L100 380 L20 340 Z" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinejoin="round"
      />
      
      {/* Inner Frame */}
      <rect x="35" y="70" width="130" height="260" stroke="currentColor" strokeWidth="3" />

      {/* Vertical Shaft Lines */}
      <path d="M65 70 V330" stroke="currentColor" strokeWidth="2" />
      <path d="M100 70 V330" stroke="currentColor" strokeWidth="2" />
      <path d="M135 70 V330" stroke="currentColor" strokeWidth="2" />

      {/* Horizontal Accents (Cabin styling) */}
      <path d="M65 150 Q100 130 135 150" stroke="currentColor" strokeWidth="4" fill="none" />
      <path d="M65 170 Q100 150 135 170" stroke="currentColor" strokeWidth="4" fill="none" />
      
      <path d="M65 230 Q100 250 135 230" stroke="currentColor" strokeWidth="4" fill="none" />
      <path d="M65 250 Q100 270 135 250" stroke="currentColor" strokeWidth="4" fill="none" />

      {/* Text: CCM */}
      <text 
        x="100" 
        y="310" 
        textAnchor="middle" 
        fill="currentColor" 
        fontSize="36" 
        fontWeight="bold" 
        fontFamily="serif" 
        letterSpacing="4"
      >
        CCM
      </text>

      {/* Text: ELEVATOR (Below the main shape) */}
      <text 
        x="100" 
        y="395" 
        textAnchor="middle" 
        fill="currentColor" 
        fontSize="14" 
        fontWeight="medium" 
        fontFamily="sans-serif" 
        letterSpacing="2"
      >
        — ELEVATOR —
      </text>
    </svg>
  );
};

export default CCMLogo;
