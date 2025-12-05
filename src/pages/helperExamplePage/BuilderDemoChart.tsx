
import React, { useMemo } from 'react';
import EChartComponent from '../../components/charts/EChartComponent';

interface BuilderDemoChartProps {
  isDarkMode: boolean;
}

const builderJson = {
  all: 10887,
  charts: {
    map: 3237,
    lines: 2164,
    bar: 7561,
    line: 7778,
    pie: 7355,
    scatter: 2405,
    candlestick: 1842,
    radar: 2090,
    heatmap: 1762,
    treemap: 1593,
    graph: 2060,
    boxplot: 1537,
    parallel: 1908,
    gauge: 2107,
    funnel: 1692,
    sankey: 1568
  },
  components: {
    geo: 2788,
    title: 9575,
    legend: 9400,
    tooltip: 9466,
    grid: 9266,
    markPoint: 3419,
    markLine: 2984,
    timeline: 2739,
    dataZoom: 2744,
    visualMap: 2466,
    toolbox: 3034,
    polar: 1945
  },
  ie: 9743
};

const downloadJson: Record<string, number> = {
  'echarts.min.js': 17365,
  'echarts.simple.min.js': 4079,
  'echarts.common.min.js': 6929,
  'echarts.js': 14890
};

const themeJson: Record<string, number> = {
  'dark.js': 1594,
  'infographic.js': 925,
  'shine.js': 1608,
  'roma.js': 721,
  'macarons.js': 2179,
  'vintage.js': 1982
};

const BuilderDemoChart: React.FC<BuilderDemoChartProps> = ({ isDarkMode }) => {
  const option = useMemo(() => {
    // Генерация водяного знака
    const waterMarkText = 'ECHARTS';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      canvas.width = canvas.height = 100;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.08;
      // Адаптируем цвет текста под тему
      ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
      ctx.font = '20px Microsoft Yahei';
      ctx.translate(50, 50);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(waterMarkText, 0, 0);
    }

    return {
      backgroundColor: {
        type: 'pattern',
        image: canvas,
        repeat: 'repeat'
      },
      tooltip: {},
      title: [
        {
          text: 'Онлайн сборка',
          subtext: 'Всего ' + builderJson.all,
          left: '25%',
          textAlign: 'center',
          textStyle: { color: isDarkMode ? '#e2e8f0' : '#333' }
        },
        {
          text: 'Скачивания версий',
          subtext:
            'Всего ' +
            Object.keys(downloadJson).reduce(function (all, key) {
              return all + downloadJson[key];
            }, 0),
          left: '75%',
          textAlign: 'center',
          textStyle: { color: isDarkMode ? '#e2e8f0' : '#333' }
        },
        {
          text: 'Скачивания тем',
          subtext:
            'Всего ' +
            Object.keys(themeJson).reduce(function (all, key) {
              return all + themeJson[key];
            }, 0),
          left: '75%',
          top: '50%',
          textAlign: 'center',
          textStyle: { color: isDarkMode ? '#e2e8f0' : '#333' }
        }
      ],
      grid: [
        {
          top: 50,
          width: '50%',
          bottom: '45%',
          left: 10,
          containLabel: true
        },
        {
          top: '55%',
          width: '50%',
          bottom: 0,
          left: 10,
          containLabel: true
        }
      ],
      xAxis: [
        {
          type: 'value',
          max: builderJson.all,
          splitLine: { show: false },
          axisLabel: { color: isDarkMode ? '#94a3b8' : '#64748b' }
        },
        {
          type: 'value',
          max: builderJson.all,
          gridIndex: 1,
          splitLine: { show: false },
          axisLabel: { color: isDarkMode ? '#94a3b8' : '#64748b' }
        }
      ],
      yAxis: [
        {
          type: 'category',
          data: Object.keys(builderJson.charts),
          axisLabel: {
            interval: 0,
            rotate: 30,
            color: isDarkMode ? '#94a3b8' : '#64748b'
          },
          splitLine: { show: false }
        },
        {
          gridIndex: 1,
          type: 'category',
          data: Object.keys(builderJson.components),
          axisLabel: {
            interval: 0,
            rotate: 30,
            color: isDarkMode ? '#94a3b8' : '#64748b'
          },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          type: 'bar',
          stack: 'chart',
          z: 3,
          label: {
            position: 'right',
            show: true,
            color: isDarkMode ? '#e2e8f0' : '#333'
          },
          data: Object.keys(builderJson.charts).map(function (key) {
            // @ts-ignore
            return builderJson.charts[key];
          })
        },
        {
          type: 'bar',
          stack: 'chart',
          silent: true,
          itemStyle: {
            color: isDarkMode ? '#334155' : '#eee'
          },
          data: Object.keys(builderJson.charts).map(function (key) {
            // @ts-ignore
            return builderJson.all - builderJson.charts[key];
          })
        },
        {
          type: 'bar',
          stack: 'component',
          xAxisIndex: 1,
          yAxisIndex: 1,
          z: 3,
          label: {
            position: 'right',
            show: true,
            color: isDarkMode ? '#e2e8f0' : '#333'
          },
          data: Object.keys(builderJson.components).map(function (key) {
            // @ts-ignore
            return builderJson.components[key];
          })
        },
        {
          type: 'bar',
          stack: 'component',
          silent: true,
          xAxisIndex: 1,
          yAxisIndex: 1,
          itemStyle: {
            color: isDarkMode ? '#334155' : '#eee'
          },
          data: Object.keys(builderJson.components).map(function (key) {
            // @ts-ignore
            return builderJson.all - builderJson.components[key];
          })
        },
        {
          type: 'pie',
          radius: [0, '30%'],
          center: ['75%', '25%'],
          data: Object.keys(downloadJson).map(function (key) {
            return {
              name: key.replace('.js', ''),
              value: downloadJson[key]
            };
          }),
          label: { color: isDarkMode ? '#e2e8f0' : '#333' }
        },
        {
          type: 'pie',
          radius: [0, '30%'],
          center: ['75%', '75%'],
          data: Object.keys(themeJson).map(function (key) {
            return {
              name: key.replace('.js', ''),
              value: themeJson[key]
            };
          }),
          label: { color: isDarkMode ? '#e2e8f0' : '#333' }
        }
      ]
    };
  }, [isDarkMode]);

  return (
    <div className="w-full h-full min-h-[600px]">
      <EChartComponent
        options={option}
        theme={isDarkMode ? 'dark' : 'light'}
        height="100%"
      />
    </div>
  );
};

export default BuilderDemoChart;
