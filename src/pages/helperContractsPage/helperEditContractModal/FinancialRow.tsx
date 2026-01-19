
import React from 'react';
import { formatMoney } from './constants';
import FinancialSmartInput from './FinancialSmartInput';
import { Transaction } from './useContractLogic';

interface FinancialRowProps {
  label: string;
  planKey: string;
  factKey: string;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  // New Props
  transactionsMap?: Record<string, Transaction[]>;
  onTransactionChange?: (fieldKey: string, txs: Transaction[]) => void;
}

const FinancialRow: React.FC<FinancialRowProps> = ({ 
  label, 
  planKey, 
  factKey, 
  values, 
  onChange,
  transactionsMap = {},
  onTransactionChange
}) => {
  const planVal = values[planKey];
  const factVal = values[factKey];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-white/50 dark:hover:bg-white/5 transition-colors rounded-lg px-2">
      {/* Label */}
      <div className="flex-1 min-w-0 mb-1 sm:mb-0">
        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 truncate block pr-2">
          {label}
        </span>
      </div>

      {/* Inputs Container */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        
        {/* PLAN Input */}
        <div className="relative flex-1 sm:w-28 group">
          <FinancialSmartInput 
            value={formatMoney(planVal)}
            onChange={() => {}} // Disabled direct change
            transactions={transactionsMap[planKey]}
            onTransactionsChange={(txs) => onTransactionChange && onTransactionChange(planKey, txs)}
            className="w-full bg-transparent border-b border-dashed border-rose-200 dark:border-rose-800 focus:border-rose-500 px-1 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400 outline-none text-right placeholder-rose-200 dark:placeholder-rose-900 transition-all cursor-pointer"
            placeholder="0"
            label={`${label} (План)`}
          />
          <span className="absolute -top-2 left-0 text-[8px] font-bold text-rose-400/70 uppercase pointer-events-none">
            План
          </span>
        </div>

        <span className="text-gray-300 dark:text-gray-600 font-light px-1">/</span>

        {/* FACT Input */}
        <div className="relative flex-1 sm:w-28 group">
          <FinancialSmartInput 
            value={formatMoney(factVal)}
            onChange={() => {}} // Disabled direct change
            transactions={transactionsMap[factKey]}
            onTransactionsChange={(txs) => onTransactionChange && onTransactionChange(factKey, txs)}
            className="w-full bg-transparent border-b border-dashed border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 px-1 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 outline-none text-right placeholder-indigo-200 dark:placeholder-indigo-900 transition-all cursor-pointer"
            placeholder="0"
            label={`${label} (Факт)`}
          />
          <span className="absolute -top-2 left-0 text-[8px] font-bold text-indigo-400/70 uppercase pointer-events-none">
            Факт
          </span>
        </div>

      </div>
    </div>
  );
};

export default FinancialRow;
