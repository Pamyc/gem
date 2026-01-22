
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Hash, FileText, Plus, X, Trash2, Tag, ChevronDown, User, Edit2, Check, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMoney, cleanMoneyInput } from './constants';
import { Transaction } from './useContractLogic';
import { fetchSubcategories } from './helperUseContractLogic/dataService';

interface FinancialSmartInputProps {
  value: any; // Отображаемое значение (сумма)
  onChange: (value: any) => void; // Для обратной совместимости
  transactions?: Transaction[]; // Список транзакций из родителя
  onTransactionsChange?: (txs: Transaction[]) => void; // Коллбэк изменения списка
  transactionType?: string; // Тип транзакции для фильтрации подкатегорий
  placeholder?: string;
  className?: string;
  label?: string;
}

const ITEMS_PER_PAGE = 5;

const FinancialSmartInput: React.FC<FinancialSmartInputProps> = ({ 
  value, 
  onChange, 
  transactions = [],
  onTransactionsChange,
  transactionType = '',
  placeholder = "0", 
  className = "",
  label = "Детализация"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form State
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  
  // Editing State
  const [editingId, setEditingId] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  
  // Options for subcategory
  const [subcategoryOptions, setSubcategoryOptions] = useState<string[]>([]);
  const [showSubOptions, setShowSubOptions] = useState(false);

  // Load options when popover opens
  useEffect(() => {
      if (isOpen && transactionType) {
          fetchSubcategories(transactionType).then(opts => setSubcategoryOptions(opts));
      }
  }, [isOpen, transactionType]);

  // Reset pagination if list changes significantly (optional, keeping it simple for now)
  useEffect(() => {
      const maxPage = Math.ceil(transactions.length / ITEMS_PER_PAGE) || 1;
      if (currentPage > maxPage) setCurrentPage(maxPage);
  }, [transactions.length]);

  // Formatting date (YYYY-MM-DD -> DD.MM.YYYY)
  const formatDateDisplay = (isoDate: string) => {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}.${m}.${y}`;
  };

  // Format timestamp (ISO or string) -> DD.MM.YYYY HH:MM
  const formatDateTime = (ts?: string) => {
      if (!ts) return '-';
      try {
          const d = new Date(ts);
          if (isNaN(d.getTime())) return '-';
          return d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
          return '-';
      }
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // --- CRUD HANDLERS ---

  const handleSave = () => {
    if (!newAmount || !onTransactionsChange) return;
    
    const amountNum = parseFloat(cleanMoneyInput(newAmount));
    
    // Validation: Only positive numbers
    if (isNaN(amountNum) || amountNum < 0) {
        alert("Сумма должна быть положительным числом");
        return;
    }

    if (editingId !== null) {
        // UPDATE Existing
        const updated = transactions.map(t => {
            if (t.id === editingId) {
                return {
                    ...t,
                    date: newDate,
                    value: amountNum,
                    text: newDesc || '',
                    subcategory: newSubcategory || '',
                    // Update timestamp on modification
                    updatedAt: new Date().toISOString()
                };
            }
            return t;
        });
        onTransactionsChange(updated);
        cancelEdit();
    } else {
        // CREATE New
        const newTx: Transaction = {
            id: Date.now(), // Temp ID
            date: newDate,
            value: amountNum,
            text: newDesc || '',
            subcategory: newSubcategory || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        // Add to TOP or BOTTOM? Usually bottom for history, but top for visibility.
        // Let's stick to array order (append).
        onTransactionsChange([...transactions, newTx]);
        
        // Reset Form
        setNewAmount('');
        setNewDesc('');
        setNewSubcategory('');
    }
  };

  const handleEdit = (t: Transaction) => {
      setEditingId(t.id || null);
      setNewDate(t.date);
      setNewAmount(String(t.value));
      setNewDesc(t.text);
      setNewSubcategory(t.subcategory || '');
  };

  const cancelEdit = () => {
      setEditingId(null);
      setNewAmount('');
      setNewDesc('');
      setNewSubcategory('');
      setNewDate(new Date().toISOString().split('T')[0]);
  };

  const handleDelete = (id: number | undefined) => {
      if (!onTransactionsChange || id === undefined) return;
      if (!window.confirm("Удалить эту запись?")) return;
      
      const updated = transactions.filter(t => t.id !== id);
      onTransactionsChange(updated);
      
      if (editingId === id) cancelEdit();
  };

  // --- PAGINATION LOGIC ---
  const sortedTransactions = useMemo(() => {
      // Sort by date desc for display? Or keep original order?
      // Assuming original order is chronological or as added. 
      // Let's reverse to show newest first if we assume array is chronological push.
      // But keeping simple array order for stability.
      return [...transactions]; // Copy
  }, [transactions]);

  const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = sortedTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Positioning
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 700 });

  const handleOpen = () => {
      if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const modalWidth = 700;
          const leftPos = rect.right - modalWidth;
          // Ensure it doesn't go off-screen left
          const finalLeft = leftPos > 10 ? leftPos : rect.left; 
          
          setCoords({
              top: rect.bottom + 5,
              left: finalLeft, 
              width: modalWidth
          });
      }
      setIsOpen(true);
  };

  return (
    <>
        {/* INPUT TRIGGER */}
        <div ref={containerRef} className="relative w-full">
            <input 
                type="text"
                value={value}
                readOnly={true} // Блокируем прямой ввод
                onClick={handleOpen}
                onFocus={handleOpen}
                className={`${className} cursor-pointer`}
                placeholder={placeholder}
                autoComplete="off"
                title="Нажмите, чтобы добавить детализацию"
            />
        </div>

        {/* DROPDOWN POPOVER */}
        {isOpen && (
            <div 
                ref={dropdownRef}
                className="fixed z-[9999] bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                style={{ 
                    top: coords.top, 
                    left: coords.left,
                    width: coords.width + 'px',
                    maxHeight: '600px'
                }}
            >
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#151923] flex justify-between items-center shrink-0">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                        <X size={14} />
                    </button>
                </div>

                {/* 1. INPUT FORM (MOVED TO TOP) */}
                <div className="p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#151923] shrink-0">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-[10px] font-bold text-gray-400 uppercase">
                            {editingId !== null ? 'Редактирование записи' : 'Новая запись'}
                        </div>
                        {editingId !== null && (
                            <button onClick={cancelEdit} className="text-[10px] text-red-400 hover:text-red-500 flex items-center gap-1">
                                <RotateCcw size={10} /> Отмена
                            </button>
                        )}
                    </div>
                    
                    {/* Row 1: Date & Amount */}
                    <div className="grid grid-cols-[140px_1fr] gap-2 mb-2">
                        <div className="relative bg-white dark:bg-[#0b0f19] border border-gray-200 dark:border-white/10 rounded-lg flex items-center px-2">
                            <input 
                                type="date" 
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="w-full bg-transparent text-xs outline-none text-gray-700 dark:text-gray-300 font-mono"
                            />
                        </div>
                        <div className="relative bg-white dark:bg-[#0b0f19] border border-gray-200 dark:border-white/10 rounded-lg flex items-center px-2 py-1.5 focus-within:border-emerald-500 transition-colors">
                            <Hash size={12} className="text-gray-400 mr-2 shrink-0" />
                            <input 
                                type="text" 
                                value={formatMoney(newAmount)}
                                onChange={(e) => setNewAmount(cleanMoneyInput(e.target.value))}
                                placeholder="Сумма (>0)"
                                className="w-full bg-transparent text-xs font-bold outline-none text-gray-800 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Row 2: Subcategory (Dynamic Dropdown) */}
                    <div className="relative mb-2">
                        <div className="relative flex items-center bg-white dark:bg-[#0b0f19] border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 focus-within:border-indigo-500 transition-colors">
                            <Tag size={12} className="text-gray-400 mr-2 shrink-0" />
                            <input 
                                type="text" 
                                value={newSubcategory}
                                onChange={(e) => {
                                    setNewSubcategory(e.target.value);
                                    setShowSubOptions(true);
                                }}
                                onFocus={() => setShowSubOptions(true)}
                                onBlur={() => setTimeout(() => setShowSubOptions(false), 200)}
                                placeholder="Категория (например: Доставка)"
                                className="w-full bg-transparent text-xs outline-none text-gray-700 dark:text-gray-300"
                            />
                            {subcategoryOptions.length > 0 && (
                                <ChevronDown size={12} className="text-gray-400 ml-1 cursor-pointer" onClick={() => setShowSubOptions(!showSubOptions)} />
                            )}
                        </div>
                        
                        {/* Options List */}
                        {showSubOptions && subcategoryOptions.length > 0 && (
                            <div className="absolute z-10 top-full left-0 w-full mt-1 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-lg shadow-lg max-h-32 overflow-y-auto custom-scrollbar">
                                {subcategoryOptions.filter(o => o.toLowerCase().includes(newSubcategory.toLowerCase())).map((opt, i) => (
                                    <div 
                                        key={i}
                                        className="px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 cursor-pointer"
                                        onClick={() => {
                                            setNewSubcategory(opt);
                                            setShowSubOptions(false);
                                        }}
                                    >
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Row 3: Comment & Save Button */}
                    <div className="flex gap-2">
                        <div className="relative flex-1 bg-white dark:bg-[#0b0f19] border border-gray-200 dark:border-white/10 rounded-lg flex items-center px-2 py-1.5 focus-within:border-emerald-500 transition-colors">
                            <FileText size={12} className="text-gray-400 mr-2 shrink-0" />
                            <input 
                                type="text" 
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                placeholder="Комментарий"
                                className="w-full bg-transparent text-xs outline-none text-gray-700 dark:text-gray-300"
                            />
                        </div>
                        <button 
                            onClick={handleSave}
                            disabled={!newAmount || Number(cleanMoneyInput(newAmount)) <= 0}
                            className={`${editingId !== null ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
                        >
                            {editingId !== null ? <Check size={14} /> : <Plus size={16} />}
                            <span className="text-xs font-bold">{editingId !== null ? 'Сохранить' : 'Добавить'}</span>
                        </button>
                    </div>
                </div>

                {/* 2. TABLE List */}
                <div className="flex-1 overflow-auto custom-scrollbar p-0 bg-white dark:bg-[#1e293b]">
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center text-xs text-gray-400 italic">Нет записей. Используйте форму выше для добавления.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 dark:bg-white/5 text-[10px] text-gray-400 uppercase font-bold sticky top-0 z-10 border-b border-gray-100 dark:border-white/5">
                                <tr>
                                    <th className="px-3 py-2">Дата оплаты</th>
                                    <th className="px-3 py-2 text-right">Сумма</th>
                                    <th className="px-3 py-2">Раздел</th>
                                    <th className="px-3 py-2">Кто изменил</th>
                                    <th className="px-3 py-2">Обновлено</th>
                                    <th className="px-3 py-2">Создано</th>
                                    <th className="px-2 py-2 text-right w-[70px]">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {paginatedData.map((t, idx) => {
                                    const isEditingRow = t.id === editingId;
                                    return (
                                        <tr 
                                            key={t.id || idx} 
                                            className={`group transition-colors ${isEditingRow ? 'bg-indigo-50 dark:bg-indigo-500/20' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                        >
                                            <td className="px-3 py-2 text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {formatDateDisplay(t.date)}
                                            </td>
                                            <td className="px-3 py-2 text-xs font-bold text-gray-800 dark:text-white text-right">
                                                {formatMoney(t.value)}
                                            </td>
                                            <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]" title={t.text}>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-800 dark:text-gray-200 font-medium">{t.subcategory || '-'}</span>
                                                    {t.text && <span className="text-[9px] opacity-70 truncate">{t.text}</span>}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    {t.updatedBy || t.createdBy ? <User size={10} /> : null}
                                                    {t.updatedBy || t.createdBy || '-'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-[10px] text-gray-400 whitespace-nowrap font-mono">
                                                {formatDateTime(t.updatedAt)}
                                            </td>
                                            <td className="px-3 py-2 text-[10px] text-gray-400 whitespace-nowrap font-mono">
                                                {formatDateTime(t.createdAt)}
                                            </td>
                                            <td className="px-2 py-2 text-right">
                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleEdit(t)}
                                                        className="p-1 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded"
                                                        title="Редактировать"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(t.id)}
                                                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                        title="Удалить"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Controls */}
                {transactions.length > ITEMS_PER_PAGE && (
                    <div className="px-4 py-2 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#151923] flex items-center justify-between shrink-0">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <span className="text-xs text-gray-500 font-mono">
                            {currentPage} / {totalPages}
                        </span>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>
        )}
    </>
  );
};

export default FinancialSmartInput;
