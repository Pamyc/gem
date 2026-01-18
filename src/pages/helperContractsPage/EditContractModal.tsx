
import React from 'react';
import { Info, Coins, Terminal } from 'lucide-react';

import ModalHeader from './helperEditContractModal/ModalHeader';
import ModalFooter from './helperEditContractModal/ModalFooter';
import InputField from './helperEditContractModal/InputField';
import LitersList from './helperEditContractModal/LitersList';
import { useContractLogic } from './helperEditContractModal/useContractLogic';
import { useAuth } from '../../contexts/AuthContext';

interface EditContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData?: any; 
  onSuccess: () => void;
}

const EditContractModal: React.FC<EditContractModalProps> = ({ isOpen, onClose, nodeData, onSuccess }) => {
  const { user } = useAuth();
  
  const {
    formData,
    loading,
    liters,
    fieldCurrencies,
    optionsMap,
    generalFields,
    financialFields,
    isEditMode,
    previewSql,
    handleChange,
    handleCurrencyChange,
    addLiter,
    removeLiter,
    updateLiter,
    handleSave
  } = useContractLogic({ isOpen, nodeData, onSuccess, onClose });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-[#151923] w-full max-w-5xl rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden max-h-[90vh]">
            
            <ModalHeader 
                formData={formData} 
                onClose={onClose} 
                title={isEditMode ? `Редактирование: ${formData.housing_complex || 'Договор'}` : "Создание нового договора"} 
            />
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="grid grid-cols-1 md:grid-cols-[45%_55%] gap-8">
                    
                    {/* Left Column: General & Liters */}
                    <div className="space-y-6">
                        
                        {/* 1. General Info */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-white/10">
                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                    <Info size={16} />
                                </div>
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Основные данные</h4>
                            </div>
                            
                            <div className="space-y-0.5 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 p-2">
                                {generalFields.map(f => (
                                    <InputField 
                                        key={f.db}
                                        field={f}
                                        value={formData[f.db]}
                                        onChange={handleChange}
                                        isFinancial={false}
                                        currency={fieldCurrencies[f.db] || '₽'}
                                        onCurrencyChange={handleCurrencyChange}
                                        options={optionsMap[f.db]} 
                                    />
                                ))}
                            </div>
                        </div>

                        {/* 2. Liters Composition */}
                        <LitersList 
                            liters={liters}
                            totalElevators={formData.elevators_count || 0}
                            totalFloors={formData.floors_count || 0}
                            onAdd={addLiter}
                            onRemove={removeLiter}
                            onUpdate={updateLiter}
                        />

                    </div>

                    {/* Right Column: Financials */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                    <Coins size={16} />
                                </div>
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Финансы (Общие)</h4>
                            </div>
                            <div className="text-[10px] text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">
                                Заполняется только для договора
                            </div>
                        </div>

                        <div className="space-y-0.5 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20 p-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {financialFields.length > 0 ? (
                                financialFields.map(f => (
                                    <InputField 
                                        key={f.db}
                                        field={f}
                                        value={formData[f.db]}
                                        onChange={handleChange}
                                        isFinancial={true}
                                        currency={fieldCurrencies[f.db] || '₽'}
                                        onCurrencyChange={handleCurrencyChange}
                                        options={optionsMap[f.db]}
                                    />
                                ))
                            ) : (
                                <div className="p-4 text-center text-xs text-gray-400">Финансовые показатели отсутствуют</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {user?.username === '1' && (
                <div className="bg-[#0f111a] p-4 border-t border-gray-800 shrink-0">
                    <div className="flex items-center gap-2 mb-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                        <Terminal size={12} />
                        SQL Preview (Super Admin)
                    </div>
                    <div className="bg-black/30 rounded-lg p-3 border border-white/5 max-h-32 overflow-y-auto custom-scrollbar">
                        <pre className="text-[10px] font-mono text-emerald-400 whitespace-pre-wrap break-all leading-relaxed">
                            {previewSql || '-- SQL query will appear here'}
                        </pre>
                    </div>
                </div>
            )}

            <ModalFooter loading={loading} onClose={onClose} onSave={handleSave} />
        </div>
    </div>
  );
};

export default EditContractModal;
