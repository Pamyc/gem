
import React from 'react';
import { ChevronRight, Edit2 } from 'lucide-react';
import { LiterNode } from './types';

interface LiterRowProps {
    liter: LiterNode;
    level?: number;
    expandedContractRows: Record<number, boolean>;
    toggleContractRow: (rowId: number) => void;
    handleEditClick: (liter: LiterNode) => void;
}

const LiterRow: React.FC<LiterRowProps> = ({ 
    liter, 
    level = 0, 
    expandedContractRows, 
    toggleContractRow, 
    handleEditClick 
}) => {
    const hasChildren = liter.children && liter.children.length > 0;
    const isExpanded = !!expandedContractRows[liter.id];
    const paddingLeft = level * 16 + 12;

    return (
        <>
          <div 
              className={`
                  px-3 py-2 flex items-center justify-between border-b border-gray-100 dark:border-white/5 last:border-0 transition-colors group
                  ${hasChildren ? 'bg-gray-50/80 dark:bg-white/5 cursor-pointer' : 'hover:bg-white dark:hover:bg-white/5'}
              `}
              onClick={hasChildren ? (e) => { e.stopPropagation(); toggleContractRow(liter.id); } : undefined}
              style={{ paddingLeft: `${paddingLeft}px` }}
          >
              <div className="flex items-center gap-2 min-w-0">
                  {hasChildren && (
                      <div className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90 text-indigo-500' : ''}`}>
                          <ChevronRight size={14} />
                      </div>
                  )}
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${liter.isAggregate || hasChildren ? 'bg-orange-400' : 'bg-gray-300 group-hover:bg-indigo-500'}`}></div>
                  <p className={`text-xs font-medium truncate ${liter.isAggregate || hasChildren ? 'text-gray-800 dark:text-gray-200 font-bold' : 'text-gray-700 dark:text-gray-300'}`} title={liter.name}>
                      {liter.name}
                  </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                  <div className="text-[10px] font-mono text-gray-500 bg-white dark:bg-white/5 px-1.5 py-0.5 rounded border border-gray-100 dark:border-white/5">
                      {liter.elevators} л.
                  </div>
                  {/* Кнопка редактирования только для родительских/корневых элементов */}
                  {level === 0 && (
                      <button 
                          onClick={(e) => { e.stopPropagation(); handleEditClick(liter); }}
                          className="p-1 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all"
                          title="Редактировать"
                      >
                          <Edit2 size={12} />
                      </button>
                  )}
              </div>
          </div>
          {hasChildren && isExpanded && (
              <div className="border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-black/10">
                  {liter.children!.map(child => (
                      <LiterRow 
                        key={child.id} 
                        liter={child} 
                        level={level + 1} 
                        expandedContractRows={expandedContractRows}
                        toggleContractRow={toggleContractRow}
                        handleEditClick={handleEditClick}
                      />
                  ))}
              </div>
          )}
        </>
    );
};

export default LiterRow;
