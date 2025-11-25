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
      compactNumbers: false,
      icon: "Banknote",
      showIcon: true,
      showTrend: false,
      trendValue: "",
      trendDirection: "up",
      width: "100%",
      height: "150px",
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
      compactNumbers: false,
      icon: "ShoppingCart",
      showIcon: true,
      showTrend: false,
      trendValue: "0%",
      trendDirection: "neutral",
      width: "100%",
      height: "150px",
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
      height: "150px",
      colorTheme: "orange",
      gradientFrom: "orange",
      gradientTo: "amber",
      elements: []
    },

    {
      template: "custom",
      title: "Макс/Мин прибыль",
      sheetKey: "clientGrowth",
      dataColumn: "",
      aggregation: "sum",
      filters: [],
      valuePrefix: "",
      valueSuffix: "",
      compactNumbers: true,
      icon: "Users",
      showIcon: true,
      showTrend: false,
      trendValue: "0%",
      trendDirection: "neutral",
      width: "100%",
      height: "150px",
      colorTheme: "blue",
      gradientFrom: "violet",
      gradientTo: "fuchsia",
      elements: [
        {
          id: "icon-uxfox",
          type: "icon",
          style: {
            top: 45,
            left: 20,
            fontSize: 24,
            color: "#16fe31",
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 12,
            padding: 7,
            width: 44,
            height: 44
          },
          iconName: "ArrowUpRight"
        },
        {
          id: "value-pxil6",
          type: "value",
          style: {
            top: 100,
            left: 80,
            fontSize: 25,
            color: "#ffffff",
            fontWeight: "bold"
          },
          dataSettings: {
            dataColumn: "Валовая",
            aggregation: "min",
            filters: [
              {
                id: "2jeg2v0y0",
                column: "Итого (Да/Нет)",
                operator: "equals",
                value: "Нет"
              },
              {
                id: "8w0inphro",
                column: "Без разбивки на литеры (Да/Нет)",
                operator: "equals",
                value: "Да"
              },
              {
                id: "baoorfq8p",
                column: "Сдан да/нет",
                operator: "equals",
                value: "да"
              }
            ]
          }
        },
        {
          id: "title-fxbl5",
          type: "title",
          style: {
            top: 10,
            left: 15,
            fontSize: 24,
            color: "#ffffff",
            fontWeight: "500"
          }
        },
        {
          id: "48c44d1jb",
          type: "icon",
          style: {
            top: 95,
            left: 20,
            fontSize: 24,
            color: "#ff0000",
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 12,
            padding: 7,
            width: 44,
            height: 44
          },
          iconName: "ArrowDownRight"
        },
        {
          id: "j0hj7swsm",
          type: "value",
          style: {
            top: 50,
            left: 80,
            fontSize: 25,
            color: "#ffffff",
            fontWeight: "bold"
          },
          dataSettings: {
            dataColumn: "Валовая",
            aggregation: "max",
            filters: [
              {
                id: "yiq0mbknv",
                column: "Итого (Да/Нет)",
                operator: "equals",
                value: "Нет"
              },
              {
                id: "7atztawkw",
                column: "Без разбивки на литеры (Да/Нет)",
                operator: "equals",
                value: "Да"
              },
              {
                id: "95w6rpb13",
                column: "Сдан да/нет",
                operator: "equals",
                value: "да"
              }
            ]
          }
        }
      ],
      backgroundColor: "",
      borderColor: ""
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