
import React from 'react';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { LiterItem } from './useContractLogic';

interface LitersListProps {
  liters: LiterItem[];
  totalElevators: number;
  totalFloors: number;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof LiterItem, value: any) => void;
}

const LitersList: React.FC<LitersListProps> = ({ 
  liters, 
  totalElevators, 
  totalFloors, 
  onAdd, 
  onRemove, 
  onUpdate 
}) => {
  return (
    <div className="space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                    <Layers size={16} />
                </div>
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Состав литеров</h4>
            </div>
            <div className="flex gap-2 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                <span>{totalElevators} лифтов</span>
                <span>•</span>
                <span>{totalFloors} этажей</span>
            </div>
        </div>

        <div className="bg-white dark:bg-[#0b0f19] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_80px_32px] gap-2 px-3 py-2 bg-gray-50 dark:bg-white/5 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100 dark:border-white/5">
                <span>Название литера</span>
                <span>Лифтов</span>
                <span>Этажей</span>
                <span></span>
            </div>
            
            {/* List */}
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1 space-y-1">
                {liters.map((liter, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_80px_80px_32px] gap-2 items-center group">
                        <input 
                            type="text" 
                            value={liter.name}
                            onChange={(e) => onUpdate(idx, 'name', e.target.value)}
                            className="bg-gray-50 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-black/20 focus:border-indigo-500 border rounded px-2 py-1.5 text-xs outline-none transition-all"
                            placeholder="Название"
                        />
                        <input 
                            type="number" 
                            value={liter.elevators}
                            onChange={(e) => onUpdate(idx, 'elevators', e.target.value)}
                            className="bg-gray-50 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-black/20 focus:border-indigo-500 border rounded px-2 py-1.5 text-xs outline-none transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                            min="0"
                        />
                        <input 
                            type="number" 
                            value={liter.floors}
                            onChange={(e) => onUpdate(idx, 'floors', e.target.value)}
                            className="bg-gray-50 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-black/20 focus:border-indigo-500 border rounded px-2 py-1.5 text-xs outline-none transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                            min="0"
                        />
                        <button 
                            onClick={() => onRemove(idx)}
                            className="flex items-center justify-center w-7 h-7 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
            
            {/* Add Button */}
            <button 
                onClick={onAdd}
                className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors border-t border-gray-100 dark:border-white/5"
            >
                <Plus size={14} /> Добавить литер
            </button>
        </div>
    </div>
  );
};

export default LitersList;
