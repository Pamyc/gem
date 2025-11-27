
import React, { useMemo } from 'react';
import GeneralChartCard from './GeneralChartCard';
import PieDonutChart from './PieDonutChart';
import TreemapSunburstChart from './TreemapSunburstChart';
import HorizontalBarChart from './HorizontalBarChart';
import LineChart from './LineChart';
import { ChartConfig } from '../../../types/chart';

interface ChartsSectionProps {
  isDarkMode: boolean;
  selectedCity: string;
  selectedYear: string;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ isDarkMode, selectedCity, selectedYear }) => {

  // Helper to inject filters
  const withFilters = (config: Partial<ChartConfig>) => {
    const newFilters = [...(config.filters || [])];
    
    if (selectedCity) {
      newFilters.push({
        id: "city-filter-dynamic",
        column: "Город",
        operator: "equals" as const,
        value: selectedCity
      });
    }

    if (selectedYear) {
      newFilters.push({
        id: "year-filter-dynamic",
        column: "Год",
        operator: "equals" as const,
        value: selectedYear
      });
    }

    return {
      ...config,
      filters: newFilters
    };
  };

  // Конфигурация для PieDonutChart
  

  const TreemapDataConfig = useMemo(() => withFilters({
    title: 'Кол-во лифтов по ЖК',
    sheetKey: 'clientGrowth',
    xAxisColumn: 'ЖК',
    yAxisColumn: 'Кол-во лифтов',
    aggregation: 'sum',
    filters: [
      {
        id: "o09z9l2b4",
        column: "Итого (Да/Нет)",
        operator: "equals",
        value: "Нет"
      },
      {
        id: "aagerz8uy",
        column: "Без разбивки на литеры (Да/Нет)",
        operator: "equals",
        value: "Да"
      }
    ]
  }), [selectedCity, selectedYear]);

  const AverageProfitConfig = useMemo(() => withFilters({
    title: 'Средняя прибыль с 1 лифта по ЖК',
    sheetKey: 'clientGrowth',
    xAxisColumn: 'ЖК',
    yAxisColumn: 'Прибыль с 1 лифта',
    aggregation: 'average',
    filters: [
      {
        id: "l33xzfgdy",
        column: "Итого (Да/Нет)",
        operator: "equals",
        value: "Нет"
      },
      {
        id: "c5bslnolw",
        column: "Без разбивки на литеры (Да/Нет)",
        operator: "equals",
        value: "Да"
      },
      {
        id: "c4bslnolw",
        column: "Сдан да/нет",
        operator: "equals",
        value: "Да"
      }
    ]
  }), [selectedCity, selectedYear]);

  // Новая конфигурация: Валовая прибыль по ЖК (Line Chart)
  const GrossProfitByJKConfig = useMemo(() => withFilters({ 
    title: 'Валовая прибыль по ЖК',
    sheetKey: 'clientGrowth', 
    xAxisColumn: 'ЖК', 
    yAxisColumn: 'Валовая', 
    aggregation: 'sum',
    filters: [
      {
        id: "l33xzfgdy",
        column: "Итого (Да/Нет)",
        operator: "equals",
        value: "Нет"
      },
      {
        id: "c5bslnolw",
        column: "Без разбивки на литеры (Да/Нет)",
        operator: "equals",
        value: "Да"
      }
    ] 
  }), [selectedCity, selectedYear]);

  // Новая конфигурация: Средняя прибыль с 1 лифта по ЖК (Line Chart)
  const AvgProfitPerLiftByJKConfig = useMemo(() => withFilters({ 
    title: 'Средняя прибыль с 1 лифта по ЖК',
    sheetKey: 'clientGrowth', 
    xAxisColumn: 'ЖК', 
    yAxisColumn: 'Прибыль с 1 лифта', 
    aggregation: 'average',
    filters: [
      {
        id: "l33xzfgdy",
        column: "Итого (Да/Нет)",
        operator: "equals",
        value: "Нет"
      },
      {
        id: "c5bslnolw",
        column: "Без разбивки на литеры (Да/Нет)",
        operator: "equals",
        value: "Да"
      }
    ] 
  }), [selectedCity, selectedYear]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 min-[2000px]:grid-cols-3 gap-6">
      {/* Круговые диаграммы оставляем с лимитом по умолчанию (7), чтобы не было каши */}
      

      {/* Treemap можно показать чуть больше, например 10 */}
      <GeneralChartCard config={TreemapDataConfig} limit={7} showTotal valueSuffix=" шт.">
        {(data, isExpanded) => (
          <TreemapSunburstChart 
            isDarkMode={isDarkMode} 
            data={data}
            title=""
            valueSuffix=" шт."
            className={isExpanded ? "w-full h-full" : undefined}
          />
        )}
      </GeneralChartCard>

      {/* Для горизонтального бара увеличим до 15 */}
      <GeneralChartCard config={AverageProfitConfig} limit={7} showTotal valuePrefix="₽ ">
        {(data, isExpanded) => (
          <HorizontalBarChart 
            isDarkMode={isDarkMode} 
            data={data}
            title=""
            valuePrefix="₽ "
            className={isExpanded ? "w-full h-full" : undefined}
          />
        )}
      </GeneralChartCard>

      {/* Для линейных графиков ставим limit={0}, чтобы показать ВСЕ данные, так как там есть скролл/зум */}
      <GeneralChartCard config={GrossProfitByJKConfig} limit={7} showTotal valuePrefix="₽ ">
        {(data, isExpanded) => (
          <LineChart 
            isDarkMode={isDarkMode} 
            data={data}
            title=""
            valuePrefix="₽ "
            className={isExpanded ? "w-full h-full" : undefined}
          />
        )}
      </GeneralChartCard>

      <GeneralChartCard config={AvgProfitPerLiftByJKConfig} limit={7} showTotal valuePrefix="₽ ">
        {(data, isExpanded) => (
          <LineChart 
            isDarkMode={isDarkMode} 
            data={data}
            title=""
            valuePrefix="₽ "
            className={isExpanded ? "w-full h-full" : undefined}
          />
        )}
      </GeneralChartCard>
    </div>
  );
};

export default ChartsSection;