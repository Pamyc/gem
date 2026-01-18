
import React, { useMemo, useState, useRef } from 'react';
import { 
  Loader2, 
  MapPin, 
  Building, 
  ChevronDown, 
  ChevronRight,
  ArrowUpFromLine, 
  Layers,
  FileSignature,
  Building2
} from 'lucide-react';
import { useDataStore } from '../../contexts/DataContext';
import EditContractModal from './EditContractModal';

// Imported modular components and hooks
import { LiterNode, CityNode } from './helperContractsListView/types';
import { useContractsData } from './helperContractsListView/useContractsData';
import { DelayedTooltipWrapper, CityTooltipContent, JKTooltipContent } from './helperContractsListView/TooltipComponents';
import CityJKList from './helperContractsListView/CityJKList';
import LiterRow from './helperContractsListView/LiterRow';

interface ContractsListViewProps {
  isDarkMode: boolean;
}

const ContractsListView: React.FC<ContractsListViewProps> = ({ isDarkMode }) => {
  const { refreshData } = useDataStore();
  
  // Data from Hook
  const { data, isLoading } = useContractsData();

  // State
  const [expandedCities, setExpandedCities] = useState<Record<string, boolean>>({});
  const [expandedJKs, setExpandedJKs] = useState<Record<string, boolean>>({});
  const [expandedContractRows, setExpandedContractRows] = useState<Record<string, boolean>>({});
  
  // Refs for scrolling
  const cityRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // Modal State
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Dynamic Ordering ---
  const orderedData = useMemo(() => {
    const activeCity = Object.keys(expandedCities).find(k => expandedCities[k]);
    if (!activeCity) return data;

    const activeNode = data.find(node => node.name === activeCity);
    if (!activeNode) return data;

    const others = data.filter(node => node.name !== activeCity);
    return [activeNode, ...others];
  }, [data, expandedCities]);

  // --- Handlers ---

  const scrollToCity = (cityName: string) => {
      setTimeout(() => {
          const el = cityRefs.current.get(cityName);
          if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
      }, 150);
  };

  const toggleCity = (cityName: string) => {
    const isCurrentlyOpen = expandedCities[cityName];
    setExpandedJKs({});
    setExpandedContractRows({});

    if (isCurrentlyOpen) {
        setExpandedCities({});
    } else {
        setExpandedCities({ [cityName]: true });
        scrollToCity(cityName);
    }
  };

  const toggleJK = (uniqueJKId: string) => {
    setExpandedJKs(prev => ({ ...prev, [uniqueJKId]: !prev[uniqueJKId] }));
  };

  const toggleContractRow = (rowId: number) => {
      setExpandedContractRows(prev => ({ ...prev, [rowId]: !prev[rowId] }));
  };

  const handleEditClick = (liter: LiterNode) => {
      const nodeData = {
          dbId: liter.id,
          fullData: liter.fullData
      };
      setSelectedNode(nodeData);
      setIsModalOpen(true);
  };

  const handleDirectJump = (e: React.MouseEvent, cityName: string, jkUniqueId: string) => {
      e.stopPropagation(); 
      const isCityOpen = expandedCities[cityName];
      const isJKOpen = expandedJKs[jkUniqueId];

      if (isCityOpen && isJKOpen) {
          setExpandedCities({});
          setExpandedJKs({});
          setExpandedContractRows({});
      } else {
          if (!isCityOpen) {
             setExpandedJKs({}); 
             setExpandedContractRows({});
          }
          setExpandedCities({ [cityName]: true });
          setExpandedJKs(prev => ({ ...prev, [jkUniqueId]: true }));
          scrollToCity(cityName);
      }
  };

  if (isLoading) {
      return (
          <div className="flex flex-col items-center justify-center h-96 gap-4 text-indigo-500">
              <Loader2 className="animate-spin" size={40} />
              <span className="font-medium text-gray-500 dark:text-gray-400">Загрузка структуры...</span>
          </div>
      );
  }

  if (data.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-96 gap-4 text-gray-400">
              <Layers size={48} className="opacity-20" />
              <span>Нет данных для отображения</span>
          </div>
      );
  }

  return (
    <div className="pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {orderedData.map((city: CityNode) => {
                const isExpanded = !!expandedCities[city.name];
                
                return (
                    <div 
                        key={city.name}
                        ref={(el) => {
                            if (el) cityRefs.current.set(city.name, el);
                            else cityRefs.current.delete(city.name);
                        }}
                        className={`
                            bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden transition-all duration-300
                            ${isExpanded ? 'col-span-full ring-2 ring-indigo-500/20 shadow-xl z-10' : 'hover:-translate-y-1 hover:shadow-md'}
                        `}
                    >
                        {/* City Header */}
                        <div 
                            onClick={() => toggleCity(city.name)}
                            className={`
                                px-5 py-4 flex flex-col gap-3 cursor-pointer transition-colors relative
                                ${isExpanded ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-b border-indigo-100 dark:border-white/5' : 'hover:bg-gray-50 dark:hover:bg-white/5 h-full'}
                            `}
                        >
                            {/* Top Row: Icon + Name + Arrow */}
                            <div className="flex items-start justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
                                        ${isExpanded ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'}
                                    `}>
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-bold leading-tight ${isExpanded ? 'text-indigo-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                                            {city.name}
                                        </h3>
                                        
                                        {/* Collapsed Metrics (Visible only when NOT expanded) */}
                                        {!isExpanded && (
                                            <DelayedTooltipWrapper content={<CityTooltipContent city={city} />}>
                                                <div className="flex items-center gap-2 mt-1.5 overflow-x-auto scrollbar-none">
                                                    <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">
                                                        <Building size={10} className="text-gray-400" /> {city.jks.length}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/20 px-1.5 py-0.5 rounded font-medium">
                                                        <FileSignature size={10} /> {city.totalContracts}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[10px] text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/20 px-1.5 py-0.5 rounded font-medium">
                                                        <Building2 size={10} /> {city.totalLiters}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded font-medium">
                                                        <ArrowUpFromLine size={10} /> {city.totalElevators}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[10px] text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-500/20 px-1.5 py-0.5 rounded font-medium">
                                                        <Layers size={10} /> {city.totalFloors}
                                                    </span>
                                                </div>
                                            </DelayedTooltipWrapper>
                                        )}
                                    </div>
                                </div>

                                <div className={`p-1.5 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-white dark:bg-white/10 text-indigo-500' : 'text-gray-400'}`}>
                                    <ChevronDown size={18} />
                                </div>
                            </div>

                            {/* Expanded Metrics Header (Visible only when expanded) */}
                            {isExpanded && (
                                <DelayedTooltipWrapper content={<CityTooltipContent city={city} />}>
                                    <div className="flex flex-wrap gap-4 mt-1 px-1">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">ЖК</span>
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{city.jks.length}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Договоров</span>
                                            <span className="text-xs font-bold text-indigo-500">{city.totalContracts}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Литеров</span>
                                            <span className="text-xs font-bold text-orange-500">{city.totalLiters}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Лифтов</span>
                                            <span className="text-xs font-bold text-emerald-500">{city.totalElevators}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Этажей</span>
                                            <span className="text-xs font-bold text-fuchsia-500">{city.totalFloors}</span>
                                        </div>
                                    </div>
                                </DelayedTooltipWrapper>
                            )}

                            {/* Bottom Row: Quick Nav Buttons */}
                            <CityJKList 
                                city={city} 
                                expandedCities={expandedCities} 
                                expandedJKs={expandedJKs} 
                                handleDirectJump={handleDirectJump} 
                            />
                        </div>

                        {/* JKs Grid (Only visible when expanded) */}
                        {isExpanded && (
                            <div className="p-4 bg-gray-50/50 dark:bg-[#0b0f19]/30 border-t border-gray-100 dark:border-white/5 animate-in fade-in zoom-in-95 duration-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {city.jks.map((jk) => {
                                        const jkUniqueId = `${city.name}-${jk.name}`;
                                        const isJKExpanded = !!expandedJKs[jkUniqueId];

                                        return (
                                            <div 
                                                key={jkUniqueId} 
                                                className={`
                                                    bg-white dark:bg-[#151923] rounded-xl border transition-all duration-300 overflow-hidden flex flex-col
                                                    ${isJKExpanded ? 'border-indigo-200 dark:border-indigo-500/30 shadow-md ring-1 ring-indigo-500/10' : 'border-gray-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/30'}
                                                `}
                                                id={`jk-${jkUniqueId}`}
                                            >
                                                {/* JK Card Header */}
                                                <div 
                                                    onClick={() => toggleJK(jkUniqueId)}
                                                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group/jkheader relative"
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                                                        <div className={`p-2 rounded-lg shrink-0 ${isJKExpanded ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                                                            <Building size={16} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate" title={jk.name}>{jk.name}</div>
                                                            
                                                            <DelayedTooltipWrapper content={<JKTooltipContent jk={jk} />}>
                                                                <div className="flex gap-2 text-[10px] text-gray-400 mt-0.5 font-medium overflow-hidden">
                                                                    <span className="flex items-center gap-1 text-indigo-500 whitespace-nowrap"><FileSignature size={8}/> {jk.totalContracts}</span>
                                                                    <span className="flex items-center gap-1 text-orange-500 whitespace-nowrap"><Building2 size={8}/> {jk.totalLiters}</span>
                                                                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 whitespace-nowrap"><ArrowUpFromLine size={8}/> {jk.totalElevators}</span>
                                                                    <span className="flex items-center gap-1 text-fuchsia-600 dark:text-fuchsia-400 whitespace-nowrap"><Layers size={8}/> {jk.totalFloors}</span>
                                                                </div>
                                                            </DelayedTooltipWrapper>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className={`text-gray-400 transition-transform duration-200 ${isJKExpanded ? 'rotate-90 text-indigo-500' : ''}`}>
                                                        <ChevronRight size={16} />
                                                    </div>
                                                </div>

                                                {/* Liters List (Expanded) */}
                                                {isJKExpanded && (
                                                    <div className="border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-black/10 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                        {jk.liters.map((liter) => (
                                                            <LiterRow 
                                                              key={liter.id} 
                                                              liter={liter}
                                                              expandedContractRows={expandedContractRows}
                                                              toggleContractRow={toggleContractRow}
                                                              handleEditClick={handleEditClick}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

        {selectedNode && (
            <EditContractModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                nodeData={selectedNode}
                onSuccess={refreshData}
            />
        )}
    </div>
  );
};

export default ContractsListView;
