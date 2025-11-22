import React from 'react';
import { Banknote } from 'lucide-react';

interface FinanceTabProps {
  isDarkMode: boolean;
}

const FinanceTab: React.FC<FinanceTabProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-[#151923] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
       <Banknote size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
       <p className="text-gray-500 dark:text-gray-400 font-medium">Финансовые показатели</p>
    </div>
  );
};

export default FinanceTab;