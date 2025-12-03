
import React, { useMemo } from 'react';
import DynamicCard from '../../../components/cards/DynamicCard';
import { CardConfig } from '../../../types/card';

interface KPISectionProps {
  selectedCity: string;
  selectedYear: string;
}

const KPISection: React.FC<KPISectionProps> = ({ selectedCity, selectedYear }) => {
  const baseConfigs = useMemo<CardConfig[]>(() => [
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
              { id: "uaxlml8uu", column: "Итого (Да/Нет)", operator: "equals", value: "Нет" },
              { id: "684qb4n5p", column: "Без разбивки на литеры (Да/Нет)", operator: "equals", value: "Да" }
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
      title: "Доходы плановые",
      sheetKey: "",
      dataColumn: "",
      aggregation: "count",
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
            dataColumn: "Доходы + Итого + План",
            aggregation: "sum",
            filters: [
              {
                id: "uaxlml8uu",
                column: "Итого (Да/Нет)",
                operator: "equals",
                value: "Нет"
              },
              {
                id: "284qb4n5p",
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
      title: "Доходы фактические",
      sheetKey: "",
      dataColumn: "",
      aggregation: "count",
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
            dataColumn: "Доходы + Итого + Факт",
            aggregation: "sum",
            filters: [
              {
                id: "uaxlml8uu",
                column: "Итого (Да/Нет)",
                operator: "equals",
                value: "Нет"
              },
              {
                id: "284qb4n5p",
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
      title: "Расходы фактические",
      sheetKey: "",
      dataColumn: "",
      aggregation: "count",
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
            dataColumn: "Расходы + Итого + Факт",
            aggregation: "sum",
            filters: [
              {
                id: "uaxlml8uu",
                column: "Итого (Да/Нет)",
                operator: "equals",
                value: "Нет"
              },
              {
                id: "284qb4n5p",
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

  const effectiveConfigs = useMemo(() => {
    if (!selectedCity && !selectedYear) return baseConfigs;

    return baseConfigs.map(config => {
      const newConfig = JSON.parse(JSON.stringify(config));
      if (newConfig.elements) {
        newConfig.elements.forEach((el: any) => {
          if (el.dataSettings) {
            if (!el.dataSettings.filters) el.dataSettings.filters = [];
            if (selectedCity) {
              el.dataSettings.filters.push({
                id: "city-filter-dynamic",
                column: "Город",
                operator: "equals",
                value: selectedCity
              });
            }
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
