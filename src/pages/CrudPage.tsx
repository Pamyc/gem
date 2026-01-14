
import React from 'react';
import { Server, Plus, RefreshCw, Trash2, Table } from 'lucide-react';
import { useCrudLogic } from './helperCrudPage/useCrudLogic';

import DatabaseSidebar from './helperCrudPage/DatabaseSidebar';
import TableTabs from './helperCrudPage/TableTabs';
import SchemaSection from './helperCrudPage/SchemaSection';
import DataSection from './helperCrudPage/DataSection';
import CreateTableModal from './helperCrudPage/CreateTableModal';
import AddRowModal from './helperCrudPage/AddRowModal';

const CrudPage: React.FC = () => {
  const {
    // State
    databases, tables, selectedDb, activeTable,
    loadingDb, loadingTables, error,
    tableSchema, tableRows, totalRows, loadingData, loadingSchema,
    page, pageSize,
    isSchemaOpen, isDataOpen,
    actionLoading,
    isCreateModalOpen, isAddRowModalOpen,

    // Setters
    setSelectedDb, setActiveTable, setPage, setPageSize,
    setIsSchemaOpen, setIsDataOpen,
    setIsCreateModalOpen, setIsAddRowModalOpen,

    // Handlers
    refreshDatabases,
    handleCreateTable,
    handleDeleteTable,
    handleAddColumn,
    handleRenameColumn,
    handleDeleteColumn,
    handleInsertRow,
    handleUpdateCell,
    handleDeleteRow,
    handleTableReorder
  } = useCrudLogic();

  return (
    <div className="w-full h-[calc(100vh-8rem)] flex flex-col gap-6 p-2 animate-in fade-in duration-500">
      
      {/* Styles for hover scrollbar */}
      <style>{`
        .hover-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .hover-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .hover-scrollbar::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 5px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .hover-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
        }
        .dark .hover-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2); 
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Server className="text-indigo-500" />
            CRUD Менеджер
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Управление базой данных <span className="text-indigo-500 font-mono font-bold">{selectedDb}</span></p>
        </div>
        
        <div className="flex gap-3">
           <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
           >
              <Plus size={18} /> Создать таблицу
           </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        <DatabaseSidebar 
            databases={databases}
            selectedDb={selectedDb}
            onSelectDb={setSelectedDb}
            loading={loadingDb}
            onRefresh={refreshDatabases}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden relative">
           
           <TableTabs 
              tables={tables}
              activeTable={activeTable}
              onSelectTable={setActiveTable}
              loading={loadingTables}
              onReorder={handleTableReorder}
           />

           <div className="flex-1 overflow-hidden flex flex-col p-6 min-h-0 bg-white dark:bg-[#151923]">
              {!activeTable ? (
                 <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4">
                    <Table size={64} className="opacity-20" />
                    <p>Выберите таблицу для просмотра</p>
                 </div>
              ) : (
                 <div className="flex flex-col h-full gap-6 overflow-hidden">
                    
                    {/* Active Table Header */}
                    <div className="flex justify-between items-center shrink-0">
                       <h3 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                          {activeTable}
                       </h3>
                       <div className="flex gap-2">
                          <button 
                             onClick={refreshDatabases} 
                             className="p-2 text-gray-400 hover:text-indigo-500 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5" 
                             title="Обновить"
                          >
                             <RefreshCw size={18} />
                          </button>
                          <button 
                             onClick={handleDeleteTable}
                             className="p-2 text-red-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" 
                             title="Удалить таблицу"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </div>

                    <SchemaSection 
                        isOpen={isSchemaOpen}
                        onToggle={() => setIsSchemaOpen(!isSchemaOpen)}
                        loading={loadingSchema}
                        schema={tableSchema}
                        onDeleteColumn={handleDeleteColumn}
                        onAddColumn={handleAddColumn}
                        onRenameColumn={handleRenameColumn}
                        actionLoading={actionLoading}
                    />

                    <DataSection 
                        isOpen={isDataOpen}
                        onToggle={() => setIsDataOpen(!isDataOpen)}
                        loading={loadingData}
                        rows={tableRows}
                        schema={tableSchema}
                        totalRows={totalRows}
                        page={page}
                        setPage={setPage}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                        onDeleteRow={handleDeleteRow}
                        onAddRowClick={() => setIsAddRowModalOpen(true)}
                        onUpdateCell={handleUpdateCell}
                    />

                 </div>
              )}
           </div>
        </div>
      </div>

      <CreateTableModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateTable}
          loading={actionLoading}
      />

      <AddRowModal 
          isOpen={isAddRowModalOpen}
          onClose={() => setIsAddRowModalOpen(false)}
          activeTable={activeTable}
          schema={tableSchema}
          onInsert={handleInsertRow}
          loading={actionLoading}
      />

    </div>
  );
};

export default CrudPage;
