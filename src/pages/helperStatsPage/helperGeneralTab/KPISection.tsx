import React, { useMemo } from 'react';
import DynamicCard from '../../../components/cards/DynamicCard';
import { CardConfig } from '../../../types/card';

const KPISection: React.FC = () => {
  // --- KPI CONFIGURATIONS ---
  const kpiConfigs = useMemo<CardConfig[]>(() => [
    // Row 1

    {
      template: "custom",
      title: "Валовая прибыль",
      sheetKey: "",
      dataColumn: "",
      aggregation: "sum",
      filters: [],
      valuePrefix: "",
      valueSuffix: " ₽",
      compactNumbers: false,
      icon: "Users",
      showIcon: true,
      showTrend: false,
      trendValue: "0%",
      trendDirection: "neutral",
      width: "100%",
      height: "150px",
      colorTheme: "blue",
      gradientFrom: "cyan",
      gradientTo: "emerald",
      elements: [
        {
          id: "value-q6cne",
          type: "value",
          style: {
            top: 70,
            left: 25,
            fontSize: 37,
            color: "#ffffff",
            fontWeight: "bold"
          },
          dataSettings: {
            sheetKey: "clientGrowth",
            dataColumn: "Валовая",
            aggregation: "sum",
            filters: [
              {
                id: "uaxlml8uu",
                column: "Итого (Да/Нет)",
                operator: "equals",
                value: "Нет"
              },
              {
                id: "684qb4n5p",
                column: "Без разбивки на литеры (Да/Нет)",
                operator: "equals",
                value: "Да"
              }
            ]
          }
        },
        {
          id: "title-j5jou",
          type: "title",
          style: {
            top: 25,
            left: 25,
            fontSize: 23,
            color: "rgba(255,255,255,0.8)",
            fontWeight: "500"
          }
        }
      ],
      backgroundColor: "",
      borderColor: ""
    },

    {
      template: "custom",
      title: "Расходы общие",
      sheetKey: "",
      dataColumn: "",
      aggregation: "sum",
      filters: [],
      valuePrefix: "",
      valueSuffix: " ₽",
      compactNumbers: false,
      icon: "Users",
      showIcon: true,
      showTrend: false,
      trendValue: "0%",
      trendDirection: "neutral",
      width: "100%",
      height: "150px",
      colorTheme: "blue",
      gradientFrom: "red",
      gradientTo: "slate",
      elements: [
        {
          id: "value-q6cne",
          type: "value",
          style: {
            top: 70,
            left: 25,
            fontSize: 37,
            color: "#ffffff",
            fontWeight: "bold"
          },
          dataSettings: {
            sheetKey: "clientGrowth",
            dataColumn: "Расходы + Итого + факт",
            aggregation: "sum",
            filters: [
              {
                id: "uaxlml8uu",
                column: "Итого (Да/Нет)",
                operator: "equals",
                value: "Нет"
              },
              {
                id: "684qb4n5p",
                column: "Без разбивки на литеры (Да/Нет)",
                operator: "equals",
                value: "Да"
              }
            ]
          }
        },
        {
          id: "title-j5jou",
          type: "title",
          style: {
            top: 25,
            left: 25,
            fontSize: 23,
            color: "rgba(255,255,255,0.8)",
            fontWeight: "500"
          }
        }
      ],
      backgroundColor: "",
      borderColor: ""
    },
    {
      template: "custom",
      title: "Рентабельность по завершенным",
      sheetKey: "",
      dataColumn: "",
      aggregation: "sum",
      filters: [],
      valuePrefix: "",
      valueSuffix: " %",
      compactNumbers: false,
      icon: "Users",
      showIcon: true,
      showTrend: false,
      trendValue: "0%",
      trendDirection: "neutral",
      width: "100%",
      height: "150px",
      colorTheme: "blue",
      gradientFrom: "orange",
      gradientTo: "violet",
      elements: [
        {
          id: "value-q6cne",
          type: "value",
          style: {
            top: 70,
            left: 25,
            fontSize: 37,
            color: "#ffffff",
            fontWeight: "bold"
          },
          dataSettings: {
            sheetKey: "clientGrowth",
            dataColumn: "Рентабельность",
            aggregation: "average",
            filters: [
              {
                id: "uaxlml8uu",
                column: "Итого (Да/Нет)",
                operator: "equals",
                value: "Нет"
              },
              {
                id: "684qb4n5p",
                column: "Без разбивки на литеры (Да/Нет)",
                operator: "equals",
                value: "Да"
              },
              {
                id: "f3",
                column: "Сдан да/нет",
                operator: "equals",
                value: "да"
              }
            ]
          }
        },
        {
          id: "title-j5jou",
          type: "title",
          style: {
            top: 25,
            left: 25,
            fontSize: 23,
            color: "rgba(255,255,255,0.8)",
            fontWeight: "500"
          }
        }
      ],
      backgroundColor: "",
      borderColor: ""
    },

    {
      template: "custom",
      title: "Диапазон прибыли",
      sheetKey: "clientGrowth",
      dataColumn: "",
      aggregation: "sum",
      filters: [],
      valuePrefix: "₽ ",
      valueSuffix: "",
      compactNumbers: true,
      icon: "Activity",
      showIcon: true,
      showTrend: false,
      trendValue: "0%",
      trendDirection: "neutral",
      width: "100%",
      height: "150px",
      colorTheme: "violet",
      gradientFrom: "violet",
      gradientTo: "fuchsia",
      elements: [
        {
          id: "card-title",
          type: "title",
          style: {
            top: 25,
            left: 25,
            fontSize: 25,
            color: "rgba(255,255,255,0.9)",
            fontWeight: "600"
          }
        },
        {
          id: "icon-max",
          type: "icon",
          style: {
            top: 60,
            left: 25,
            fontSize: 20,
            color: "#4ade80",
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: 8,
            width: 36,
            height: 36
          },
          iconName: "ArrowUpRight"
        },
        {
          id: "label-max",
          type: "text",
          content: "MAX",
          style: {
            top: 60,
            left: 70,
            fontSize: 10,
            color: "#4ade80",
            fontWeight: "bold",
            opacity: 0.8
          }
        },
        {
          id: "value-max",
          type: "value",
          style: {
            top: 70,
            left: 70,
            fontSize: 22,
            color: "#ffffff",
            fontWeight: "bold"
          },
          dataSettings: {
            dataColumn: "Валовая",
            aggregation: "max",
            filters: [
              {
                id: "f1",
                column: "Итого (Да/Нет)",
                operator: "equals",
                value: "Нет"
              },
              {
                id: "f2",
                column: "Без разбивки на литеры (Да/Нет)",
                operator: "equals",
                value: "Да"
              },
              {
                id: "f3",
                column: "Сдан да/нет",
                operator: "equals",
                value: "да"
              }
            ]
          }
        },
        {
          id: "icon-min",
          type: "icon",
          style: {
            top: 100,
            left: 25,
            fontSize: 20,
            color: "#fb7185",
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: 8,
            width: 36,
            height: 36
          },
          iconName: "ArrowDownRight"
        },
        {
          id: "label-min",
          type: "text",
          content: "MIN",
          style: {
            top: 100,
            left: 70,
            fontSize: 10,
            color: "#fb7185",
            fontWeight: "bold",
            opacity: 0.8
          }
        },
        {
          id: "value-min",
          type: "value",
          style: {
            top: 110,
            left: 70,
            fontSize: 22,
            color: "#ffffff",
            fontWeight: "bold"
          },
          dataSettings: {
            dataColumn: "Валовая",
            aggregation: "min",
            filters: [
              {
                id: "f1",
                column: "Итого (Да/Нет)",
                operator: "equals",
                value: "Нет"
              },
              {
                id: "f2",
                column: "Без разбивки на литеры (Да/Нет)",
                operator: "equals",
                value: "Да"
              },
              {
                id: "f3",
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