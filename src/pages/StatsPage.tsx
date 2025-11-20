import React from 'react';
import * as echarts from 'echarts';
import EChartComponent from '../components/charts/EChartComponent';

const StatsPage: React.FC = () => {
  const lineChartOption = {
    title: { text: 'Динамика обращений', textStyle: { fontSize: 14, color: '#64748b' } },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#64748b' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
    },
    series: [
      {
        name: 'Заявки',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210],
        lineStyle: { color: '#6366f1', width: 3 },
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
        lineStyle: { color: '#10b981', width: 3 },
      }
    ]
  };

  const barChartOption = {
    title: { text: 'Загрузка менеджеров', textStyle: { fontSize: 14, color: '#64748b' } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Анна', 'Олег', 'Мария', 'Дмитрий', 'Елена'],
      axisTick: { alignWithLabel: true },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#64748b' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
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
  };

  const donutChartOption = {
    title: { text: 'Категории', left: 'center', textStyle: { fontSize: 14, color: '#64748b' } },
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', left: 'center' },
    series: [
      {
        name: 'Тип обращения',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 20, fontWeight: 'bold' }
        },
        data: [
          { value: 1048, name: 'Техподдержка', itemStyle: { color: '#6366f1' } },
          { value: 735, name: 'Продажи', itemStyle: { color: '#ec4899' } },
          { value: 580, name: 'Бухгалтерия', itemStyle: { color: '#f59e0b' } },
          { value: 484, name: 'Другое', itemStyle: { color: '#10b981' } },
        ]
      }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Row: Line Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <EChartComponent options={lineChartOption} height="350px" />
      </div>

      {/* Bottom Row: Bar and Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <EChartComponent options={barChartOption} height="300px" />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <EChartComponent options={donutChartOption} height="300px" />
        </div>
      </div>
    </div>
  );
};

export default StatsPage;