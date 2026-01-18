
import React from 'react';
import { X, MapPin, Building, Layers } from 'lucide-react';

interface ModalHeaderProps {
  formData: Record<string, any>;
  onClose: () => void;
  title?: string;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ formData, onClose, title }) => {
  const { city, jk, liter } = formData;

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
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 transition-colors">
            <X size={18} />
        </button>
    </div>
  );
};

export default ModalHeader;
