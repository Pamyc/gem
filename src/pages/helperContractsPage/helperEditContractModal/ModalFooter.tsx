
import React, { useState } from 'react';
import { Loader2, Save, User, Clock, Trash2, AlertTriangle, X, Check } from 'lucide-react';

interface ModalFooterProps {
  loading: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void; // Optional delete handler
  auditInfo?: {
      createdBy?: string;
      createdAt?: string;
      updatedBy?: string;
      updatedAt?: string;
  };
}

const ModalFooter: React.FC<ModalFooterProps> = ({ loading, onClose, onSave, onDelete, auditInfo }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const formatDate = (dateStr?: string) => {
      if (!dateStr) return '';
      try {
          const d = new Date(dateStr);
          return d.toLocaleDateString('ru-RU', { timeZone: 'UTC' }) + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
      } catch (e) {
          return dateStr;
      }
  };

  return (
    <div className="p-4 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#151923] shrink-0">
        
        {/* Left Side: Delete or Audit */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
            {onDelete && (
                <div className="relative">
                    {showConfirmDelete ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                            <span className="text-xs font-bold text-red-500 uppercase mr-1">Удалить?</span>
                            <button 
                                onClick={onDelete}
                                disabled={loading}
                                className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
                                title="Подтвердить удаление"
                            >
                                <Check size={14} />
                            </button>
                            <button 
                                onClick={() => setShowConfirmDelete(false)}
                                className="p-1.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
                                title="Отмена"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setShowConfirmDelete(true)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            title="Удалить договор"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            )}

            {/* Audit Info Block (Hidden on mobile if delete is active to save space, or stacked) */}
            <div className={`flex flex-col gap-1 text-[10px] text-gray-400 ${showConfirmDelete ? 'hidden sm:flex' : 'flex'}`}>
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
        </div>

        {/* Right Side: Actions */}
        <div className="flex gap-3 w-full sm:w-auto justify-end">
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
