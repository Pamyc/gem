
import React, { useMemo, useState, useEffect } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import DynamicChart from '../components/charts/DynamicChart';
import { ChartConfig } from '../types/chart';

interface TestEmbedChartProps {
  isEmbed?: boolean;
  isDarkMode: boolean;
}

const TestEmbedChart: React.FC<TestEmbedChartProps> = ({ isEmbed = false, isDarkMode }) => {
  const [copied, setCopied] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');

  // Генерация URL при монтировании (клиентская сторона)
  useEffect(() => {
    try {
      // Используем текущий href как базу, чтобы гарантировать корректный домен и протокол
      const url = new URL(window.location.href);
      
      // Очищаем текущие параметры, чтобы не дублировать их
      url.search = '';
      
      // Добавляем нужные параметры
      url.searchParams.set('mode', 'embed');
      url.searchParams.set('theme', isDarkMode ? 'dark' : 'light');
      
      setEmbedUrl(url.toString());
    } catch (e) {
      console.error('Ошибка генерации URL:', e);
      setEmbedUrl('#error');
    }
  }, [isDarkMode]);

  // Конфигурация демонстрационного графика
  const chartConfig: ChartConfig = useMemo(() => ({
    title: "Статистика лифтов (Embed Demo)",
    sheetKey: "clientGrowth",
    chartType: "bar",
    xAxisColumn: "Город",
    yAxisColumn: "Кол-во лифтов",
    segmentColumn: "",
    aggregation: "sum",
    isCumulative: false,
    showLabels: true,
    showDataZoomSlider: false,
    showLegend: false,
    filters: [
        { id: "f1", column: "Итого (Да/Нет)", operator: "equals", value: "Нет" },
        { id: "f2", column: "Без разбивки на литеры (Да/Нет)", operator: "equals", value: "Да" }
    ]
  }), []);

  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="400" frameborder="0"></iframe>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- РЕЖИМ EMBED (Изолированный) ---
  if (isEmbed) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-transparent flex flex-col">
        {/* Здесь можно добавить минимальный хедер или просто график на весь экран */}
        <div className="flex-1 w-full h-full min-h-0">
           <DynamicChart 
              config={chartConfig} 
              isDarkMode={isDarkMode} 
              height="100%" 
           />
        </div>
      </div>
    );
  }

  // --- РЕЖИМ АДМИНКИ (С настройками) ---
  return (
    <div className="w-full max-w-[1152px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
         <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Тест встраивания (Embed)</h2>
         <p className="text-gray-500 dark:text-gray-400">Проверьте, как график будет выглядеть на внешнем сайте через iframe.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Превью */}
          <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm p-6 flex flex-col">
             <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Предпросмотр графика</h3>
             <div className="flex-1 min-h-[300px] border border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-2 bg-gray-50 dark:bg-[#0b0f19]">
                <DynamicChart 
                    config={chartConfig} 
                    isDarkMode={isDarkMode} 
                    height="100%" 
                />
             </div>
          </div>

          {/* Настройки экспорта */}
          <div className="space-y-6">
             
             {/* Open Button */}
             <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Быстрый тест</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Откройте график в новой вкладке без интерфейса дашборда.</p>
                <a 
                    href={embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <ExternalLink size={18} />
                    Открыть изолированно
                </a>
             </div>

             {/* Iframe Code */}
             <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Код для вставки</h3>
                <div className="relative">
                    <pre className="bg-gray-100 dark:bg-black/20 p-4 rounded-xl text-xs font-mono text-gray-600 dark:text-gray-300 overflow-x-auto border border-gray-200 dark:border-white/5 whitespace-pre-wrap break-all">
                        {iframeCode}
                    </pre>
                    <button 
                        onClick={handleCopyCode}
                        className="absolute top-2 right-2 p-2 bg-white dark:bg-[#1e2433] rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:text-indigo-500 transition-colors shadow-sm"
                        title="Копировать"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                    * Убедитесь, что приложение развернуто на публичном сервере, чтобы iframe работал на других доменах.
                </p>
             </div>

          </div>
      </div>
    </div>
  );
};

export default TestEmbedChart;
