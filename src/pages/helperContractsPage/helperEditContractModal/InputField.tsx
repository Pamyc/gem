
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { CURRENCIES, formatMoney, cleanMoneyInput } from './constants';
import AutocompleteInput from './AutocompleteInput';

interface InputFieldProps {
  field: { db: string; header: string; type: string };
  value: any;
  onChange: (key: string, value: any) => void;
  isFinancial: boolean;
  currency: string;
  onCurrencyChange: (key: string, value: string) => void;
  options?: string[]; // Новый пропс для списка опций
}

const InputField: React.FC<InputFieldProps> = ({ 
  field, 
  value, 
  onChange, 
  isFinancial, 
  currency, 
  onCurrencyChange,
  options
}) => {
  const displayVal = value === null || value === undefined ? '' : value;

  // Обработчик для числовых полей, запрещающий отрицательные значения
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      // Если значение меньше 0, не обновляем (или ставим 0)
      if (val && Number(val) < 0) {
          val = '0';
      }
      onChange(field.db, val);
  };

  return (
    // Добавлен класс focus-within:z-20 и убран z-0. 
    // Это поднимает всю строку выше соседей, когда внутри нее происходит взаимодействие.
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5 last:border-0 relative group focus-within:z-20">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase sm:w-2/5 break-words leading-tight pt-1 sm:pt-0" title={field.header}>
            {field.header}
        </label>
        
        <div className="flex-1 relative">
            {field.type === 'boolean' ? (
                <select
                    value={String(displayVal) === 'Да' || displayVal === true ? 'Да' : 'Нет'}
                    onChange={(e) => onChange(field.db, e.target.value)}
                    className="w-full bg-white dark:bg-[#0b0f19] border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-xs font-medium text-gray-800 dark:text-gray-200 outline-none focus:border-indigo-500 transition-all h-7"
                >
                    <option value="Да" className="bg-white dark:bg-[#151923]">Да</option>
                    <option value="Нет" className="bg-white dark:bg-[#151923]">Нет</option>
                </select>
            ) : isFinancial ? (
                // Financial Input (Text type to support spaces)
                <div className="relative group">
                    <input 
                        type="text"
                        value={formatMoney(displayVal)} 
                        onChange={(e) => {
                            const clean = cleanMoneyInput(e.target.value);
                            // Разрешаем ввод только цифр, точки и минуса
                            if (/^-?\d*\.?\d*$/.test(clean)) {
                                onChange(field.db, clean);
                            }
                        }}
                        className="w-full bg-transparent border-b border-transparent focus:border-emerald-500 hover:border-gray-200 dark:hover:border-white/10 px-2 py-1 text-sm font-bold text-gray-900 dark:text-white outline-none transition-all focus:bg-emerald-50/30 dark:focus:bg-emerald-900/10 rounded-t pr-12 text-right"
                        placeholder="0"
                    />
                    {/* Individual Currency Selector */}
                    <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-10">
                        <select
                            value={currency}
                            onChange={(e) => onCurrencyChange(field.db, e.target.value)}
                            className="w-full h-full bg-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 font-bold text-xs appearance-none outline-none text-center cursor-pointer"
                        >
                            {CURRENCIES.map(c => (
                                <option key={c.value} value={c.value} className="bg-white dark:bg-[#151923] text-gray-900 dark:text-gray-200">
                                    {c.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 opacity-50" />
                    </div>
                </div>
            ) : options && options.length > 0 ? (
                // Autocomplete Input (if options provided)
                <AutocompleteInput 
                    value={displayVal}
                    onChange={(val) => {
                        // Для number полей из автокомплита тоже валидируем неотрицательность
                        if (field.type === 'number' && Number(val) < 0) return;
                        onChange(field.db, val);
                    }}
                    options={options}
                    placeholder="Выберите или введите"
                    type={field.type === 'number' ? 'number' : 'text'}
                />
            ) : (
                // Standard Input
                <input 
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={displayVal} 
                    onChange={field.type === 'number' ? handleNumberChange : (e) => onChange(field.db, e.target.value)}
                    min={field.type === 'number' ? "0" : undefined}
                    className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 hover:border-gray-200 dark:hover:border-white/10 px-2 py-1 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:bg-gray-50 dark:focus:bg-white/5 rounded-t"
                    placeholder="Пусто"
                />
            )}
        </div>
    </div>
  );
};

export default InputField;
