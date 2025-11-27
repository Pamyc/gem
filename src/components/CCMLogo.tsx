import React from 'react';
import { getImgByName } from '../utils/driveUtils';

interface CCMLogoProps {
  className?: string;
}

export const CCMLogo: React.FC<CCMLogoProps> = ({ className = "" }) => {
  // Получаем ссылку на изображение логотипа. 
  // 'w1000' обеспечит достаточное качество для логотипа.
  const logoUrl = getImgByName('logo_main', 'w2000');

  if (!logoUrl) {
    return (
      <div className={`flex items-center justify-center border border-dashed border-gray-500/50 rounded ${className}`}>
        <span className="text-[100px] font-mono">Logo Missing</span>
      </div>
    );
  }

  return (
    <img 
      src={logoUrl} 
      alt="CCM Elevator Logo" 
      className={`w-full h-full object-contain object-center ${className}`}
    />
  );
};

export default CCMLogo;