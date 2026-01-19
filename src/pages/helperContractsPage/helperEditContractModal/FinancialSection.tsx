
import React from 'react';
import { Wallet, Hammer, Maximize, Settings, Calculator } from 'lucide-react';
import FinancialRow from './FinancialRow';
import { formatMoney } from './constants';
import FinancialSmartInput from './FinancialSmartInput';
import { Transaction } from './useContractLogic';

interface FinancialSectionProps {
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
  // New props
  transactionsMap?: Record<string, Transaction[]>;
  onTransactionChange?: (fieldKey: string, txs: Transaction[]) => void;
}

const CategoryBlock: React.FC<{
  title: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  children: React.ReactNode;
}> = ({ title, icon: Icon, colorClass, bgClass, children }) => (
  <div className="flex rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden mb-3 bg-white dark:bg-white/5 transition-all hover:border-gray-300 dark:hover:border-white/20">
    {/* Left Vertical Header */}
    <div className={`w-9 flex flex-col items-center py-3 gap-2 border-r border-gray-100 dark:border-white/5 shrink-0 ${bgClass}`}>
      <Icon size={14} className={colorClass} />
      <div className="flex-1 flex items-center justify-center min-h-[40px]">
         <span className={`text-[10px] font-bold uppercase tracking-wider ${colorClass} [writing-mode:vertical-rl] rotate-180 whitespace-nowrap opacity-90 select-none`}>
            {title}
         </span>
      </div>
    </div>
    
    {/* Right Content */}
    <div className="flex-1 p-1 min-w-0 flex flex-col justify-center">
      {children}
    </div>
  </div>
);

// Для одиночных полей типа "ФОТ" (с вводом транзакций)
const SingleRow: React.FC<{
    label: string;
    fieldKey: string;
    value: any;
    colorClass?: string;
    transactionsMap?: Record<string, Transaction[]>;
    onTransactionChange?: (fieldKey: string, txs: Transaction[]) => void;
}> = ({ label, fieldKey, value, colorClass = "text-gray-700 dark:text-gray-200", transactionsMap, onTransactionChange }) => (
    <div className="flex justify-between items-center py-1.5 px-2 border-t border-gray-100 dark:border-white/5 mt-1">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{label}</span>
        <div className="w-28 sm:w-32">
            <FinancialSmartInput 
                value={formatMoney(value)}
                onChange={() => {}}
                transactions={transactionsMap ? transactionsMap[fieldKey] : []}
                onTransactionsChange={(txs) => onTransactionChange && onTransactionChange(fieldKey, txs)}
                className={`w-full bg-transparent border-b border-dashed border-gray-300 dark:border-gray-700 focus:border-emerald-500 px-1 py-0.5 text-xs font-bold text-right outline-none cursor-pointer ${colorClass}`}
                placeholder="0"
                label={label}
            />
        </div>
    </div>
);

// Для расчетных полей (только отображение, без модального окна)
const CalculatedRow: React.FC<{
    label: string;
    value: any;
    colorClass?: string;
}> = ({ label, value, colorClass = "text-gray-700 dark:text-gray-200" }) => (
    <div className="flex justify-between items-center py-1.5 px-2 border-t border-gray-100 dark:border-white/5 mt-1">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{label}</span>
        <div className="w-28 sm:w-32 text-right px-1 py-0.5 border-b border-transparent">
             <span className={`text-xs font-bold ${colorClass} cursor-default`} title="Рассчитывается автоматически">
                {formatMoney(value)}
             </span>
        </div>
    </div>
);

const FinancialSection: React.FC<FinancialSectionProps> = ({ 
    formData, 
    onChange,
    transactionsMap,
    onTransactionChange
}) => {
  
  // Helper props object to pass down easily
  const txProps = { transactionsMap, onTransactionChange };

  return (
    <div className="space-y-3">
      
      {/* 1. ОБЩИЕ (Итого) */}
      <CategoryBlock 
        title="Сводка" 
        icon={Wallet} 
        colorClass="text-emerald-600 dark:text-emerald-400"
        bgClass="bg-emerald-50/40 dark:bg-emerald-900/10"
      >
        <FinancialRow 
            label="Доходы" 
            planKey="income_total_plan" 
            factKey="income_total_fact" 
            values={formData} 
            onChange={onChange} 
            {...txProps}
        />
        <FinancialRow 
            label="Расходы" 
            planKey="expense_total_plan" 
            factKey="expense_total_fact" 
            values={formData} 
            onChange={onChange} 
            {...txProps}
        />
        
        <CalculatedRow 
            label="Валовая прибыль" 
            value={formData.gross_profit} 
            colorClass="text-emerald-600 dark:text-emerald-400"
        />
      </CategoryBlock>

      {/* 2. ОБОРУДОВАНИЕ */}
      <CategoryBlock 
        title="Оборудование" 
        icon={Hammer} 
        colorClass="text-blue-600 dark:text-blue-400"
        bgClass="bg-blue-50/40 dark:bg-blue-900/10"
      >
        <FinancialRow 
            label="Доходы" 
            planKey="income_equip_plan" 
            factKey="income_equip_fact" 
            values={formData} 
            onChange={onChange} 
            {...txProps}
        />
        <FinancialRow 
            label="Расходы" 
            planKey="expense_equip_plan" 
            factKey="expense_equip_fact" 
            values={formData} 
            onChange={onChange} 
            {...txProps}
        />
      </CategoryBlock>

      {/* 3. ОБРАМЛЕНИЕ */}
      <CategoryBlock 
        title="Обрамление" 
        icon={Maximize} 
        colorClass="text-amber-600 dark:text-amber-400"
        bgClass="bg-amber-50/40 dark:bg-amber-900/10"
      >
        <FinancialRow 
            label="Доходы" 
            planKey="income_frame_plan" 
            factKey="income_frame_fact" 
            values={formData} 
            onChange={onChange} 
            {...txProps}
        />
        <FinancialRow 
            label="Расходы" 
            planKey="expense_frame_plan" 
            factKey="expense_frame_fact" 
            values={formData} 
            onChange={onChange} 
            {...txProps}
        />
      </CategoryBlock>

      {/* 4. МОНТАЖ */}
      <CategoryBlock 
        title="Монтаж" 
        icon={Settings} 
        colorClass="text-fuchsia-600 dark:text-fuchsia-400"
        bgClass="bg-fuchsia-50/40 dark:bg-fuchsia-900/10"
      >
        <FinancialRow 
            label="Доходы" 
            planKey="income_install_plan" 
            factKey="income_install_fact" 
            values={formData} 
            onChange={onChange} 
            {...txProps}
        />
        <FinancialRow 
            label="Расходы" 
            planKey="expense_install_plan" 
            factKey="expense_install_fact" 
            values={formData} 
            onChange={onChange} 
            {...txProps}
        />
      </CategoryBlock>

      {/* 5. ПРОЧЕЕ (ФОТ и т.д.) */}
      <div className="px-2 pt-2 border-t border-gray-100 dark:border-white/5">
         <div className="flex items-center gap-2 mb-2 text-gray-400">
            <Calculator size={12} />
            <span className="text-[10px] font-bold uppercase">Дополнительно</span>
         </div>
         <SingleRow 
            label="Расходы ФОТ" 
            fieldKey="expense_fot_fact" 
            value={formData.expense_fot_fact} 
            colorClass="text-gray-600 dark:text-gray-300"
            {...txProps}
        />
      </div>

    </div>
  );
};

export default FinancialSection;
