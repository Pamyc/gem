
import React, { useMemo } from 'react';
import DynamicCard from '../../../components/cards/DynamicCard';
import { CardConfig } from '../../../types/card';

interface KPISectionProps {
  selectedCity: string;
  selectedYear: string;
}

const KPISection: React.FC<KPISectionProps> = ({ selectedCity, selectedYear }) => {
  // --- KPI CONFIGURATIONS ---
  const baseConfigs = useMemo<CardConfig[]>(() => [
    // Row 1

    {
      template: "custom",
      title: "Всего ЖК",
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
      height: "50px",
      colorTheme: "blue",
      gradientFrom: "emerald",
      gradientTo: "violet",
      elements: [
        {
          id: "value-q6cne",
          type: "value",
          style: {
            top: 8,
            left: 230,
            fontSize: 20,
            color: "#ffffff",
            fontWeight: "bold"
          },
          dataSettings: {
            sheetKey: "clientGrowth",
            dataColumn: "ЖК",
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
            top: 8,
            left: 20,
            fontSize: 20,
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
      title: "Всего литеров",
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
      height: "50px",
      colorTheme: "blue",
      gradientFrom: "violet",
      gradientTo: "orange",
      elements: [
        {
          id: "value-q6cne",
          type: "value",
          style: {
            top: 8,
            left: 230,
            fontSize: 20,
            color: "#ffffff",
            fontWeight: "bold"
          },
          dataSettings: {
            sheetKey: "clientGrowth",
            dataColumn: "ЖК",
            aggregation: "count",
            filters: [
              {
                id: "uaxlml8uu",
                column: "Итого (Да/Нет)",
                operator: "equals",
                value: "Нет"
              },
              {
                id: "284qb4n5p",
                column: "Отдельный литер (Да/Нет)",
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
            top: 8,
            left: 20,
            fontSize: 20,
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
      title: "Всего лифтов",
      sheetKey: "",
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
      height: "50px",
      colorTheme: "blue",
      gradientFrom: "orange",
      gradientTo: "blue",
      elements: [
        {
          id: "value-q6cne",
          type: "value",
          style: {
            top: 8,
            left: 230,
            fontSize: 20,
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
            top: 8,
            left: 20,
            fontSize: 20,
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
      title: "Всего этажей",
      sheetKey: "",
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
      height: "50px",
      colorTheme: "blue",
      gradientFrom: "blue",
      gradientTo: "violet",
      elements: [
        {
          id: "value-q6cne",
          type: "value",
          style: {
            top: 8,
            left: 230,
            fontSize: 20,
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
            top: 8,
            left: 20,
            fontSize: 20,
            color: "rgba(255,255,255,0.8)",
            fontWeight: "500"
          }
        }
      ],
      backgroundColor: "",
      borderColor: ""
    },

  ], []);

  // Apply dynamic filtering based on selectedCity and selectedYear
  const effectiveConfigs = useMemo(() => {
    if (!selectedCity && !selectedYear) return baseConfigs;

    return baseConfigs.map(config => {
      // Clone to avoid mutation
      const newConfig = JSON.parse(JSON.stringify(config));

      // Filter injection for elements
      if (newConfig.elements) {
        newConfig.elements.forEach((el: any) => {
          if (el.dataSettings) {
            if (!el.dataSettings.filters) el.dataSettings.filters = [];

            // Add City Filter
            if (selectedCity) {
              el.dataSettings.filters.push({
                id: "city-filter-dynamic",
                column: "Город",
                operator: "equals",
                value: selectedCity
              });
            }

            // Add Year Filter
            if (selectedYear) {
              el.dataSettings.filters.push({
                id: "year-filter-dynamic",
                column: "Год",
                operator: "equals",
                value: selectedYear
              });
            }
          }
        });
      }

      return newConfig;
    });
  }, [baseConfigs, selectedCity, selectedYear]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 min-[2000px]:grid-cols-4 gap-6">
      {effectiveConfigs.map((config, idx) => (
        <DynamicCard key={idx} config={config} />
      ))}
    </div>
  );
};

export default KPISection;