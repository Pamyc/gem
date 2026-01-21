

import React, { useState, useRef, useEffect } from 'react';
import { Hash, FileText, Plus, X, Trash2, Tag, ChevronDown, User } from 'lucide-react';
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
  
  // Options for subcategory
  const [subcategoryOptions, setSubcategoryOptions] = useState<string[]>([]);
  const [showSubOptions, setShowSubOptions] = useState(false);

  // Load options when popover opens
  useEffect(() => {
      if (isOpen && transactionType) {
          fetchSubcategories(transactionType).then(opts => setSubcategoryOptions(opts));
      }
  }, [isOpen, transactionType]);

  // Formatting date (YYYY-MM-DD -> DD.MM.YYYY)
  const formatDateDisplay = (isoDate: string) => {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}.${m}.${y}`;
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

  // Handle Add Transaction
  const handleAdd = () => {
    if (!newAmount || !onTransactionsChange) return;
    
    const amountNum = parseFloat(cleanMoneyInput(newAmount));
    
    // Validation: Only positive numbers
    if (isNaN(amountNum) || amountNum < 0) {
        alert("Сумма должна быть положительным числом");
        return;
    }
    
    const newTx: Transaction = {
        id: Date.now(), // Temp ID
        date: newDate,
        value: amountNum,
        text: newDesc || 'Комментарий',
        subcategory: newSubcategory || '' // Сохраняем подкатегорию
        // CreatedBy will be set on saveService, or we can assume 'Me' for new ones visually
    };

    onTransactionsChange([...transactions, newTx]);
    
    // Reset Form
    setNewAmount('');
    setNewDesc('');
    setNewSubcategory('');
  };

  // Handle Delete Transaction
  const handleDelete = (index: number) => {
      if (!onTransactionsChange) return;
      const updated = transactions.filter((_, i) => i !== index);
      onTransactionsChange(updated);
  };

  // Positioning
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 300 });

  const handleOpen = () => {
      if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const leftPos = rect.right - 500;
          setCoords({
              top: rect.bottom + 5,
              left: leftPos > 0 ? leftPos : rect.left, 
              width: 500
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
                    maxHeight: '400px'
                }}
            >
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#151923] flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                        <X size={14} />
                    </button>
                </div>

                {/* List of existing records */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-1 max-h-[200px]">
                    {transactions.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-400 italic">Нет записей. Добавьте транзакцию.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 dark:bg-white/5 text-[10px] text-gray-400 uppercase font-bold sticky top-0">
                                <tr>
                                    <th className="px-3 py-2">Дата / Автор</th>
                                    <th className="px-3 py-2 text-right">Сумма</th>
                                    <th className="px-3 py-2">Раздел</th>
                                    <th className="px-1 py-2"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {transactions.map((t, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50 dark:hover:bg-white/5">
                                        <td className="px-3 py-2 text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                            <div>{formatDateDisplay(t.date)}</div>
                                            {t.createdBy && (
                                                <div className="flex items-center gap-1 text-[9px] text-gray-400 mt-0.5">
                                                    <User size={8} /> {t.createdBy}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-xs font-bold text-gray-800 dark:text-white text-right">
                                            {formatMoney(t.value)}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                                            <div className="flex flex-col">
                                                <span className="text-gray-800 dark:text-gray-200">{t.subcategory}</span>
                                                <span className="text-[9px] opacity-70">{t.text}</span>
                                            </div>
                                        </td>
                                        <td className="px-1 py-2 text-right">
                                            <button 
                                                onClick={() => handleDelete(idx)}
                                                className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Add New Record Form */}
                <div className="p-3 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#151923]">
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Новая запись</div>
                    
                    {/* Row 1: Date & Amount */}
                    <div className="grid grid-cols-[120px_1fr] gap-2 mb-2">
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
                            <div className="absolute z-10 bottom-full left-0 w-full mb-1 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-lg shadow-lg max-h-32 overflow-y-auto custom-scrollbar">
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

                    {/* Row 3: Comment & Add */}
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
                            onClick={handleAdd}
                            disabled={!newAmount || Number(cleanMoneyInput(newAmount)) <= 0}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default FinancialSmartInput;
