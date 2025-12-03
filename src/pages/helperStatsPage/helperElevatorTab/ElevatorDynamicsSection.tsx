
import React from 'react';
import { CalendarRange } from 'lucide-react';
import ElevatorsByYearChart from './ElevatorsByYearChart';

interface ElevatorDynamicsSectionProps {
  isDarkMode: boolean;
  selectedCity: string;
}

const ElevatorDynamicsSection: React.FC<ElevatorDynamicsSectionProps> = ({ isDarkMode, selectedCity }) => {
  return (
    <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 dark:bg-orange-500/20 rounded-xl text-orange-600 dark:text-orange-400">
            <CalendarRange size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              Динамика объёма по годам
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Ввод лифтов (шт.) с разбивкой по Жилым Комплексам
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">
        <ElevatorsByYearChart 
            isDarkMode={isDarkMode} 
            selectedCity={selectedCity}
        />
      </div>
    </div>
  );
};

export default ElevatorDynamicsSection;
