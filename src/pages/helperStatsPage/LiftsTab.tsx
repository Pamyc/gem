import React from 'react';
import { ArrowUpFromLine } from 'lucide-react';

interface LiftsTabProps {
  isDarkMode: boolean;
}

const LiftsTab: React.FC<LiftsTabProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-[#151923] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
       <ArrowUpFromLine size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
       <p className="text-gray-500 dark:text-gray-400 font-medium">Статистика по лифтам будет здесь</p>
       <p className="text-sm text-gray-400 mt-1">Настройте графики в конструкторе</p>
    </div>
  );
};

export default LiftsTab;