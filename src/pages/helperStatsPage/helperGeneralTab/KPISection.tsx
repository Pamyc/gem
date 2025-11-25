import React, { useMemo } from 'react';
import DynamicCard from '../../../components/cards/DynamicCard';
import { CardConfig } from '../../../types/card';

const KPISection: React.FC = () => {
  // --- KPI CONFIGURATIONS ---
  const kpiConfigs = useMemo<CardConfig[]>(() => [
    // Row 1

    {
      template: "gradient",
      title: "Чистая прибыль",
      sheetKey: "clientGrowth",
      dataColumn: "Валовая",
      aggregation: "sum",
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
      valuePrefix: "₽ ",
      valueSuffix: "",
      compactNumbers: true,
      icon: "Banknote",
      showIcon: true,
      showTrend: false,
      trendValue: "",
      trendDirection: "up",
      width: "100%",
      height: "auto",
      colorTheme: "orange",
      gradientFrom: "orange",
      gradientTo: "amber",
      elements: []
    },

    {
      template: "gradient",
      title: "Затраты",
      sheetKey: "clientGrowth",
      dataColumn: "Расходы + Итого + факт",
      aggregation: "sum",
      filters: [
        {
          id: "td7n9i718",
          column: "Итого (Да/Нет)",
          operator: "equals",
          value: "Нет"
        },
        {
          id: "lha1msbcy",
          column: "Без разбивки на литеры (Да/Нет)",
          operator: "equals",
          value: "Да"
        }
      ],
      valuePrefix: "₽ ",
      valueSuffix: "",
      compactNumbers: true,
      icon: "ShoppingCart",
      showIcon: true,
      showTrend: false,
      trendValue: "0%",
      trendDirection: "neutral",
      width: "100%",
      height: "auto",
      colorTheme: "blue",
      gradientFrom: "purple",
      gradientTo: "blue",
      elements: []
    },
    {
      template: "gradient",
      title: "Рентабельность",
      sheetKey: "clientGrowth",
      dataColumn: "Рентабельность",
      aggregation: "average",
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
      valueSuffix: " %",
      icon: "Banknote",
      showIcon: true,
      showTrend: false,
      trendValue: "",
      trendDirection: "up",
      width: "100%",
      height: "auto",
      colorTheme: "orange",
      gradientFrom: "orange",
      gradientTo: "amber",
      elements: []
    },
    // Row 2

    {
      template: "gradient",
      title: "Всего лифтов",
      sheetKey: "clientGrowth",
      dataColumn: "Кол-во лифтов",
      aggregation: "sum",
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
      valueSuffix: " шт",
      icon: "ArrowUpFromLine",
      showIcon: true,
      showTrend: false,
      trendValue: "",
      trendDirection: "up",
      width: "100%",
      height: "auto",
      colorTheme: "emerald",
      gradientFrom: "emerald",
      gradientTo: "teal",
      elements: []
    },
    {
      template: "gradient",
      title: "Всего этажей",
      sheetKey: "clientGrowth",
      dataColumn: "Кол-во этажей",
      aggregation: "sum",
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
      valueSuffix: " шт",
      icon: "ArrowUpFromLine",
      showIcon: true,
      showTrend: false,
      trendValue: "",
      trendDirection: "up",
      width: "100%",
      height: "auto",
      colorTheme: "emerald",
      gradientFrom: "emerald",
      gradientTo: "teal",
      elements: []
    },
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
      gradientTo: "cyan",
      elements: []
    },
    {
      template: "gradient",
      title: "Всего закрытых договоров",
      sheetKey: "clientGrowth",
      dataColumn: "Сдан да/нет",
      aggregation: "count",
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
        },
        {
          id: "8jz2j15j5",
          column: "Сдан да/нет",
          operator: "equals",
          value: "Да"
        }
      ],
      valuePrefix: "",
      valueSuffix: "",
      icon: "Building",
      showIcon: true,
      showTrend: false,
      trendValue: "",
      trendDirection: "up",
      width: "100%",
      height: "auto",
      colorTheme: "violet",
      gradientFrom: "violet",
      gradientTo: "purple",
      elements: []
    },
    {
      template: "custom",
  title: "Мой показатель",
  sheetKey: "clientGrowth",
  dataColumn: "",
  aggregation: "sum",
  filters: [],
  valuePrefix: "",
  valueSuffix: "",
  compactNumbers: false,
  icon: "Users",
  showIcon: true,
  showTrend: false,
  trendValue: "0%",
  trendDirection: "neutral",
  width: "100%",
  height: "80px",
  colorTheme: "blue",
  gradientFrom: "violet",
  gradientTo: "fuchsia",
  elements: [
    {
      id: "icon-g4oc6",
      type: "icon",
      style: {
        top: 15,
        left: 20,
        fontSize: 24,
        color: "#ffffff",
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
        padding: 10,
        width: 44,
        height: 44
      }
    },
    {
      id: "89atzno1j",
      type: "value",
      style: {
        top: 20,
        left: 255,
        fontSize: 24,
        color: "#000000",
        zIndex: 10,
        width: "auto",
        height: "auto",
        fontWeight: "bold"
      },
      dataSettings: {
        dataColumn: "Кол-во этажей",
        aggregation: "unique",
        filters: [
          {
            id: "9yc7jdlvw",
            column: "Город",
            operator: "equals",
            value: "Кисловодск"
          }
        ]
      }
    },
    {
      id: "rmjsyhgvz",
      type: "text",
      style: {
        top: 30,
        left: 95,
        fontSize: 14,
        color: "#000000",
        zIndex: 10,
        width: "auto",
        height: "auto"
      },
      content: "Новый текст"
    }
  ],
  backgroundColor: "",
  borderColor: ""
    },
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