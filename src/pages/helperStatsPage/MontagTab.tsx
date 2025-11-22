import React from 'react';
import { Hammer } from 'lucide-react';

interface MontagTabProps {
  isDarkMode: boolean;
}

const MontagTab: React.FC<MontagTabProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-[#151923] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
       <Hammer size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
       <p className="text-gray-500 dark:text-gray-400 font-medium">Данные по монтажу</p>
    </div>
  );
};

export default MontagTab;