
import React, { useMemo } from 'react';
import { useDataStore } from '../../contexts/DataContext';
import { getMergedHeaders } from '../../utils/chartUtils';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Database, FileSpreadsheet, ArrowRightLeft } from 'lucide-react';

const DataIdentityCheck: React.FC = () => {
  const { googleSheets, sheetConfigs, isLoading } = useDataStore();

  const comparison = useMemo(() => {
    // 1. Определяем ключи
    const keys = {
      gs: 'clientGrowth',
      db: 'database_clientGrowth'
    };

    // Функция агрегации данных для конкретного ключа
    const aggregateData = (key: string) => {
      const sheetData = googleSheets[key as keyof typeof googleSheets];
      const config = sheetConfigs.find(c => c.key === key);
      
      if (!sheetData || !sheetData.headers || !sheetData.rows || !config) {
        return null;
      }

      const headerRowsCount = config.headerRows || 1;
      const headers = getMergedHeaders(sheetData.headers, headerRowsCount);

      // Индексы
      const idxTotal = headers.indexOf('Итого (Да/Нет)');
      const idxNoBreakdown = headers.indexOf('Без разбивки на литеры (Да/Нет)');
      
      const idxJK = headers.indexOf('ЖК');
      const idxElevators = headers.indexOf('Кол-во лифтов');
      const idxFloors = headers.indexOf('Кол-во этажей');
      const idxProfit = headers.indexOf('Валовая');

      if (idxJK === -1) return null;

      let countJK = 0;
      let sumElevators = 0;
      let sumFloors = 0;
      let sumProfit = 0;
      const uniqueJKs = new Set<string>();

      sheetData.rows.forEach(row => {
        // Фильтр "Итого": исключаем общие итоги
        if (idxTotal !== -1) {
           const val = String(row[idxTotal]).trim().toLowerCase();
           if (val === 'да') return;
        }

        // Логика агрегации: используем строки "Без разбивки на литеры" = "Да" (это итоги по ЖК)
        // Если такой колонки нет, берем все строки (риск дублей, но для теста сойдет)
        if (idxNoBreakdown !== -1) {
           const val = String(row[idxNoBreakdown]).trim().toLowerCase();
           if (val !== 'да') return;
        }

        const jkName = String(row[idxJK] || '').trim();
        if (!jkName) return;

        uniqueJKs.add(jkName);

        const getVal = (idx: number) => {
            if (idx === -1) return 0;
            return parseFloat(String(row[idx]).replace(/\s/g, '').replace(',', '.')) || 0;
        };

        sumElevators += getVal(idxElevators);
        sumFloors += getVal(idxFloors);
        sumProfit += getVal(idxProfit);
      });

      countJK = uniqueJKs.size;

      return { countJK, sumElevators, sumFloors, sumProfit };
    };

    const gsStats = aggregateData(keys.gs);
    const dbStats = aggregateData(keys.db);

    if (!gsStats || !dbStats) return null;

    const diffs = {
        countJK: gsStats.countJK - dbStats.countJK,
        sumElevators: gsStats.sumElevators - dbStats.sumElevators,
        sumFloors: gsStats.sumFloors - dbStats.sumFloors,
        sumProfit: gsStats.sumProfit - dbStats.sumProfit,
    };

    const isIdentical = Object.values(diffs).every(d => Math.abs(d) < 0.01);

    return { gsStats, dbStats, diffs, isIdentical };
  }, [googleSheets, sheetConfigs]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#151923] rounded-3xl p-6 border border-gray-200 dark:border-white/10 flex items-center justify-center gap-3">
         <Loader2 className="animate-spin text-indigo-500" />
         <span className="text-gray-500 dark:text-gray-400 font-medium">Сверка данных...</span>
      </div>
    );
  }

  if (!comparison) {
    return (
        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-3xl p-6 border border-orange-200 dark:border-orange-500/20 flex items-center gap-3 text-orange-600 dark:text-orange-400">
            <AlertTriangle />
            <span className="font-medium">Не удалось загрузить данные для сравнения. Проверьте подключение источников.</span>
        </div>
    );
  }

  const { gsStats, dbStats, diffs, isIdentical } = comparison;

  const Row = ({ label, gsVal, dbVal, diff, isMoney = false }: { label: string, gsVal: number, dbVal: number, diff: number, isMoney?: boolean }) => {
      const isOk = Math.abs(diff) < 0.01;
      const fmt = (v: number) => isMoney ? v.toLocaleString('ru-RU') + ' ₽' : v.toLocaleString('ru-RU');
      
      return (
          <tr className={`border-b border-gray-100 dark:border-white/5 last:border-0 ${!isOk ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
              <td className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{label}</td>
              <td className="py-3 px-4 text-sm font-bold text-gray-800 dark:text-white font-mono text-right">{fmt(gsVal)}</td>
              <td className="py-3 px-4 text-sm font-bold text-gray-800 dark:text-white font-mono text-right">{fmt(dbVal)}</td>
              <td className="py-3 px-4 text-right">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${isOk ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                      {isOk ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {isOk ? 'OK' : (diff > 0 ? `+${fmt(diff)}` : fmt(diff))}
                  </div>
              </td>
          </tr>
      );
  };

  return (
    <div className={`rounded-3xl border shadow-sm overflow-hidden transition-all ${isIdentical ? 'bg-emerald-50/50 dark:bg-[#151923] border-emerald-200 dark:border-emerald-500/30' : 'bg-white dark:bg-[#151923] border-gray-200 dark:border-white/10'}`}>
        <div className="p-6 border-b border-gray-200 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${isIdentical ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'}`}>
                    <ArrowRightLeft size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Сверка целостности данных
                        {isIdentical && <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">Идентично</span>}
                        {!isIdentical && <span className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-200 dark:border-red-500/30">Найдены расхождения</span>}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Сравнение агрегированных показателей из двух источников</p>
                </div>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Метрика</th>
                        <th className="py-3 px-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-right flex items-center justify-end gap-2">
                            <FileSpreadsheet size={14} /> Google Sheets
                        </th>
                        <th className="py-3 px-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Database size={14} /> PostgreSQL
                            </div>
                        </th>
                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Статус</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    <Row label="Количество ЖК" gsVal={gsStats.countJK} dbVal={dbStats.countJK} diff={diffs.countJK} />
                    <Row label="Всего лифтов" gsVal={gsStats.sumElevators} dbVal={dbStats.sumElevators} diff={diffs.sumElevators} />
                    <Row label="Всего этажей" gsVal={gsStats.sumFloors} dbVal={dbStats.sumFloors} diff={diffs.sumFloors} />
                    <Row label="Валовая прибыль" gsVal={gsStats.sumProfit} dbVal={dbStats.sumProfit} diff={diffs.sumProfit} isMoney />
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default DataIdentityCheck;
