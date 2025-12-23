
import React, { useMemo, useEffect, useState } from 'react';
import EChartComponent from '../../components/charts/EChartComponent';
import { Loader2, CalendarClock, AlertCircle } from 'lucide-react';

interface DailySchedule3DProps {
  isDarkMode: boolean;
}

const hours = [
  '12a', '1a', '2a', '3a', '4a', '5a', '6a',
  '7a', '8a', '9a', '10a', '11a',
  '12p', '1p', '2p', '3p', '4p', '5p',
  '6p', '7p', '8p', '9p', '10p', '11p'
];

const days = [
  'Saturday', 'Friday', 'Thursday',
  'Wednesday', 'Tuesday', 'Monday', 'Sunday'
];

const rawData = [
  [0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0], [0, 6, 0], [0, 7, 0], [0, 8, 0], [0, 9, 0], [0, 10, 0], [0, 11, 2], [0, 12, 4], [0, 13, 1], [0, 14, 1], [0, 15, 3], [0, 16, 4], [0, 17, 6], [0, 18, 4], [0, 19, 4], [0, 20, 3], [0, 21, 3], [0, 22, 2], [0, 23, 5],
  [1, 0, 7], [1, 1, 0], [1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0], [1, 6, 0], [1, 7, 0], [1, 8, 0], [1, 9, 0], [1, 10, 5], [1, 11, 2], [1, 12, 2], [1, 13, 6], [1, 14, 9], [1, 15, 11], [1, 16, 6], [1, 17, 7], [1, 18, 8], [1, 19, 12], [1, 20, 5], [1, 21, 5], [1, 22, 7], [1, 23, 2],
  [2, 0, 1], [2, 1, 1], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0], [2, 6, 0], [2, 7, 0], [2, 8, 0], [2, 9, 0], [2, 10, 3], [2, 11, 2], [2, 12, 1], [2, 13, 9], [2, 14, 8], [2, 15, 10], [2, 16, 6], [2, 17, 5], [2, 18, 5], [2, 19, 5], [2, 20, 7], [2, 21, 4], [2, 22, 2], [2, 23, 4],
  [3, 0, 7], [3, 1, 3], [3, 2, 0], [3, 3, 0], [3, 4, 0], [3, 5, 0], [3, 6, 0], [3, 7, 0], [3, 8, 1], [3, 9, 0], [3, 10, 5], [3, 11, 4], [3, 12, 7], [3, 13, 14], [3, 14, 13], [3, 15, 12], [3, 16, 9], [3, 17, 5], [3, 18, 5], [3, 19, 10], [3, 20, 6], [3, 21, 4], [3, 22, 4], [3, 23, 1],
  [4, 0, 1], [4, 1, 3], [4, 2, 0], [4, 3, 0], [4, 4, 0], [4, 5, 1], [4, 6, 0], [4, 7, 0], [4, 8, 0], [4, 9, 2], [4, 10, 4], [4, 11, 4], [4, 12, 2], [4, 13, 4], [4, 14, 4], [4, 15, 14], [4, 16, 12], [4, 17, 1], [4, 18, 8], [4, 19, 5], [4, 20, 3], [4, 21, 7], [4, 22, 3], [4, 23, 0],
  [5, 0, 2], [5, 1, 1], [5, 2, 0], [5, 3, 3], [5, 4, 0], [5, 5, 0], [5, 6, 0], [5, 7, 0], [5, 8, 2], [5, 9, 0], [5, 10, 4], [5, 11, 1], [5, 12, 5], [5, 13, 10], [5, 14, 5], [5, 15, 7], [5, 16, 11], [5, 17, 6], [5, 18, 0], [5, 19, 5], [5, 20, 3], [5, 21, 4], [5, 22, 2], [5, 23, 0],
  [6, 0, 1], [6, 1, 0], [6, 2, 0], [6, 3, 0], [6, 4, 0], [6, 5, 0], [6, 6, 0], [6, 7, 0], [6, 8, 0], [6, 9, 0], [6, 10, 1], [6, 11, 0], [6, 12, 2], [6, 13, 1], [6, 14, 3], [6, 15, 4], [6, 16, 0], [6, 17, 0], [6, 18, 0], [6, 19, 0], [6, 20, 1], [6, 21, 2], [6, 22, 2], [6, 23, 6]
];

const DailySchedule3D: React.FC<DailySchedule3DProps> = ({ isDarkMode }) => {
  const [isLibLoaded, setIsLibLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically load echarts-gl
    import('echarts-gl').then(() => {
      setIsLibLoaded(true);
    }).catch(err => {
      console.error("Failed to load echarts-gl:", err);
      setError("Не удалось загрузить 3D компонент. Проверьте соединение.");
    });
  }, []);

  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(21, 25, 35, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' },
      },
      visualMap: {
        max: 20,
        inRange: {
          color: [
            '#313695',
            '#4575b4',
            '#74add1',
            '#abd9e9',
            '#e0f3f8',
            '#ffffbf',
            '#fee090',
            '#fdae61',
            '#f46d43',
            '#d73027',
            '#a50026'
          ]
        },
        textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' },
        right: 10,
        bottom: 10
      },
      xAxis3D: {
        type: 'category',
        data: hours,
        name: 'Hour',
        axisLabel: { textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' } },
        axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0' } }
      },
      yAxis3D: {
        type: 'category',
        data: days,
        name: 'Day',
        axisLabel: { textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' } },
        axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0' } }
      },
      zAxis3D: {
        type: 'value',
        name: 'Activity',
        axisLabel: { textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' } },
        axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0' } }
      },
      grid3D: {
        boxWidth: 200,
        boxDepth: 80,
        viewControl: {
          // projection: 'orthographic'
          alpha: 40,
          beta: 40,
        },
        light: {
          main: {
            intensity: 1.2,
            shadow: true
          },
          ambient: {
            intensity: 0.3
          }
        },
        environment: 'transparent'
      },
      series: [
        {
          type: 'bar3D',
          data: rawData.map(function (item) {
            return {
              value: [item[1], item[0], item[2]]
            };
          }),
          shading: 'lambert',
          label: {
            show: false,
            fontSize: 16,
            borderWidth: 1
          },
          itemStyle: {
            opacity: 0.9
          },
          emphasis: {
            label: {
              fontSize: 20,
              color: '#900' // Keep original emphasis color or adjust
            },
            itemStyle: {
              color: '#f43f5e'
            }
          }
        }
      ]
    };
  }, [isDarkMode]);

  return (
    <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden relative">
       {/* Header */}
       <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <div className="flex items-center gap-3 backdrop-blur-md bg-white/80 dark:bg-black/40 p-2 pr-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
             <div className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                <CalendarClock size={20} />
             </div>
             <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Активность (Дни/Часы)</h3>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                   3D Bar Chart
                </p>
             </div>
          </div>
       </div>

       <div className="h-[500px] w-full flex items-center justify-center">
          {error ? (
             <div className="flex flex-col items-center gap-2 text-red-500 text-center p-4">
                <AlertCircle size={32} />
                <span className="text-sm font-medium">{error}</span>
                <span className="text-xs opacity-70">Попробуйте обновить страницу</span>
             </div>
          ) : !isLibLoaded ? (
             <div className="flex flex-col items-center gap-2 text-indigo-500">
                <Loader2 className="animate-spin" size={32} />
                <span className="text-sm font-medium">Загрузка 3D движка...</span>
             </div>
          ) : (
             <EChartComponent options={option} theme={isDarkMode ? 'dark' : 'light'} height="100%" />
          )}
       </div>
    </div>
  );
};

export default DailySchedule3D;
