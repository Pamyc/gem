import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CardElement, CardConfig } from '../../../types/card';
import { CalculationResult } from '../../../components/cards/DynamicCard';
import { useDataStore } from '../../../contexts/DataContext';
import { calculateCardMetrics } from '../../../utils/cardCalculation';
import ResizeHandle from './ResizeHandle';
import ElementContent from './ElementContent';

interface DraggableElementProps {
  element: CardElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CardElement['style']>) => void;
  data: CalculationResult;
  config: CardConfig; 
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const DraggableElement: React.FC<DraggableElementProps> = ({ 
  element, 
  isSelected, 
  onSelect, 
  onUpdate,
  data: globalData,
  config
}) => {
  const { googleSheets, sheetConfigs } = useDataStore();

  // State
  const [interactionState, setInteractionState] = useState<'idle' | 'dragging' | 'resizing'>('idle');
  const [resizeDir, setResizeDir] = useState<string | null>(null);

  // Refs for tracking start positions to avoid closure staleness during window events
  const startPos = useRef({ x: 0, y: 0 }); // Mouse start
  const elemStart = useRef({ top: 0, left: 0, width: 0, height: 0 }); // Element start

  // --- DATA CALCULATION ---
  // If this element overrides data settings, calculate its own value. Otherwise use global.
  const displayData = useMemo(() => {
     if (element.type === 'value' && element.dataSettings) {
         return calculateCardMetrics(googleSheets, sheetConfigs, config, element.dataSettings);
     }
     return globalData;
  }, [element.dataSettings, element.type, globalData, googleSheets, sheetConfigs, config]);


  // --- MOUSE HANDLERS ---

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(element.id);
    
    setInteractionState('dragging');
    startPos.current = { x: e.clientX, y: e.clientY };
    elemStart.current = { 
        top: element.style.top, 
        left: element.style.left, 
        width: 0, 
        height: 0 
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent, dir: string) => {
    e.stopPropagation();
    // parse current width/height or default to estimated if auto
    const currentWidth = typeof element.style.width === 'number' ? element.style.width : 100;
    const currentHeight = typeof element.style.height === 'number' ? element.style.height : 50;

    setInteractionState('resizing');
    setResizeDir(dir);
    
    startPos.current = { x: e.clientX, y: e.clientY };
    elemStart.current = { 
        top: element.style.top, 
        left: element.style.left, 
        width: currentWidth, 
        height: currentHeight 
    };
  };

  // --- GLOBAL EVENT LISTENER ---

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (interactionState === 'idle') return;

      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      if (interactionState === 'dragging') {
        let newTop = elemStart.current.top + deltaY;
        let newLeft = elemStart.current.left + deltaX;

        // Snap to grid (5px)
        newTop = Math.round(newTop / 5) * 5;
        newLeft = Math.round(newLeft / 5) * 5;

        onUpdate(element.id, { top: newTop, left: newLeft });
      } 
      else if (interactionState === 'resizing' && resizeDir) {
        let newTop = elemStart.current.top;
        let newLeft = elemStart.current.left;
        let newWidth = elemStart.current.width;
        let newHeight = elemStart.current.height;

        // Calculate changes based on direction
        if (resizeDir.includes('e')) { // East (Right)
            newWidth = Math.max(10, elemStart.current.width + deltaX);
        }
        if (resizeDir.includes('s')) { // South (Bottom)
            newHeight = Math.max(10, elemStart.current.height + deltaY);
        }
        if (resizeDir.includes('w')) { // West (Left)
            const maxDelta = elemStart.current.width - 10; // Prevent flipping
            const effectiveDelta = Math.min(deltaX, maxDelta);
            newWidth = elemStart.current.width - effectiveDelta;
            newLeft = elemStart.current.left + effectiveDelta;
        }
        if (resizeDir.includes('n')) { // North (Top)
            const maxDelta = elemStart.current.height - 10;
            const effectiveDelta = Math.min(deltaY, maxDelta);
            newHeight = elemStart.current.height - effectiveDelta;
            newTop = elemStart.current.top + effectiveDelta;
        }

        // Snap
        if (resizeDir.includes('w')) newLeft = Math.round(newLeft / 5) * 5;
        if (resizeDir.includes('n')) newTop = Math.round(newTop / 5) * 5;
        newWidth = Math.round(newWidth / 5) * 5;
        newHeight = Math.round(newHeight / 5) * 5;

        onUpdate(element.id, { 
            top: newTop, 
            left: newLeft, 
            width: newWidth, 
            height: newHeight 
        });
      }
    };

    const handleMouseUp = () => {
      setInteractionState('idle');
      setResizeDir(null);
    };

    if (interactionState !== 'idle') {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [interactionState, resizeDir, element.id, onUpdate]);

  // --- STYLES ---
  const style: React.CSSProperties = {
      position: 'absolute',
      top: `${element.style.top}px`,
      left: `${element.style.left}px`,
      width: element.style.width === 'auto' ? 'auto' : `${element.style.width}px`,
      height: element.style.height === 'auto' ? 'auto' : `${element.style.height}px`,
      
      fontSize: element.style.fontSize ? `${element.style.fontSize}px` : undefined,
      fontWeight: element.style.fontWeight || 'normal',
      color: element.style.color,
      backgroundColor: element.style.backgroundColor,
      borderRadius: element.style.borderRadius ? `${element.style.borderRadius}px` : undefined,
      
      zIndex: element.style.zIndex || 1,
      textAlign: element.style.textAlign || 'left',
      padding: element.style.padding ? `${element.style.padding}px` : undefined,
      opacity: element.style.opacity,
      
      cursor: interactionState === 'dragging' ? 'grabbing' : 'grab',
      border: isSelected ? '1px dashed #6366f1' : '1px dashed transparent',
      boxShadow: isSelected ? '0 0 0 1px rgba(99, 102, 241, 0.2)' : 'none',
      
      whiteSpace: 'nowrap',
      userSelect: 'none',
      lineHeight: 1.2
  };

  return (
    <div 
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
      style={style}
      className={`transition-shadow group ${isSelected ? 'z-[100]' : ''}`}
    >
      {/* Element Content */}
      <div className="w-full h-full pointer-events-none flex items-center justify-center">
         <ElementContent element={element} config={config} displayData={displayData} />
      </div>

      {/* Resize Handles (Only when selected) */}
      {isSelected && (
        <>
            <ResizeHandle dir="nw" onMouseDown={handleResizeMouseDown} />
            <ResizeHandle dir="ne" onMouseDown={handleResizeMouseDown} />
            <ResizeHandle dir="sw" onMouseDown={handleResizeMouseDown} />
            <ResizeHandle dir="se" onMouseDown={handleResizeMouseDown} />
             
            {/* Info Badge */}
            <div className="absolute -top-6 left-0 bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm opacity-90 pointer-events-none whitespace-nowrap z-50">
                {element.type} ({Math.round(Number(element.style.left))}, {Math.round(Number(element.style.top))}) 
                {typeof element.style.width === 'number' && ` [${Math.round(element.style.width)}x${Math.round(Number(element.style.height))}]`}
            </div>
        </>
      )}
    </div>
  );
};

export default DraggableElement;