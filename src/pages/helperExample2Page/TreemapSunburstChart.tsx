
import React, { useState, useMemo } from 'react';
import { LayoutGrid, PieChart } from 'lucide-react';
import EChartComponent from '../../components/charts/EChartComponent';
import { ProcessedDataItem } from '../../hooks/useProcessedChartData';
import { formatLargeNumber } from '../../utils/formatUtils';
import { getColorPalette, PaletteType } from './ColorPalette';

interface TreemapSunburstChartProps {
  isDarkMode: boolean;
  data: ProcessedDataItem[];
  title?: string;
  radius?: string | string[] | number | number[];
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
  paletteType?: PaletteType;
}

const TreemapSunburstChart: React.FC<TreemapSunburstChartProps> = ({ 
  isDarkMode, 
  data, 
  title, 
  radius = ['30%', '60%'], 
  valuePrefix = '',
  valueSuffix = '',
  className = "w-full h-[350px]",
  paletteType = 'default'
}) => {
  const [chartType, setChartType] = useState<'treemap' | 'pie'>('treemap');
  const colors = useMemo(() => getColorPalette(paletteType as PaletteType), [paletteType]);

  // Pre-process data with colors for consistency across transitions
  const processedData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      itemStyle: { 
        color: colors[index % colors.length],
        borderColor: isDarkMode ? '#1e293b' : '#fff',
        borderWidth: 2
      }
    }));
  }, [data, isDarkMode, colors]);

  const option = useMemo(() => {
    const seriesCommon = {
      id: 'transition-series',
      data: processedData,
      universalTransition: true,
      animationDurationUpdate: 1000,
    };

    if (chartType === 'treemap') {
      return {
        backgroundColor: 'transparent',
        title: {
          text: title,
          left: 'center',
          textStyle: { color: isDarkMode ? '#e2e8f0' : '#1e293b' }
        },
        tooltip: {
           backgroundColor: isDarkMode ? 'rgba(21, 25, 35, 0.9)' : 'rgba(255, 255, 255, 0.95)',
           borderColor: isDarkMode ? '#334155' : '#e2e8f0',
           textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' },
           formatter: (params: any) => {
             const val = formatLargeNumber(params.value, valuePrefix);
             return `${params.marker} ${params.name}: <b>${val}${valueSuffix}</b>`;
           }
        },
        series: [
          {
            type: 'treemap',
            ...seriesCommon,
            roam: false,
            nodeClick: false,
            label: { 
              show: true, 
              formatter: (params: any) => {
                const val = formatLargeNumber(params.value, valuePrefix);
                return `${params.name}\n${val}${valueSuffix}`;
              } 
            },
            breadcrumb: { show: false },
            itemStyle: {
              borderColor: isDarkMode ? '#1e293b' : '#fff',
              gapWidth: 1,
              borderWidth: 1
            }
          }
        ]
      };
    } else {
      // Pie configuration with rich labels
      return {
        backgroundColor: 'transparent',
        title: {
          text: title,
          left: 'center',
          textStyle: { color: isDarkMode ? '#e2e8f0' : '#1e293b' }
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: isDarkMode ? 'rgba(21, 25, 35, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: isDarkMode ? '#334155' : '#e2e8f0',
          textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' },
          formatter: (params: any) => {
            const val = formatLargeNumber(params.value, valuePrefix);
            return `${params.name}: ${val}${valueSuffix} (${params.percent}%)`;
          }
        },
        series: [
          {
            name: title,
            type: 'pie',
            radius: radius,
            center: ['50%', '50%'],
            avoidLabelOverlap: true,
            ...seriesCommon,
            itemStyle: {
              borderRadius: 5,
              borderColor: isDarkMode ? '#1e293b' : '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              // Use function to inject formatted value into rich text template
              formatter: (params: any) => {
                const val = formatLargeNumber(params.value, valuePrefix);
                return `{per|${params.percent}%} {st|${val}${valueSuffix}}\n {b|${params.name} }    `;
              },
              backgroundColor: isDarkMode ? '#334155' : '#F6F8FC',
              borderColor: isDarkMode ? '#475569' : '#8C8D8E',
              borderWidth: 1,
              borderRadius: 4,
              rich: {
                a: {
                    color: isDarkMode ? '#94a3b8' : '#6E7079',
                    lineHeight: 22,
                    align: 'center'
                },
                hr: {
                    borderColor: isDarkMode ? '#475569' : '#8C8D8E',
                    width: '100%',
                    borderWidth: 1,
                    height: 0
                },
                b: {
                    color: isDarkMode ? '#fff' : '#4C5058',
                    fontSize: 14,
                    fontWeight: 'bold',
                    lineHeight: 33,
                    padding: [3, 4],
                    align: 'center'
                },
                per: {
                    color: '#fff',
                    backgroundColor: colors[0], // Use primary color
                    padding: [3, 4],
                    borderRadius: 4,
                    align: 'center'
                },
                st: {
                    color: '#fff',
                    backgroundColor: isDarkMode ? '#E07B7B' : '#E07B7B',
                    padding: [3, 4],
                    borderRadius: 4,
                    align: 'center'
                }
              }
            },
            labelLine: {
              show: true,
              length: 10,
              length2: 7
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            }
          }
        ]
      };
    }
  }, [chartType, processedData, isDarkMode, title, radius, valuePrefix, valueSuffix, colors]);

  return (
    <div className={`${className} relative group`}>
      
      {/* Chart Switcher Controls */}
      <div className="absolute top-0 right-0 z-10 flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 gap-1 border border-gray-200 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={() => setChartType('treemap')}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-bold transition-all ${
            chartType === 'treemap' 
              ? 'bg-white dark:bg-[#1e2433] text-indigo-500 shadow-sm' 
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <LayoutGrid size={14} />
          Treemap
        </button>
        <button 
          onClick={() => setChartType('pie')}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-bold transition-all ${
            chartType === 'pie' 
              ? 'bg-white dark:bg-[#1e2433] text-indigo-500 shadow-sm' 
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <PieChart size={14} />
          Pie
        </button>
      </div>

      <EChartComponent
        options={option}
        theme={isDarkMode ? 'dark' : 'light'}
        height="100%"
        merge={true} 
      />
    </div>
  );
};

export default TreemapSunburstChart;