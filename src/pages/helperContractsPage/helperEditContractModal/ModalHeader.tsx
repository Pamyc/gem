
import React, { useState } from 'react';
import { X, MapPin, Building, Layers, Check } from 'lucide-react';

interface ModalHeaderProps {
  formData: Record<string, any>;
  onClose: () => void;
  title?: string;
  isDirty?: boolean;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ formData, onClose, title, isDirty }) => {
  const { city, jk, liter } = formData;
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCloseClick = () => {
    if (isDirty) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  return (
    <div className="p-5 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#1e293b] flex justify-between items-start shrink-0">
        <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">{title || 'Редактирование'}</h3>
            <div className="flex flex-wrap mt-1 gap-3">
                {city && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin size={10} className="text-indigo-500" /> {city}
                    </div>
                )}
                {jk && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Building size={10} className="text-indigo-500" /> {jk}
                    </div>
                )}
                <div className="flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-200">
                    <Layers size={12} className="text-emerald-500" /> {liter || 'Новый объект'}
                </div>
            </div>
        </div>

        {/* Custom Close / Confirm UI */}
        <div className="flex items-center h-8">
            {showConfirm ? (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 p-1 rounded-lg border border-red-100 dark:border-red-500/20 animate-in fade-in slide-in-from-right-4 duration-200">
                    <span className="text-[10px] font-bold text-red-500 uppercase px-1 whitespace-nowrap">
                        Не сохранять?
                    </span>
                    <button 
                        onClick={onClose}
                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold transition-colors shadow-sm"
                    >
                        Да
                    </button>
                    <button 
                        onClick={() => setShowConfirm(false)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        title="Отмена"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <button 
                    onClick={handleCloseClick} 
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 transition-colors hover:border-red-300 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500"
                    title="Закрыть"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    </div>
  );
};

export default ModalHeader;
