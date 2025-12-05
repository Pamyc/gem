
import React from 'react';
import { ExternalLink, Image as ImageIcon, BarChart3, TrendingUp, DollarSign, PenTool } from 'lucide-react';
import { getImgByName } from '../utils/driveUtils';
import { googleFileLinks } from '../utils/linkForGoogleFiles';
import ElevatorsByLiterChart from './helperExamplePage/ElevatorsByLiterChart';
import TimelineGDPChart from './helperExamplePage/TimelineGDPChart';
import TimelineFinanceChart from './helperExamplePage/TimelineFinanceChart';
import BuilderDemoChart from './helperExamplePage/BuilderDemoChart';
import ComparisonChart from './helperExamplePage/ComparisonChart';

interface ExamplePageProps {
  isDarkMode: boolean;
}

const ExamplePage: React.FC<ExamplePageProps> = ({ isDarkMode }) => {
  // Имя файла в реестре
  const fileNameKey = "oktbr_park";
  
  // Получаем ссылку на изображение по имени (для основного просмотра)
  const imageUrl = getImgByName(fileNameKey, 'w2000') || '';
  
  // Получаем оригинальную ссылку из реестра для отображения в UI
  const sourceLink = googleFileLinks[fileNameKey];

  return (
    <div className="w-full max-w-[1152px] mx-auto space-y-8 p-6">
      
      

      {/* New Chart Section */}
      <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden p-6">
         <div className="mb-6 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
               <BarChart3 size={24} />
            </div>
            <div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white">Распределение лифтов по литерам</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400">Цвета сгруппированы по Жилым Комплексам</p>
            </div>
         </div>
         
         <div className="h-[450px]">
            <ElevatorsByLiterChart isDarkMode={isDarkMode} />
         </div>
      </div>

      {/* Finance Timeline Chart Section */}
      <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden p-6">
         <div className="mb-6 flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-500/20 rounded-xl text-violet-600 dark:text-violet-400">
               <DollarSign size={24} />
            </div>
            <div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white">Финансовая динамика по ЖК</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400">План / Факт доходов и расходов во времени</p>
            </div>
         </div>
         
         <div className="w-full">
            <TimelineFinanceChart isDarkMode={isDarkMode} />
         </div>
      </div>

      {/* Preview Section for the specific file */}
      <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden p-6">
         <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <ImageIcon size={20} className="text-purple-500" /> 
            Просмотр файла по ключу: <span className="text-indigo-500 font-mono bg-indigo-50 dark:bg-indigo-500/10 px-2 rounded">"{fileNameKey}"</span>
         </h3>
         
         <div className="relative w-full h-96 rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#0b0f19] group border border-gray-200 dark:border-white/5">
            {imageUrl ? (
              <img 
                 src={imageUrl} 
                 alt="oktbr_park.jpg" 
                 className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">Не удалось загрузить изображение</div>
            )}
            
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <a 
                 href={sourceLink} 
                 target="_blank" 
                 rel="noreferrer"
                 className="bg-white text-gray-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
               >
                 Открыть оригинал <ExternalLink size={16} />
               </a>
            </div>
         </div>
         <div className="mt-4 flex flex-col gap-2">
            <div className="text-xs text-gray-400 font-mono break-all bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/5">
                <span className="font-bold text-gray-500">Registry Source:</span> {sourceLink}
            </div>
            <div className="text-xs text-gray-400 font-mono break-all bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/5">
                <span className="font-bold text-indigo-500">Generated URL:</span> {imageUrl}
            </div>
         </div>
      </div>

      {/* GDP Timeline Chart Section */}
      <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden p-6">
         <div className="mb-6 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
               <TrendingUp size={24} />
            </div>
            <div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white">Динамика макроэкономических показателей</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400">Временная шкала ВВП и секторов экономики (Пример)</p>
            </div>
         </div>
         
         <div className="w-full">
            <TimelineGDPChart isDarkMode={isDarkMode} />
         </div>
      </div>

      {/* Builder Demo Chart Section */}
      <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden p-6">
         <div className="mb-6 flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-xl text-orange-600 dark:text-orange-400">
               <PenTool size={24} />
            </div>
            <div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white">Статистика ECharts</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400">Демонстрация сложной компоновки и водяных знаков</p>
            </div>
         </div>
         
         <div className="w-full h-[700px]">
            <BuilderDemoChart isDarkMode={isDarkMode} />
         </div>
      </div>

      {/* Comparison Chart Section (New) */}
      <div className="w-full">
         <ComparisonChart isDarkMode={isDarkMode} />
      </div>
      
    </div>
  );
};

export default ExamplePage;
