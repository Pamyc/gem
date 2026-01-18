
import React, { useState } from 'react';
import { FileSignature, Plus } from 'lucide-react';
import ContractsListView from './helperContractsPage/ContractsListView';
import ContractsSummary from './helperContractsPage/ContractsSummary';
import EditContractModal from './helperContractsPage/EditContractModal';
import { useDataStore } from '../contexts/DataContext';

interface ContractsPageProps {
  isDarkMode: boolean;
}

const ContractsPage: React.FC<ContractsPageProps> = ({ isDarkMode }) => {
  const { refreshData } = useDataStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="w-full h-[calc(100vh-8rem)] flex flex-col p-2 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <FileSignature className="text-indigo-500" />
          Реестр договоров
        </h2>
        
        <button 
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={18} />
          Создать договор
        </button>
      </div>

      {/* Summary Stats */}
      <div className="shrink-0">
        <ContractsSummary />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto hover-scrollbar relative pb-10">
         <ContractsListView isDarkMode={isDarkMode} />
      </div>

      {/* Create Modal */}
      <EditContractModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refreshData}
        // nodeData не передаем, что активирует режим создания
      />
    </div>
  );
};

export default ContractsPage;
