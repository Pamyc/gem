
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
  options?: string[];
  showValidationErrors?: boolean; // Новый пропс
}

const InputField: React.FC<InputFieldProps> = ({ 
  field, 
  value, 
  onChange, 
  isFinancial, 
  currency, 
  onCurrencyChange,
  options,
  showValidationErrors
}) => {
  const displayVal = value === null || value === undefined ? '' : value;

  // Список обязательных полей (согласно ТЗ)
  const requiredDbFields = ['region', 'city', 'housing_complex', 'liter', 'object_type', 'client_name', 'year'];
  
  // Проверяем, является ли поле обязательным и пустым при активной валидации
  const isRequired = requiredDbFields.includes(field.db);
  const hasError = showValidationErrors && isRequired && (!value || String(value).trim() === '');

  // Динамические классы для контейнера
  const containerClasses = `flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-2 py-1 rounded transition-colors border-b last:border-0 relative group focus-within:z-20 ${
      hasError 
          ? 'bg-red-50/50 dark:bg-red-900/10 border-red-500 dark:border-red-500' 
          : 'hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-white/5'
  }`;

  const labelClasses = `text-[11px] font-bold uppercase sm:w-2/5 break-words leading-tight pt-1 sm:pt-0 ${
      hasError ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
  }`;

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      if (val && Number(val) < 0) {
          val = '0';
      }
      onChange(field.db, val);
  };

  return (
    <div className={containerClasses}>
        <label className={labelClasses} title={field.header}>
            {field.header} {isRequired && <span className="text-red-500">*</span>}
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
                <div className="relative group">
                    <input 
                        type="text"
                        value={formatMoney(displayVal)} 
                        onChange={(e) => {
                            const clean = cleanMoneyInput(e.target.value);
                            if (/^-?\d*\.?\d*$/.test(clean)) {
                                onChange(field.db, clean);
                            }
                        }}
                        className="w-full bg-transparent border-b border-transparent focus:border-emerald-500 hover:border-gray-200 dark:hover:border-white/10 px-2 py-1 text-sm font-bold text-gray-900 dark:text-white outline-none transition-all focus:bg-emerald-50/30 dark:focus:bg-emerald-900/10 rounded-t pr-12 text-right"
                        placeholder="0"
                    />
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
                <AutocompleteInput 
                    value={displayVal}
                    onChange={(val) => {
                        if (field.type === 'number' && Number(val) < 0) return;
                        onChange(field.db, val);
                    }}
                    options={options}
                    placeholder="Выберите или введите"
                    type={field.type === 'number' ? 'number' : 'text'}
                />
            ) : (
                <input 
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={displayVal} 
                    onChange={field.type === 'number' ? handleNumberChange : (e) => onChange(field.db, e.target.value)}
                    min={field.type === 'number' ? "0" : undefined}
                    className={`w-full bg-transparent border-b focus:border-indigo-500 px-2 py-1 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:bg-gray-50 dark:focus:bg-white/5 rounded-t [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none  ${
                        hasError ? 'border-red-300 placeholder-red-300' : 'border-transparent hover:border-gray-200 dark:hover:border-white/10'
                    }`}
                    placeholder={hasError ? "Обязательное поле" : "Пусто"}
                />
            )}
        </div>
    </div>
  );
};

export default InputField;
