import React, { useState, useRef, useEffect } from 'react';
import { METRICS } from './constants';
import { TreeOption } from './types';
import { ChevronDown, ChevronRight, Check, Search } from 'lucide-react';

interface ObjectSelectorsProps {
  mode: 'controls' | 'labels';
  itemA: string;
  setItemA: (v: string) => void;
  itemB: string;
  setItemB: (v: string) => void;
  availableItems: TreeOption[];
  visibleMetrics?: string[];
}

// --- Tree Select Components ---

const TreeItem: React.FC<{
  option: TreeOption;
  depth: number;
  onSelect: (val: string) => void;
  selectedValue: string;
  searchQuery: string;
}> = ({ option, depth, onSelect, selectedValue, searchQuery }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Auto-expand if searchQuery matches a child
  useEffect(() => {
    if (searchQuery && option.children) {
      const hasMatch = (nodes: TreeOption[]): boolean => {
        return nodes.some(n => 
          n.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (n.children && hasMatch(n.children))
        );
      };
      if (hasMatch(option.children)) {
        setIsExpanded(true);
      }
    }
  }, [searchQuery, option.children]);

  const hasChildren = option.children && option.children.length > 0;
  const isLeaf = !hasChildren && option.value;
  const isSelected = isLeaf && option.value === selectedValue;

  // Filter visibility based on search
  const isVisible = !searchQuery || 
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (option.children && option.children.some(c => 
       c.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
       (c.children && JSON.stringify(c).toLowerCase().includes(searchQuery.toLowerCase()))
    ));

  if (!isVisible) return null;

  return (
    <div className="select-none">
      <div 
        className={`flex items-center px-3 py-2 cursor-pointer transition-colors ${
          isSelected 
            ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold' 
            : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200'
        }`}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          } else if (option.value) {
            onSelect(option.value);
          }
        }}
      >
        {hasChildren && (
          <span className="mr-1 text-gray-400">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
        {!hasChildren && <span className="w-4 mr-1"></span>}
        
        <span className="truncate flex-1">{option.label}</span>
        {isSelected && <Check size={14} className="text-indigo-600 dark:text-indigo-400 ml-2" />}
      </div>

      {hasChildren && isExpanded && (
        <div className="border-l border-gray-100 dark:border-white/5 ml-4">
          {option.children!.map((child, idx) => (
            <TreeItem 
              key={`${child.label}-${idx}`} 
              option={child} 
              depth={depth + 1} 
              onSelect={onSelect} 
              selectedValue={selectedValue}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CustomTreeSelect: React.FC<{
  value: string;
  onChange: (val: string) => void;
  options: TreeOption[];
  align: 'left' | 'right';
  labelColorClass: string;
}> = ({ value, onChange, options, align, labelColorClass }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-2 bg-transparent text-sm font-bold border-b border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 transition-colors outline-none flex items-center justify-between gap-2 ${labelColorClass} ${align === 'right' ? 'flex-row-reverse' : ''}`}
      >
        <span className={`truncate ${align === 'right' ? 'text-right' : 'text-left'}`}>{value || 'Выберите объект...'}</span>
        <ChevronDown size={14} className="opacity-50" />
      </button>

      {isOpen && (
        <div 
          className={`absolute top-full mt-2 w-[300px] max-h-[400px] bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 z-[100] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {/* Search */}
          <div className="p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#151923]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0f19] text-gray-800 dark:text-gray-200 outline-none focus:border-indigo-500 transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Tree List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
            {options.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">Нет данных для выбора</div>
            ) : (
                options.map((opt, idx) => (
                <TreeItem 
                    key={`${opt.label}-${idx}`} 
                    option={opt} 
                    depth={0} 
                    onSelect={(val) => { onChange(val); setIsOpen(false); }} 
                    selectedValue={value}
                    searchQuery={search}
                />
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main ObjectSelectors Component ---

const ObjectSelectors: React.FC<ObjectSelectorsProps> = ({ 
  mode, itemA, setItemA, itemB, setItemB, availableItems, visibleMetrics = [] 
}) => {
  
  if (mode === 'controls') {
    return (
        <div className="flex items-center justify-between mb-4 px-1 relative z-20">
            {/* Side A */}
            <div className="w-[45%] flex flex-col gap-1 items-end text-right border-r-4 border-red-500/50 pr-4">
                <span className="text-xs text-red-500 font-bold uppercase tracking-wider">Объект А</span>
                <CustomTreeSelect 
                    value={itemA} 
                    onChange={setItemA} 
                    options={availableItems} 
                    align="right"
                    labelColorClass="text-gray-800 dark:text-white"
                />
            </div>

            {/* Spacer */}
            <div className="w-[10%]"></div>

            {/* Side B */}
            <div className="w-[45%] flex flex-col gap-1 items-start text-left border-l-4 border-blue-500/50 pl-4">
                <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">Объект Б</span>
                <CustomTreeSelect 
                    value={itemB} 
                    onChange={setItemB} 
                    options={availableItems} 
                    align="left"
                    labelColorClass="text-gray-800 dark:text-white"
                />
            </div>
        </div>
    );
  }

  // Filter labels
  const activeMetrics = METRICS.filter(m => visibleMetrics.includes(m.key));

  // mode === 'labels'
  return (
    <div 
        className="absolute top-[40px] bottom-[20px] left-1/2 -translate-x-1/2 w-[25%] pointer-events-none z-10"
        style={{ 
            display: 'grid', 
            gridTemplateRows: `repeat(${activeMetrics.length}, 1fr)`,
            alignItems: 'center',
            justifyItems: 'center'
        }}
    >
        {activeMetrics.map(m => (
            <div key={m.key} className="flex flex-col items-center justify-center bg-white dark:bg-[#1e293b] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm min-w-[140px] backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase text-center leading-tight">
                    {m.label}
                </span>
            </div>
        ))}
    </div>
  );
};

export default ObjectSelectors;