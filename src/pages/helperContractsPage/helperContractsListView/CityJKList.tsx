
import React from 'react';
import { CornerDownRight } from 'lucide-react';
import { CityNode } from './types';

interface CityJKListProps {
    city: CityNode;
    expandedCities: Record<string, boolean>;
    expandedJKs: Record<string, boolean>;
    handleDirectJump: (e: React.MouseEvent, cityName: string, jkUniqueId: string) => void;
}

const CityJKList: React.FC<CityJKListProps> = ({ city, expandedCities, expandedJKs, handleDirectJump }) => {
    return (
        <div 
            className="flex flex-wrap gap-2 mt-auto overflow-hidden transition-all relative"
            style={{ maxHeight: '142px' }} // Визуальный ограничитель
        >
            {city.jks.map((jk) => {
                const uniqueId = `${city.name}-${jk.name}`;
                const isJKOpen = expandedCities[city.name] && expandedJKs[uniqueId];
                
                return (
                    <button
                        key={jk.name}
                        onClick={(e) => handleDirectJump(e, city.name, uniqueId)}
                        className={`
                            flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border shrink-0
                            ${isJKOpen 
                                ? 'bg-indigo-100 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30' 
                                : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-indigo-400'
                            }
                        `}
                        title={jk.name} // Показываем полное имя при наведении
                    >
                        <span className="truncate max-w-[120px]">{jk.name}</span>
                        <CornerDownRight size={10} className={`shrink-0 ${isJKOpen ? "rotate-90 transition-transform" : "transition-transform"}`} />
                    </button>
                );
            })}
        </div>
    );
};

export default CityJKList;
