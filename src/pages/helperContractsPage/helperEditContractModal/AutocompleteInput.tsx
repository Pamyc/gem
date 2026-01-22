
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';

interface AutocompleteInputProps {
  value: any;
  onChange: (value: any) => void;
  options: string[];
  placeholder?: string;
  type?: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder,
  type = 'text'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value ? String(value) : '');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Синхронизация при изменении внешнего value
  useEffect(() => {
    setInputValue(value === null || value === undefined ? '' : String(value));
  }, [value]);

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val); // Обновляем родительское состояние сразу, чтобы работал обычный ввод
    setIsOpen(true);
  };

  const handleSelectOption = (opt: string) => {
    setInputValue(opt);
    onChange(opt);
    setIsOpen(false);
  };

  const handleAddNew = () => {
    const confirmAdd = window.confirm(`Вы уверены, что хотите добавить новое значение "${inputValue}"?`);
    if (confirmAdd) {
        onChange(inputValue);
        setIsOpen(false);
    }
  };

  // Фильтрация опций
  const filteredOptions = useMemo(() => {
    if (!inputValue) return options;
    return options.filter(opt => 
      opt.toLowerCase().includes(inputValue.toLowerCase()) && opt !== inputValue
    );
  }, [options, inputValue]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input 
        type={type}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 hover:border-gray-200 dark:hover:border-white/10 px-2 py-1 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:bg-gray-50 dark:focus:bg-white/5 rounded-t"
        placeholder={placeholder || "Введите или выберите"}
      />
      
      {isOpen && (inputValue || filteredOptions.length > 0) && (
        <div className="absolute z-[50] top-full left-0 w-full mt-1 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar">

            {filteredOptions.map((opt, idx) => (
                <button
                    key={idx}
                    onClick={() => handleSelectOption(opt)}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors truncate"
                >
                    {opt}
                </button>
            ))}
            
            {filteredOptions.length === 0 && !inputValue && (
                 <div className="px-3 py-2 text-xs text-gray-400 italic">Начните вводить...</div>
            )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
