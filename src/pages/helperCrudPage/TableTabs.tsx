
import React, { useRef, useState } from 'react';
import { Loader2, GripVertical } from 'lucide-react';

interface TableTabsProps {
  tables: string[];
  activeTable: string | null;
  onSelectTable: (table: string) => void;
  loading: boolean;
  onReorder?: (newOrder: string[]) => void;
}

const TableTabs: React.FC<TableTabsProps> = ({ tables, activeTable, onSelectTable, loading, onReorder }) => {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, position: number) => {
    dragItem.current = position;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    // Make transparent image for drag (optional, improves feel)
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLButtonElement>, position: number) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (dragItem.current !== null && dragOverItem.current !== null && onReorder) {
        const copyListItems = [...tables];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);
        
        onReorder(copyListItems);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div className="flex items-center border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#1e293b] px-2 pt-2 gap-1 overflow-x-auto custom-scrollbar shrink-0 h-14 hover-scrollbar select-none">
      {tables.length === 0 && !loading && (
          <div className="px-4 text-sm text-gray-400 italic">Нет таблиц</div>
      )}
      {loading && (
          <div className="px-4 flex items-center gap-2 text-sm text-indigo-500"><Loader2 className="animate-spin" size={14}/> Загрузка...</div>
      )}
      {tables.map((table, index) => (
          <button
            key={table}
            draggable={!!onReorder}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => onSelectTable(table)}
            className={`
                group relative px-4 py-2.5 rounded-t-xl text-sm font-bold transition-all whitespace-nowrap border-t border-x border-transparent top-[1px] flex items-center gap-2
                ${activeTable === table
                  ? 'bg-white dark:bg-[#151923] text-indigo-600 dark:text-indigo-400 border-gray-200 dark:border-white/10 border-b-white dark:border-b-[#151923] z-10'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                }
                ${isDragging && dragItem.current === index ? 'opacity-50 scale-95' : 'opacity-100'}
            `}
          >
            {onReorder && (
                <span className="cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-gray-400">
                    <GripVertical size={12} />
                </span>
            )}
            {table}
          </button>
      ))}
    </div>
  );
};

export default TableTabs;
