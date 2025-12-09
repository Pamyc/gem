
import React, { useMemo } from 'react';
import DynamicCard from '../../../components/cards/DynamicCard';
import { CardConfig } from '../../../types/card';

interface KPISection2Props {
  selectedCity: string;
  selectedYear: string;
  selectedRegion?: string;
}

const KPISection2: React.FC<KPISection2Props> = ({ selectedCity, selectedYear, selectedRegion }) => {
  const baseConfigs = useMemo<CardConfig[]>(() => [
    {
      template: "custom",
      title: "Плановые доходы на 1 жк",
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
      height: "50px",
      colorTheme: "blue",
      gradientFrom: "emerald",
      gradientTo: "violet",
      elements: [
        {
          id: "value-q6cne",
          type: "value",
          style: {
            top: 10,
            left: 300,
            fontSize: 20,
            color: "#ffffff",
            fontWeight: "bold"
          },
          dataSettings: {
            
            variables: [
              {
                id: "g7yijd2y9",
                name: "a",
                sheetKey: "clientGrowth",
                dataColumn: "ЖК",
                aggregation: "unique",
                filters: [
                  {
                    id: "j2ygwux7n",
                    column: "Итого (Да/Нет)",
                    operator: "equals",
                    value: "Нет"
                  },
                  {
                    id: "eqdsc2n6x",
                    column: "Без разбивки на литеры (Да/Нет)",
                    operator: "equals",
                    value: "Да"
                  }
                ]
              },
              {
                id: "ruy3ou2ln",
                name: "b",
                sheetKey: "clientGrowth",
                dataColumn: "Доходы + Итого + План",
                aggregation: "sum",
                filters: [
                  {
                    id: "j2ygwux7n",
                    column: "Итого (Да/Нет)",
                    operator: "equals",
                    value: "Нет"
                  },
                  {
                    id: "eqdsc2n6x",
                    column: "Без разбивки на литеры (Да/Нет)",
                    operator: "equals",
                    value: "Да"
                  }
                ]
              }
            ],
            formula: "{b} / {a}"
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
      title: "Фактические доходы на 1 жк",
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
      height: "50px",
      colorTheme: "blue",
      gradientFrom: "violet",
      gradientTo: "red",
      elements: [
        {
          id: "value-q6cne",
          type: "value",
          style: {
            top: 10,
            left: 300,
            fontSize: 20,
            color: "#ffffff",
            fontWeight: "bold"
          },
          dataSettings: {
            
            variables: [
              {
                id: "g7yijd2y9",
                name: "a",
                sheetKey: "clientGrowth",
                dataColumn: "ЖК",
                aggregation: "unique",
                filters: [
                  {
                    id: "j2ygwux7n",
                    column: "Итого (Да/Нет)",
                    operator: "equals",
                    value: "Нет"
                  },
                  {
                    id: "eqdsc2n6x",
                    column: "Без разбивки на литеры (Да/Нет)",
                    operator: "equals",
                    value: "Да"
                  }
                ]
              },
              {
                id: "ruy3ou2ln",
                name: "b",
                sheetKey: "clientGrowth",
                dataColumn: "Доходы + Итого + Факт",
                aggregation: "sum",
                filters: [
                  {
                    id: "j2ygwux7n",
                    column: "Итого (Да/Нет)",
                    operator: "equals",
                    value: "Нет"
                  },
                  {
                    id: "eqdsc2n6x",
                    column: "Без разбивки на литеры (Да/Нет)",
                    operator: "equals",
                    value: "Да"
                  }
                ]
              }
            ],
            formula: "{b} / {a}"
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
    if (!selectedCity && !selectedYear && !selectedRegion) return baseConfigs;

    return baseConfigs.map(config => {
      const newConfig = JSON.parse(JSON.stringify(config));

      if (newConfig.elements) {
        newConfig.elements.forEach((el: any) => {
          if (el.dataSettings) {
            
            // Функция для добавления фильтров в любой массив фильтров
            const injectFilters = (targetFilters: any[]) => {
              if (selectedRegion) {
                targetFilters.push({
                  id: "region-filter-dynamic",
                  column: "Регион",
                  operator: "equals",
                  value: selectedRegion
                });
              }
              if (selectedCity) {
                targetFilters.push({
                  id: "city-filter-dynamic",
                  column: "Город",
                  operator: "equals",
                  value: selectedCity
                });
              }
              if (selectedYear) {
                targetFilters.push({
                  id: "year-filter-dynamic",
                  column: "Год",
                  operator: "equals",
                  value: selectedYear
                });
              }
            };

            // 1. Внедряем в основные фильтры элемента
            if (!el.dataSettings.filters) el.dataSettings.filters = [];
            injectFilters(el.dataSettings.filters);

            // 2. Внедряем в переменные, если они есть (для формул)
            if (el.dataSettings.variables && Array.isArray(el.dataSettings.variables)) {
              el.dataSettings.variables.forEach((variable: any) => {
                if (!variable.filters) variable.filters = [];
                injectFilters(variable.filters);
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
