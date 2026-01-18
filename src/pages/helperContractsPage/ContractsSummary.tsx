
import React, { useMemo } from 'react';
import { useDataStore } from '../../contexts/DataContext';
import { getMergedHeaders } from '../../utils/chartUtils';
import { MapPin, Building, FileSignature, Building2, ArrowUpFromLine, Layers } from 'lucide-react';

const ContractsSummary: React.FC = () => {
  const { googleSheets, sheetConfigs } = useDataStore();

  const stats = useMemo(() => {
    const sheetKey = 'database_clientGrowth';
    const sheetData = googleSheets[sheetKey];

    const res = {
      cities: 0,
      jks: 0,
      contracts: 0,
      liters: 0,
      elevators: 0,
      floors: 0
    };

    if (!sheetData || !sheetData.headers || !sheetData.rows) return res;

    const config = sheetConfigs.find(c => c.key === sheetKey);
    const headerRowsCount = config?.headerRows || 1;
    const headers = getMergedHeaders(sheetData.headers, headerRowsCount);

    const idxCity = headers.indexOf('Город');
    const idxJK = headers.indexOf('ЖК');
    const idxElevators = headers.indexOf('Кол-во лифтов');
    const idxFloors = headers.indexOf('Кол-во этажей');
    const idxTotal = headers.indexOf('Итого (Да/Нет)');
    const idxNoBreakdown = headers.indexOf('Без разбивки на литеры (Да/Нет)');
    const idxSeparateLiter = headers.indexOf('Отдельный литер (Да/Нет)');

    if (idxCity === -1 || idxJK === -1) return res;

    const uniqueCities = new Set<string>();
    const uniqueJKs = new Set<string>();

    sheetData.rows.forEach(row => {
      // Исключаем общие итоги (строки "Итого")
      if (idxTotal !== -1 && String(row[idxTotal]).toLowerCase() === 'да') return;

      const city = String(row[idxCity]).trim();
      const jk = String(row[idxJK]).trim();
      
      if (city) uniqueCities.add(city);
      if (jk) uniqueJKs.add(jk);

      const elevators = parseFloat(String(row[idxElevators]).replace(',', '.')) || 0;
      const floors = parseFloat(String(row[idxFloors]).replace(',', '.')) || 0;

      res.elevators += elevators;
      res.floors += floors;

      // Договоры: строки агрегации по контракту
      const isContract = idxNoBreakdown !== -1 && String(row[idxNoBreakdown]).toLowerCase() === 'да';
      if (isContract) res.contracts++;

      // Литеры: строки отдельных литеров
      const isLiter = idxSeparateLiter !== -1 && String(row[idxSeparateLiter]).toLowerCase() === 'да';
      if (isLiter) res.liters++;
    });

    res.cities = uniqueCities.size;
    res.jks = uniqueJKs.size;

    return res;
  }, [googleSheets, sheetConfigs]);

  // Базовый класс для бейджей, имитирующий стиль карточек
  const itemClass = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border";
  const iconClass = "opacity-70 shrink-0";

  return (
    <div className="flex flex-wrap gap-3 px-1 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Cities */}
      <div className={`${itemClass} bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/5`}>
         <MapPin size={14} className={iconClass} />
         <span>{stats.cities} Городов</span>
      </div>
      
      {/* JKs */}
      <div className={`${itemClass} bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/5`}>
         <Building size={14} className={iconClass} />
         <span>{stats.jks} ЖК</span>
      </div>
      
      {/* Contracts */}
      <div className={`${itemClass} bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-500/30`}>
         <FileSignature size={14} className={iconClass} />
         <span>{stats.contracts} Договоров</span>
      </div>
      
      {/* Liters */}
      <div className={`${itemClass} bg-orange-50 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-500/30`}>
         <Building2 size={14} className={iconClass} />
         <span>{stats.liters} Литеров</span>
      </div>
      
      {/* Elevators */}
      <div className={`${itemClass} bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-500/30`}>
         <ArrowUpFromLine size={14} className={iconClass} />
         <span>{stats.elevators} Лифтов</span>
      </div>
      
      {/* Floors */}
      <div className={`${itemClass} bg-fuchsia-50 dark:bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-100 dark:border-fuchsia-500/30`}>
         <Layers size={14} className={iconClass} />
         <span>{stats.floors} Этажей</span>
      </div>
    </div>
  );
};

export default ContractsSummary;
