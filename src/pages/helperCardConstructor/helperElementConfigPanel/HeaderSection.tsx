import React from 'react';
import { Square, Trash2 } from 'lucide-react';
import { CardElement } from '../../../types/card';

interface HeaderSectionProps {
  type: CardElement['type'];
  onDelete: () => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ type, onDelete }) => {
  return (
    <div className="flex justify-between items-center border-b border-gray-200 dark:border-white/5 pb-2 mb-2">
      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Square size={12} className="text-indigo-500" />
        {type.toUpperCase()}
      </span>
      <button onClick={onDelete} className="text-red-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20" title="Удалить элемент (Del)">
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default HeaderSection;