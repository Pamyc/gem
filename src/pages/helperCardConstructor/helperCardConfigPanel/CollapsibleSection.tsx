import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon, isOpen, onToggle, children }) => (
  <div className="border-b border-gray-100 dark:border-white/5 last:border-0">
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between py-3 text-left group focus:outline-none"
    >
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider group-hover:text-indigo-500 transition-colors">
        {icon} {title}
      </div>
      <div className="text-gray-400 group-hover:text-indigo-500">
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>
    </button>
    {isOpen && <div className="pb-4 animate-in fade-in slide-in-from-top-2 duration-200">{children}</div>}
  </div>
);

export default CollapsibleSection;
