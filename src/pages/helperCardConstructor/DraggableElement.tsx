import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { CardElement, CardConfig } from '../../types/card';
import { CalculationResult } from '../../components/cards/DynamicCard';
import { useDataStore } from '../../contexts/DataContext';
import { calculateCardMetrics } from '../../utils/cardCalculation';

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
  config,
  containerRef
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
    // parse current width/height or default to estimated if auto (though auto makes resizing weird, we assume numeric for resized items)
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


  // --- CONTENT RENDERING ---
  let content: React.ReactNode = null;
  
  if (element.type === 'value') {
    if (element.dataBind === 'min') content = displayData.minValue;
    else if (element.dataBind === 'max') content = displayData.maxValue;
    else content = displayData.displayValue;
  } else if (element.type === 'title') {
    content = config.title;
  } else if (element.type === 'text') {
    content = element.content || 'Текст';
  } else if (element.type === 'trend') {
    const TrendIcon = config.trendDirection === 'up' ? Icons.TrendingUp : 
                      config.trendDirection === 'down' ? Icons.TrendingDown : Icons.Minus;
    content = (
      <div className="flex items-center gap-1">
         <TrendIcon size={element.style.fontSize || 14} />
         <span>{config.trendValue}</span>
      </div>
    );
  } else if (element.type === 'icon') {
      const IconName = element.iconName || config.icon || 'HelpCircle';
      const IconComponent = (Icons as any)[IconName] || Icons.HelpCircle;
      // If width is explicitly set via resize, allow it to control svg size, otherwise font size
      const iconSize = typeof element.style.width === 'number' ? '100%' : (element.style.fontSize || 24);
      content = <IconComponent size={iconSize} />;
  } else if (element.type === 'shape') {
      content = null; 
  }

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

  // Resize Handle Component
  const ResizeHandle = ({ dir }: { dir: string }) => {
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
           onMouseDown={(e) => handleResizeMouseDown(e, dir)}
        />
    );
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
         {content}
      </div>

      {/* Resize Handles (Only when selected) */}
      {isSelected && (
        <>
            <ResizeHandle dir="nw" />
            <ResizeHandle dir="ne" />
            <ResizeHandle dir="sw" />
            <ResizeHandle dir="se" />
             
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