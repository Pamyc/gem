import React from 'react';

interface ResizeHandleProps {
  dir: string;
  onMouseDown: (e: React.MouseEvent, dir: string) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ dir, onMouseDown }) => {
  let cursor = 'nwse-resize';
  if (dir === 'ne' || dir === 'sw') cursor = 'nesw-resize';
  
  const posStyles: React.CSSProperties = {};
  if (dir.includes('n')) posStyles.top = '-4px';
  if (dir.includes('s')) posStyles.bottom = '-4px';
  if (dir.includes('w')) posStyles.left = '-4px';
  if (dir.includes('e')) posStyles.right = '-4px';

  return (
    <div 
      className="absolute w-2 h-2 bg-white border border-indigo-600 z-50 rounded-sm"
      style={{ ...posStyles, cursor }}
      onMouseDown={(e) => onMouseDown(e, dir)}
    />
  );
};

export default ResizeHandle;