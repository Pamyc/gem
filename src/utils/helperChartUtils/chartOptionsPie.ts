
import { ChartConfig } from '../../types/chart';

const colors = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#0ea5e9', '#f43f5e', '#84cc16', '#14b8a6'
];

export const getPieOptions = (
  groupedData: Map<string, Map<string, number[]>>,
  xValues: string[],
  config: ChartConfig,
  isDarkMode: boolean
) => {
  const pieData: any[] = [];
  
  if (config.segmentColumn) {
      // CASE A: Grouping enabled (Segment is slice)
      let colorIdx = 0;
      groupedData.forEach((segmentMap, segmentName) => {
          // Collect all values for this segment from the map
          let allValues: number[] = [];
          for (const vals of segmentMap.values()) {
              allValues.push(...vals);
          }
          
          let val = 0;
          if (allValues.length > 0) {
              if (config.aggregation === 'sum') val = allValues.reduce((a,b)=>a+b, 0);
              else if (config.aggregation === 'count') val = allValues.length;
              else if (config.aggregation === 'average') val = allValues.reduce((a,b)=>a+b, 0) / allValues.length;
              else if (config.aggregation === 'max') val = Math.max(...allValues);
              else if (config.aggregation === 'min') val = Math.min(...allValues);
          }

          if (val > 0 || config.aggregation === 'min') {
              pieData.push({
                  name: segmentName,
                  value: val,
                  itemStyle: { color: colors[colorIdx % colors.length] }
              });
          }
          colorIdx++;
      });
  } else {
      // CASE B: No Grouping (X-Axis is slice)
      xValues.forEach((x, idx) => {
         let allValuesForX: number[] = [];
         
         // Collect values for this X from all segments (likely just one 'Все данные')
         groupedData.forEach(segmentMap => {
             const v = segmentMap.get(x);
             if (v) allValuesForX.push(...v);
         });

         let val = 0;
         if (allValuesForX.length > 0) {
             if (config.aggregation === 'sum') val = allValuesForX.reduce((a,b)=>a+b, 0);
             else if (config.aggregation === 'count') val = allValuesForX.length;
             else if (config.aggregation === 'average') val = allValuesForX.reduce((a,b)=>a+b, 0) / allValuesForX.length;
             else if (config.aggregation === 'max') val = Math.max(...allValuesForX);
             else if (config.aggregation === 'min') val = Math.min(...allValuesForX);
         }
         
         if (val > 0 || (val === 0 && config.aggregation !== 'count' && config.aggregation !== 'sum')) {
             pieData.push({
                 name: x,
                 value: val,
                 itemStyle: { color: colors[idx % colors.length] }
             });
         }
      });
  }

  return {
      backgroundColor: 'transparent',
      title: {
        text: config.title,
        left: 'center',
        textStyle: { color: isDarkMode ? '#e2e8f0' : '#1e293b' }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: isDarkMode ? 'rgba(21, 25, 35, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' },
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        show: config.showLegend !== false,
        bottom: 0,
        textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' }
      },
      series: [
          {
              name: config.title,
              type: 'pie',
              radius: config.chartType === 'donut' ? ['35%', '55%'] : '55%',
              center: ['50%', '50%'],
              avoidLabelOverlap: true,
              itemStyle: {
                  borderRadius: 5,
                  borderColor: isDarkMode ? '#1e293b' : '#fff',
                  borderWidth: 2
              },
              label: {
                  show: config.showLabels,
                  formatter: ' {b|{b}：}{c}  {per|{d}%}  ',
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
                          lineHeight: 33
                      },
                      per: {
                          color: '#fff',
                          backgroundColor: isDarkMode ? '#6366f1' : '#4C5058',
                          padding: [3, 4],
                          borderRadius: 4
                      }
                  }
              },
              labelLine: {
                  show: config.showLabels,
                  length: 20,
                  length2: 15
              },
              emphasis: {
                  label: {
                      show: true,
                      fontSize: 16,
                      fontWeight: 'bold'
                  }
              },
              data: pieData
          }
      ]
  };
};
