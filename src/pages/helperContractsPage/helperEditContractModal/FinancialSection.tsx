

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

// Для статического отображения пар План/Факт (без редактирования)
const StaticFinancialRow: React.FC<{
    label: string;
    planValue: any;
    factValue: any;
}> = ({ label, planValue, factValue }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-white/50 dark:hover:bg-white/5 transition-colors rounded-lg px-2">
      {/* Label */}
      <div className="flex-1 min-w-0 mb-1 sm:mb-0">
        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 truncate block pr-2">
          {label}
        </span>
      </div>

      {/* Values Container */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        
        {/* PLAN */}
        <div className="relative flex-1 sm:w-28 group text-right px-1 py-0.5 border-b border-transparent">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 cursor-default">
            {formatMoney(planValue)}
          </span>
          <span className="absolute -top-2 left-0 text-[8px] font-bold text-rose-400/70 uppercase pointer-events-none">
            План
          </span>
        </div>

        <span className="text-gray-300 dark:text-gray-600 font-light px-1">/</span>

        {/* FACT */}
        <div className="relative flex-1 sm:w-28 group text-right px-1 py-0.5 border-b border-transparent">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-default">
            {formatMoney(factValue)}
          </span>
          <span className="absolute -top-2 left-0 text-[8px] font-bold text-indigo-400/70 uppercase pointer-events-none">
            Факт
          </span>
        </div>

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
        <StaticFinancialRow 
            label="Доходы" 
            planValue={formData.income_total_plan}
            factValue={formData.income_total_fact}
        />
        <StaticFinancialRow 
            label="Расходы" 
            planValue={formData.expense_total_plan}
            factValue={formData.expense_total_fact}
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

      {/* 5. ДОПОЛНИТЕЛЬНО */}
      <CategoryBlock 
        title="Дополнительно" 
        icon={Calculator} 
        colorClass="text-gray-600 dark:text-gray-400"
        bgClass="bg-gray-50 dark:bg-white/5"
      >
        <FinancialRow 
            label="Доходы" 
            planKey="income_add_plan" 
            factKey="income_add_fact" 
            values={formData} 
            onChange={onChange} 
            {...txProps}
        />
        <FinancialRow 
            label="Расходы" 
            planKey="expense_add_plan" 
            factKey="expense_add_fact" 
            values={formData} 
            onChange={onChange} 
            {...txProps}
        />
      </CategoryBlock>

    </div>
  );
};

export default FinancialSection;