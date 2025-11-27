import React, { useState, useEffect } from 'react';
import { X, Copy, Check, FileJson, Code, Save, AlertCircle } from 'lucide-react';
import { CardConfig } from '../../types/card';

interface CardCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CardConfig;
  onConfigUpdate: (newConfig: CardConfig) => void;
}

const CardCodeModal: React.FC<CardCodeModalProps> = ({ isOpen, onClose, config, onConfigUpdate }) => {
  const [activeTab, setActiveTab] = useState<'react' | 'js'>('react');
  const [editorContent, setEditorContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Helper to format config object to JS-like string (TSX style)
  const formatConfigToJs = (cfg: CardConfig) => {
    const json = JSON.stringify(cfg, null, 2);
    // Unquote keys: "key": -> key:
    const jsLike = json.replace(/"(\w+)":/g, '$1:');
    
    // Remove outer braces to match user preference (copying just props)
    const lines = jsLike.split('\n');
    // Remove first line if it's just '{'
    if (lines.length > 0 && lines[0].trim() === '{') lines.shift();
    // Remove last line if it's just '}'
    if (lines.length > 0 && lines[lines.length - 1].trim() === '}') lines.pop();
    
    // De-indent (remove 2 spaces from start of lines)
    return lines.map(line => line.startsWith('  ') ? line.substring(2) : line).join('\n');
  };

  // Sync state when config changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'js') {
        setEditorContent(formatConfigToJs(config));
      }
      setError(null);
    }
  }, [isOpen, config, activeTab]);

  if (!isOpen) return null;

  // --- React Code Generator ---
  const generateReactCode = () => {
    const json = JSON.stringify(config, null, 2);
    const configString = json.replace(/"(\w+)":/g, '$1:');

    return `
import React, { useMemo } from 'react';
import DynamicCard from '../components/cards/DynamicCard'; 
import { CardConfig } from '../types/card';

const MyKPIWidget = () => {
  
  const config: CardConfig = useMemo(() => (${configString}), []);

  return (
    <DynamicCard config={config} />
  );
};

export default MyKPIWidget;
    `.trim();
  };

  const codeToShow = activeTab === 'react' ? generateReactCode() : editorContent;

  // --- Handlers ---

  const handleCopy = () => {
    navigator.clipboard.writeText(codeToShow);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorContent(e.target.value);
    setError(null);
  };

  const handleSaveJs = () => {
    try {
      // Wrap in braces to parse as object
      const objectString = `{\n${editorContent}\n}`;
      
      // Use Function constructor for loose parsing (allows JS object syntax)
      // eslint-disable-next-line no-new-func
      const parsed = new Function(`return ${objectString}`)();
      
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error("Результат не является валидным объектом");
      }

      onConfigUpdate(parsed as CardConfig);
      onClose();
    } catch (e: any) {
      console.error(e);
      setError("Ошибка синтаксиса: " + (e.message || "Неверный формат данных"));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#151923] rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col border border-gray-200 dark:border-white/10 overflow-hidden">
        
        {/* Header & Tabs */}
        <div className="p-0 border-b border-gray-100 dark:border-white/5 flex flex-col bg-gray-50/50 dark:bg-[#151923] shrink-0">
           <div className="flex items-center justify-between p-6 pb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Исходный код</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={24} />
              </button>
           </div>

           <div className="flex px-6 gap-6">
              <button
                onClick={() => setActiveTab('react')}
                className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'react' 
                    ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
                    : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Code size={16} /> React Component
              </button>
              <button
                onClick={() => setActiveTab('js')}
                className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'js' 
                    ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
                    : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <FileJson size={16} /> TSX Object (Edit)
              </button>
           </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative bg-gray-50 dark:bg-[#0b0f19]">
          {activeTab === 'react' ? (
            <div className="h-full overflow-auto p-6 custom-scrollbar">
               <pre className="font-mono text-xs md:text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap break-all">
                  {codeToShow}
               </pre>
            </div>
          ) : (
            <div className="h-full flex flex-col relative">
               <textarea
                  value={editorContent}
                  onChange={handleEditorChange}
                  className="flex-1 w-full h-full p-6 bg-gray-50 dark:bg-[#0b0f19] text-gray-800 dark:text-gray-300 font-mono text-xs md:text-sm resize-none outline-none focus:bg-white dark:focus:bg-black/20 transition-colors"
                  spellCheck={false}
                  placeholder="Вставьте свойства объекта конфигурации..."
               />
               {error && (
                 <div className="absolute bottom-4 left-6 right-6 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded-xl flex items-center gap-2 border border-red-200 dark:border-red-500/30 animate-in slide-in-from-bottom-2 shadow-lg">
                    <AlertCircle size={16} /> {error}
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#151923] shrink-0">
          
          <div className="text-xs text-gray-400">
             {activeTab === 'js' ? 'Редактируйте объект JS/TSX для обновления конфигурации' : 'Только для чтения'}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 font-medium flex items-center gap-2 transition-colors"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Скопировано' : 'Копировать'}
            </button>

            {activeTab === 'js' ? (
              <button 
                onClick={handleSaveJs}
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
              >
                <Save size={18} /> Применить
              </button>
            ) : (
              <button 
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
              >
                Закрыть
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardCodeModal;