

import React from 'react';
import { Loader2, Save, User, Clock } from 'lucide-react';

interface ModalFooterProps {
  loading: boolean;
  onClose: () => void;
  onSave: () => void;
  auditInfo?: {
      createdBy?: string;
      createdAt?: string;
      updatedBy?: string;
      updatedAt?: string;
  };
}

const ModalFooter: React.FC<ModalFooterProps> = ({ loading, onClose, onSave, auditInfo }) => {
  const formatDate = (dateStr?: string) => {
      if (!dateStr) return '';
      try {
          const d = new Date(dateStr);
          return d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
          return dateStr;
      }
  };

  return (
    <div className="p-4 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#151923] shrink-0">
        
        {/* Audit Info Block */}
        <div className="flex flex-col gap-1 text-[10px] text-gray-400">
            {(auditInfo?.createdBy || auditInfo?.updatedBy) ? (
                <>
                    {auditInfo.createdBy && (
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-500 dark:text-gray-500">Создал:</span>
                            <span className="flex items-center gap-1"><User size={10}/> {auditInfo.createdBy}</span>
                            <span className="flex items-center gap-1 opacity-70"><Clock size={10}/> {formatDate(auditInfo.createdAt)}</span>
                        </div>
                    )}
                    {auditInfo.updatedBy && (
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-500 dark:text-gray-500">Обновил:</span>
                            <span className="flex items-center gap-1"><User size={10}/> {auditInfo.updatedBy}</span>
                            <span className="flex items-center gap-1 opacity-70"><Clock size={10}/> {formatDate(auditInfo.updatedAt)}</span>
                        </div>
                    )}
                </>
            ) : (
                <span className="opacity-50 italic">Нет данных аудита</span>
            )}
        </div>

        <div className="flex gap-3">
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
    </div>
  );
};

export default ModalFooter;
