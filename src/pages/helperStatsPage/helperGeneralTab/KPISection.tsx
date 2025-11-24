import React, { useMemo } from 'react';
import DynamicCard from '../../../components/cards/DynamicCard';
import { CardConfig } from '../../../types/card';

const KPISection: React.FC = () => {
  // --- KPI CONFIGURATIONS ---
  const kpiConfigs = useMemo<CardConfig[]>(() => [
    // Row 1
    {
      template: "gradient",
      title: "Всего городов",
      sheetKey: "clientGrowth",
      dataColumn: "Город",
      aggregation: "unique",
      filters: [
        {
          id: "0qyvlzape",
          column: "Итого (Да/Нет)",
          operator: "equals",
          value: "Нет"
        },
        {
          id: "7jz2j15j5",
          column: "Без разбивки на литеры (Да/Нет)",
          operator: "equals",
          value: "Да"
        }
      ],
      valuePrefix: "",
      valueSuffix: "",
      icon: "MapPin",
      showIcon: true,
      showTrend: false,
      trendValue: "",
      trendDirection: "neutral",
      width: "100%",
      height: "auto",
      colorTheme: "blue",
      gradientFrom: "blue",
      gradientTo: "cyan"
    },
    {
      template: "gradient",
      title: "Всего ЖК",
      sheetKey: "clientGrowth",
      dataColumn: "ЖК",
      aggregation: "count",
      filters: [],
      valuePrefix: "",
      valueSuffix: "",
      icon: "Building",
      showIcon: true,
      showTrend: true,
      trendValue: "",
      trendDirection: "up",
      width: "100%",
      height: "auto",
      colorTheme: "violet",
      gradientFrom: "violet",
      gradientTo: "purple"
    },
    {
      template: "gradient",
      title: "Всего лифтов",
      sheetKey: "clientGrowth",
      dataColumn: "Кол-во лифтов",
      aggregation: "sum",
      filters: [],
      valuePrefix: "",
      valueSuffix: " шт",
      icon: "ArrowUpFromLine",
      showIcon: true,
      showTrend: true,
      trendValue: "",
      trendDirection: "up",
      width: "100%",
      height: "auto",
      colorTheme: "emerald",
      gradientFrom: "emerald",
      gradientTo: "teal"
    },
    {
      template: "gradient",
      title: "Валовая прибыль",
      sheetKey: "clientGrowth",
      dataColumn: "Валовая",
      aggregation: "sum",
      filters: [],
      valuePrefix: "₽ ",
      valueSuffix: "",
      icon: "Banknote",
      showIcon: true,
      showTrend: true,
      trendValue: "",
      trendDirection: "up",
      width: "100%",
      height: "auto",
      colorTheme: "orange",
      gradientFrom: "orange",
      gradientTo: "amber"
    },
    // Row 2
    {
      template: "classic",
      title: "Средняя прибыль",
      sheetKey: "clientGrowth",
      dataColumn: "Прибыль с 1 лифта",
      aggregation: "average",
      filters: [],
      valuePrefix: "₽ ",
      valueSuffix: "",
      icon: "TrendingUp",
      showIcon: true,
      showTrend: true,
      trendValue: "",
      trendDirection: "up",
      width: "100%",
      height: "auto",
      colorTheme: "pink",
      gradientFrom: "pink",
      gradientTo: "rose"
    },
    {
      template: "classic",
      title: "Всего этажей",
      sheetKey: "clientGrowth",
      dataColumn: "Кол-во этажей",
      aggregation: "sum",
      filters: [],
      valuePrefix: "",
      valueSuffix: " эт",
      icon: "Layers",
      showIcon: true,
      showTrend: false,
      trendValue: "",
      trendDirection: "neutral",
      width: "100%",
      height: "auto",
      colorTheme: "cyan",
      gradientFrom: "cyan",
      gradientTo: "blue"
    },
    {
      template: "classic",
      title: "Новые клиенты",
      sheetKey: "clientGrowth",
      dataColumn: "Заказчик",
      aggregation: "count",
      filters: [],
      valuePrefix: "",
      valueSuffix: "",
      icon: "Users",
      showIcon: true,
      showTrend: true,
      trendValue: "",
      trendDirection: "up",
      width: "100%",
      height: "auto",
      colorTheme: "indigo",
      gradientFrom: "indigo",
      gradientTo: "violet"
    },
    {
      template: "classic",
      title: "Активность",
      sheetKey: "clientGrowth",
      dataColumn: "Кол-во лифтов",
      aggregation: "count",
      filters: [],
      valuePrefix: "",
      valueSuffix: "",
      icon: "Activity",
      showIcon: true,
      showTrend: true,
      trendValue: "",
      trendDirection: "neutral",
      width: "100%",
      height: "auto",
      colorTheme: "rose",
      gradientFrom: "rose",
      gradientTo: "red"
    }
  ], []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 min-[2000px]:grid-cols-4 gap-6">
      {kpiConfigs.map((config, idx) => (
        <DynamicCard key={idx} config={config} />
      ))}
    </div>
  );
};

export default KPISection;