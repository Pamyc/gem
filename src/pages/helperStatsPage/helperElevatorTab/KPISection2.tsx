
import React, { useMemo } from 'react';
import DynamicCard from '../../../components/cards/DynamicCard';
import { CardConfig } from '../../../types/card';

interface KPISection2Props {
  selectedCity: string;
  selectedYear: string;
  selectedRegion?: string;
}

const KPISection2: React.FC<KPISection2Props> = ({ selectedCity, selectedYear, selectedRegion }) => {
  // --- KPI CONFIGURATIONS ---
  const baseConfigs = useMemo<CardConfig[]>(() => [
    // Row 1

    {
      template: "custom",
      title: "Лифтов на 1 дом",
      sheetKey: "",
      dataColumn: "",
      aggregation: "average",
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
      colorTheme: "violet",
      gradientFrom: "violet",
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
            dataColumn: "Кол-во лифтов",
            aggregation: "average",
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
      title: "Этажей на 1 дом",
      sheetKey: "",
      dataColumn: "",
      aggregation: "average",
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
      colorTheme: "violet",
      gradientFrom: "violet",
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
            aggregation: "average",
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
    

  ], []);

  // Apply dynamic filtering based on selectedCity and selectedYear
  const effectiveConfigs = useMemo(() => {
    if (!selectedCity && !selectedYear && !selectedRegion) return baseConfigs;

    return baseConfigs.map(config => {
      // Clone to avoid mutation
      const newConfig = JSON.parse(JSON.stringify(config));

      // Filter injection for elements
      if (newConfig.elements) {
        newConfig.elements.forEach((el: any) => {
          if (el.dataSettings) {
            if (!el.dataSettings.filters) el.dataSettings.filters = [];

            // Add Region Filter
            if (selectedRegion) {
              el.dataSettings.filters.push({
                id: "region-filter-dynamic",
                column: "Регион",
                operator: "equals",
                value: selectedRegion
              });
            }

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
  }, [baseConfigs, selectedCity, selectedYear, selectedRegion]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 min-[2000px]:grid-cols-2 gap-6">
      {effectiveConfigs.map((config, idx) => (
        <DynamicCard key={idx} config={config} />
      ))}
    </div>
  );
};

export default KPISection2;
