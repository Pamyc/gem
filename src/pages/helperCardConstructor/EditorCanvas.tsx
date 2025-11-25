import React from 'react';
import { MousePointer2, Plus, Calculator, LayoutTemplate, Code } from 'lucide-react';
import { CardConfig, CardElement } from '../../types/card';
import { CalculationResult } from '../../components/cards/DynamicCard';
import DraggableElement from './helperDraggableElement';

interface EditorCanvasProps {
  config: CardConfig;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  onAddElement: (type: CardElement['type']) => void;
  onElementUpdate: (id: string, updates: Partial<CardElement> | Partial<CardElement['style']>) => void;
  previewData: CalculationResult;
  containerRef: React.RefObject<HTMLDivElement | null>;
  editorBackground: string;
  onOpenCodeModal: () => void;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({
  config,
  selectedElementId,
  setSelectedElementId,
  onAddElement,
  onElementUpdate,
  previewData,
  containerRef,
  editorBackground,
  onOpenCodeModal
}) => {
  return (
    <div className="flex-1 bg-white dark:bg-[#151923] rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 p-6 flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Интерактивный редактор</span>
          <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
            <MousePointer2 size={10} /> Drag & Resize
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onAddElement('text')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-500" title="Добавить текст"><Plus size={16} /></button>
          <button onClick={() => onAddElement('value')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-500" title="Добавить значение"><Calculator size={16} /></button>
          <button onClick={() => onAddElement('icon')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-500" title="Добавить иконку"><LayoutTemplate size={16} /></button>
        </div>
      </div>

      <div 
        className="flex-1 w-full bg-gray-50 dark:bg-[#0b0f19] rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/5 flex items-center justify-center relative overflow-hidden user-select-none"
        onClick={() => setSelectedElementId(null)}
        ref={containerRef}
      >
        {/* The Card Container */}
        <div 
          style={{
            width: config.width,
            height: config.height,
            background: editorBackground,
            borderColor: config.borderColor,
            borderWidth: config.borderColor ? 1 : 0,
            borderStyle: 'solid',
            position: 'relative',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            borderRadius: 16,
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()} // Prevent deselect when clicking card bg
        >
          {config.elements.map(el => (
            <DraggableElement 
              key={el.id}
              element={el}
              isSelected={selectedElementId === el.id}
              onSelect={setSelectedElementId}
              onUpdate={onElementUpdate}
              data={previewData}
              config={config}
              containerRef={containerRef}
            />
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button 
          onClick={onOpenCodeModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Code size={18} /> Получить код
        </button>
      </div>
    </div>
  );
};

export default EditorCanvas;