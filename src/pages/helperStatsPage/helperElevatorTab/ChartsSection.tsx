
import React, { useMemo } from 'react';
import GeneralChartCard from './GeneralChartCard';
import PieDonutChart from './PieDonutChart';
import TreemapSunburstChart from './TreemapSunburstChart';
import { ChartConfig } from '../../../types/chart';
import ElevatorsByCustomerChart from './ElevatorsByCustomerChart';

interface ChartsSectionProps {
  isDarkMode: boolean;
  selectedCity: string;
  selectedYear: string;
  selectedRegion?: string;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ isDarkMode, selectedCity, selectedYear, selectedRegion }) => {

  // Helper to inject filters
  const withFilters = (config: Partial<ChartConfig>) => {
    const newFilters = [...(config.filters || [])];

    if (selectedRegion) {
      newFilters.push({
        id: "region-filter-dynamic",
        column: "Регион",
        operator: "equals" as const,
        value: selectedRegion
      });
    }

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
  }), [selectedCity, selectedYear, selectedRegion]);

  const SumElevatorDataConfig = useMemo(() => withFilters({
    title: 'Кол-во сданных лифтов да/нет',
    sheetKey: 'clientGrowth',
    xAxisColumn: 'Сдан да/нет',
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
  }), [selectedCity, selectedYear, selectedRegion]);

  // Новая конфигурация: Кол-во ЖК по заказчикам
  const SumJkClientDataConfig = useMemo(() => withFilters({
    title: 'Кол-во ЖК по заказчикам',
    sheetKey: 'clientGrowth',
    xAxisColumn: 'Клиент',
    yAxisColumn: 'ЖК',
    aggregation: 'unique',
    uniqueTarget: 'yAxis', // ВАЖНО: Явно указываем считать уникальные значения из столбца Y (ЖК)
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
  }), [selectedCity, selectedYear, selectedRegion]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 min-[2000px]:grid-cols-2 gap-6">
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
      <GeneralChartCard config={SumElevatorDataConfig} limit={8} showTotal valueSuffix=" шт.">
        {(data, isExpanded) => (
          <PieDonutChart
            isDarkMode={isDarkMode}
            data={data}
            title=""
            valueSuffix=" шт."
            className={isExpanded ? "w-full h-full" : undefined}
          />
        )}
      </GeneralChartCard>

      {/* Для линейных графиков ставим limit={0}, чтобы показать ВСЕ данные, так как там есть скролл/зум */}
      <GeneralChartCard config={SumJkClientDataConfig} limit={7} showTotal valuePrefix="" valueSuffix="">
        {(data, isExpanded) => (
          <PieDonutChart
            isDarkMode={isDarkMode}
            data={data}
            title=""
            valueSuffix=""
            className={isExpanded ? "w-full h-full" : undefined}
          />
        )}
      </GeneralChartCard>

      {/* Custom Chart Card: Elevators By Customer */}
      <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden p-6 flex flex-col hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-colors">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Статус по заказчикам
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Сданы / В работе
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full min-h-[350px]">
          <ElevatorsByCustomerChart 
              isDarkMode={isDarkMode} 
              selectedCity={selectedCity}
              selectedRegion={selectedRegion}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
