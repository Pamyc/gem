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
      gradientTo: "red",
      elements: [
        {
          id: "value-q6cne",
          type: "value",
          style: {
            top: 70,
            left: 25,
            fontSize: 23,
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
      gradientTo: "orange",
      elements: [
        {
          id: "value-q6cne",
          type: "value",
          style: {
            top: 70,
            left: 25,
            fontSize: 23,
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
      title: "Рентабельность по закр.",
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
            fontSize: 23,
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
      valuePrefix: "",
      valueSuffix: " ₽",
      compactNumbers: false,
      icon: "Activity",
      showIcon: true,
      showTrend: false,
      trendValue: "0%",
      trendDirection: "neutral",
      width: "100%",
      height: "150px",
      colorTheme: "violet",
      gradientFrom: "violet",
      gradientTo: "emerald",
      elements: [
        {
          id: "card-title",
          type: "title",
          style: {
            top: 25,
            left: 25,
            fontSize: 23,
            color: "rgba(255,255,255,0.9)",
            fontWeight: "700"
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
            fontSize: 20,
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
            fontSize: 20,
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
      template: "custom",
      title: "Кол-во лифтов",
      sheetKey: "",
      dataColumn: "",
      aggregation: "sum",
      filters: [],
      valuePrefix: "",
      valueSuffix: " шт.",
      compactNumbers: false,
      icon: "Users",
      showIcon: true,
      showTrend: false,
      trendValue: "0%",
      trendDirection: "neutral",
      width: "100%",
      height: "150px",
      colorTheme: "blue",
      gradientFrom: "blue",
      gradientTo: "orange",
      elements: [
        {
          id: "value-q6cne",
          type: "value",
          style: {
            top: 70,
            left: 25,
            fontSize: 23,
            color: "#ffffff",
            fontWeight: "bold"
          },
          dataSettings: {
            sheetKey: "clientGrowth",
            dataColumn: "Кол-во лифтов",
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
      title: "Кол-во этажей",
      sheetKey: "",
      dataColumn: "",
      aggregation: "sum",
      filters: [],
      valuePrefix: "",
      valueSuffix: " этажей",
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
      gradientTo: "emerald",
      elements: [
        {
          id: "value-q6cne",
          type: "value",
          style: {
            top: 70,
            left: 25,
            fontSize: 23,
            color: "#ffffff",
            fontWeight: "bold"
          },
          dataSettings: {
            sheetKey: "clientGrowth",
            dataColumn: "Кол-во этажей",
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
      title: "Всего городов",
      sheetKey: "",
      dataColumn: "",
      aggregation: "unique",
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
      height: "150px",
      colorTheme: "blue",
      gradientFrom: "emerald",
      gradientTo: "red",
      elements: [
        {
          id: "value-q6cne",
          type: "value",
          style: {
            top: 70,
            left: 25,
            fontSize: 23,
            color: "#ffffff",
            fontWeight: "bold"
          },
          dataSettings: {
            sheetKey: "clientGrowth",
            dataColumn: "Город",
            aggregation: "unique",
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
      title: "Закрытых договоров",
      sheetKey: "",
      dataColumn: "",
      aggregation: "count",
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
      height: "150px",
      colorTheme: "blue",
      gradientFrom: "red",
      gradientTo: "violet",
      elements: [
        {
          id: "value-q6cne",
          type: "value",
          style: {
            top: 70,
            left: 25,
            fontSize: 23,
            color: "#ffffff",
            fontWeight: "bold"
          },
          dataSettings: {
            sheetKey: "clientGrowth",
            dataColumn: "Сдан да/нет",
            aggregation: "count",
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
                id: "784qb4n5p",
                column: "Сдан да/нет",
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