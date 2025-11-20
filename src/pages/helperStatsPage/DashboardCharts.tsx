import React, { useMemo } from 'react';
import * as echarts from 'echarts';
import EChartComponent from '../../components/charts/EChartComponent';

interface DashboardChartsProps {
  isDarkMode: boolean;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ isDarkMode }) => {
  
  // Цветовая палитра
  const colors = useMemo(() => ({
    text: isDarkMode ? '#94a3b8' : '#64748b', // Slate 400 vs Slate 500
    heading: isDarkMode ? '#e2e8f0' : '#334155',
    grid: isDarkMode ? '#334155' : '#e2e8f0', // Slate 700 vs Slate 200
    splitLine: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
    tooltipBg: isDarkMode ? 'rgba(21, 25, 35, 0.9)' : 'rgba(255, 255, 255, 0.95)',
    tooltipBorder: isDarkMode ? '#334155' : '#e2e8f0',
    tooltipText: isDarkMode ? '#f8fafc' : '#1e293b',
    
    // Accents
    primary: '#6366f1', // Indigo 500
    success: '#10b981', // Emerald 500
    pink: '#ec4899',    // Pink 500
    amber: '#f59e0b',   // Amber 500
  }), [isDarkMode]);

  const lineChartOption = useMemo(() => ({
    backgroundColor: 'transparent',
    title: { 
      text: 'Динамика обращений', 
      textStyle: { fontSize: 14, color: colors.text, fontWeight: 600 } 
    },
    tooltip: { 
      trigger: 'axis',
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      textStyle: { color: colors.tooltipText }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true, borderColor: colors.grid },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      axisLine: { lineStyle: { color: colors.grid } },
      axisLabel: { color: colors.text }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: colors.splitLine } },
      axisLabel: { color: colors.text }
    },
    series: [
      {
        name: 'Заявки',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210],
        lineStyle: { color: colors.primary, width: 3 },
        itemStyle: { color: colors.primary, borderColor: isDarkMode ? '#fff' : colors.primary },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(99, 102, 241, 0.5)' },
            { offset: 1, color: 'rgba(99, 102, 241, 0.0)' }
          ])
        }
      },
      {
        name: 'Решено',
        type: 'line',
        smooth: true,
        data: [100, 120, 90, 120, 85, 200, 190],
        lineStyle: { color: colors.success, width: 3 },
        itemStyle: { color: colors.success, borderColor: isDarkMode ? '#fff' : colors.success },
      }
    ]
  }), [colors, isDarkMode]);

  const barChartOption = useMemo(() => ({
    backgroundColor: 'transparent',
    title: { 
      text: 'Загрузка менеджеров', 
      textStyle: { fontSize: 14, color: colors.text, fontWeight: 600 } 
    },
    tooltip: { 
      trigger: 'axis', 
      axisPointer: { type: 'shadow' },
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      textStyle: { color: colors.tooltipText }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Анна', 'Олег', 'Мария', 'Дмитрий', 'Елена'],
      axisTick: { alignWithLabel: true },
      axisLine: { lineStyle: { color: colors.grid } },
      axisLabel: { color: colors.text }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: colors.splitLine } },
      axisLabel: { color: colors.text }
    },
    series: [
      {
        name: 'Обработано',
        type: 'bar',
        barWidth: '60%',
        data: [320, 250, 200, 334, 290],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#818cf8' },
            { offset: 1, color: '#4f46e5' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  }), [colors]);

  const donutChartOption = useMemo(() => ({
    backgroundColor: 'transparent',
    title: { 
      text: 'Категории', 
      left: 'center', 
      textStyle: { fontSize: 14, color: colors.text, fontWeight: 600 } 
    },
    tooltip: { 
      trigger: 'item',
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      textStyle: { color: colors.tooltipText }
    },
    legend: { 
      bottom: '0%', 
      left: 'center',
      textStyle: { color: colors.text }
    },
    series: [
      {
        name: 'Тип обращения',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: isDarkMode ? '#151923' : '#fff',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 20, fontWeight: 'bold', color: colors.heading }
        },
        data: [
          { value: 1048, name: 'Техподдержка', itemStyle: { color: colors.primary } },
          { value: 735, name: 'Продажи', itemStyle: { color: colors.pink } },
          { value: 580, name: 'Бухгалтерия', itemStyle: { color: colors.amber } },
          { value: 484, name: 'Другое', itemStyle: { color: colors.success } },
        ]
      }
    ]
  }), [colors, isDarkMode]);

  const pieChartOption = useMemo(() => ({
    backgroundColor: 'transparent',
    title: {
      text: 'Источники трафика',
      left: 'center',
      textStyle: { fontSize: 14, color: colors.text, fontWeight: 600 }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      textStyle: { color: colors.tooltipText }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { color: colors.text }
    },
    series: [
      {
        name: 'Источник',
        type: 'pie',
        radius: '50%',
        itemStyle: {
          borderColor: isDarkMode ? '#151923' : '#fff',
          borderWidth: 1
        },
        label: { color: colors.text },
        data: [
          { value: 1048, name: 'Поисковики', itemStyle: { color: '#6366f1' } },
          { value: 735, name: 'Прямой заход', itemStyle: { color: '#8b5cf6' } },
          { value: 580, name: 'Email', itemStyle: { color: '#d946ef' } },
          { value: 484, name: 'Реклама', itemStyle: { color: '#f43f5e' } },
          { value: 300, name: 'Видео', itemStyle: { color: '#f97316' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }), [colors, isDarkMode]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Row: Line Chart */}
      <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 transition-colors">
        <EChartComponent options={lineChartOption} height="350px" theme={isDarkMode ? 'dark' : 'light'} />
      </div>

      {/* Bottom Row: Bar and Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 transition-colors">
          <EChartComponent options={barChartOption} height="300px" theme={isDarkMode ? 'dark' : 'light'} />
        </div>
        <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 transition-colors">
          <EChartComponent options={donutChartOption} height="300px" theme={isDarkMode ? 'dark' : 'light'} />
        </div>
        <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 transition-colors">
          <EChartComponent options={pieChartOption} height="300px" theme={isDarkMode ? 'dark' : 'light'} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;