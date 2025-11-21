import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { CardConfig } from '../../types/card';

interface CardCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CardConfig;
}

const CardCodeModal: React.FC<CardCodeModalProps> = ({ isOpen, onClose, config }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateCode = () => {
    // Serialize config logic
    const configString = JSON.stringify(config, null, 2).replace(/"(\w+)":/g, '$1:');

    return `
import React, { useMemo } from 'react';
import DynamicCard from '../components/cards/DynamicCard'; // Make sure path is correct
import { CardConfig } from '../types/card';

const MyKPIWidget = () => {
  
  const config: CardConfig = useMemo(() => (${configString}), []);

  return (
    <DynamicCard config={config} />
  );
};

export default MyKPIWidget;
    `;
  };

  const code = generateCode().trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#151923] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col border border-gray-200 dark:border-white/10">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Код компонента DynamicCard</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-[#0b0f19]">
          <pre className="font-mono text-xs md:text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap break-all">
            {code}
          </pre>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3 bg-white dark:bg-[#151923] rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
          >
            Закрыть
          </button>
          <button 
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 transition-colors"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Скопировано!' : 'Копировать код'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardCodeModal;