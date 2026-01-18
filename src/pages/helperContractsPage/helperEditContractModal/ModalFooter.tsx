
import React from 'react';
import { Loader2, Save } from 'lucide-react';

interface ModalFooterProps {
  loading: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ModalFooter: React.FC<ModalFooterProps> = ({ loading, onClose, onSave }) => {
  return (
    <div className="p-4 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3 bg-white dark:bg-[#151923] shrink-0">
        <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
            Отмена
        </button>
        <button 
            onClick={onSave} 
            disabled={loading} 
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
        >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            Сохранить
        </button>
    </div>
  );
};

export default ModalFooter;
