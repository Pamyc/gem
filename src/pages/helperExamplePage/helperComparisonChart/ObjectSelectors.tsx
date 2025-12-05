
import React from 'react';
import { METRICS } from './constants';

interface ObjectSelectorsProps {
  mode: 'controls' | 'labels';
  itemA: string;
  setItemA: (v: string) => void;
  itemB: string;
  setItemB: (v: string) => void;
  availableItems: string[];
}

const selectClass = "bg-transparent text-sm font-bold text-gray-800 dark:text-white outline-none cursor-pointer w-full py-1 border-b border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 transition-colors";
const optionClass = "bg-white dark:bg-[#1e293b] text-gray-800 dark:text-white";

const ObjectSelectors: React.FC<ObjectSelectorsProps> = ({ 
  mode, itemA, setItemA, itemB, setItemB, availableItems 
}) => {
  
  if (mode === 'controls') {
    return (
        <div className="flex items-center justify-between mb-4 px-1">
            {/* Side A */}
            <div className="w-[35%] flex flex-col gap-1 items-end text-right border-r-4 border-red-500/50 pr-4">
                <span className="text-xs text-red-500 font-bold uppercase tracking-wider">Объект А</span>
                <select 
                    value={itemA} 
                    onChange={(e) => setItemA(e.target.value)}
                    className={selectClass}
                    style={{ textAlign: 'right', direction: 'rtl' }} 
                >
                    <option value="" disabled className={optionClass}>Выберите...</option>
                    {availableItems.map(item => (
                        <option key={item} value={item} className={optionClass}>{item}</option>
                    ))}
                </select>
            </div>

            {/* VS Badge */}
            <div className="w-[20%] flex justify-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-black text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-white/10 shadow-inner">
                    VS
                </div>
            </div>

            {/* Side B */}
            <div className="w-[35%] flex flex-col gap-1 items-start text-left border-l-4 border-blue-500/50 pl-4">
                <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">Объект Б</span>
                <select 
                    value={itemB} 
                    onChange={(e) => setItemB(e.target.value)}
                    className={selectClass}
                >
                    <option value="" disabled className={optionClass}>Выберите...</option>
                    {availableItems.map(item => (
                        <option key={item} value={item} className={optionClass}>{item}</option>
                    ))}
                </select>
            </div>
        </div>
    );
  }

  // mode === 'labels'
  return (
    <div 
        className="absolute top-[40px] bottom-[30px] left-1/2 -translate-x-1/2 w-[25%] pointer-events-none z-10"
        style={{ 
            display: 'grid', 
            gridTemplateRows: `repeat(${METRICS.length}, 1fr)`,
            alignItems: 'center',
            justifyItems: 'center'
        }}
    >
        {METRICS.map(m => (
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
