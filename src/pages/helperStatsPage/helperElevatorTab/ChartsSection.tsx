
import React, { useMemo } from 'react';
import GeneralChartCard from './GeneralChartCard';
import PieDonutChart from './PieDonutChart';
import TreemapSunburstChart from './TreemapSunburstChart';
import NestedDonutChart from '../helperGeneralTab/NestedDonutChart'; // Import new component
import { ChartConfig } from '../../../types/chart';
import ElevatorsByCustomerChart from './ElevatorsByCustomerChart';
import FloorsByCustomerChart from './FloorsByCustomerChart';
import { useProcessedChartData } from '../../../hooks/useProcessedChartData'; // Import hook
import { Loader2 } from 'lucide-react';

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

  // Конфигурация 1: Кол-во ЖК по заказчикам
  const SumJkClientDataConfig = useMemo(() => withFilters({
    title: 'Кол-во ЖК',
    sheetKey: 'clientGrowth',
    xAxisColumn: 'Клиент',
    yAxisColumn: 'ЖК',
    aggregation: 'unique',
    uniqueTarget: 'yAxis',
    filters: [
      { id: "o09z9l2b4", column: "Итого (Да/Нет)", operator: "equals", value: "Нет" },
      { id: "aagerz8uy", column: "Без разбивки на литеры (Да/Нет)", operator: "equals", value: "Да" }
    ]
  }), [selectedCity, selectedYear, selectedRegion]);

  // Конфигурация 2: Кол-во Литеров по заказчикам
  const SumLiterClientDataConfig = useMemo(() => withFilters({
    title: 'Кол-во литеров',
    sheetKey: 'clientGrowth',
    xAxisColumn: 'Клиент',
    yAxisColumn: 'Литер',
    aggregation: 'count',
    filters: [
      { id: "o09z9l2b4_liter", column: "Итого (Да/Нет)", operator: "equals", value: "Нет" },
      { id: "separate_liter_filter", column: "Отдельный литер (Да/Нет)", operator: "equals", value: "Да" }
    ]
  }), [selectedCity, selectedYear, selectedRegion]);

  // Загружаем данные для двойного графика напрямую через хуки
  const { data: jkData, isLoading: jkLoading } = useProcessedChartData(SumJkClientDataConfig);
  const { data: literData, isLoading: literLoading } = useProcessedChartData(SumLiterClientDataConfig);

  const isLoadingNested = jkLoading || literLoading;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 2xl:grid-cols-1 min-[2000px]:grid-cols-1 gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 min-[2000px]:grid-cols-2 gap-6">

        {/* Treemap */}
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

        {/* Pie Chart (Status) */}
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

      </div>
      <div className="grid grid-cols-3 lg:grid-cols-3 2xl:grid-cols-3 min-[2000px]:grid-cols-3 gap-6">
        {/* Double Nested Donut Chart Card (JKs & Liters by Client) */}
        <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden p-6 flex flex-col hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-colors">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Объекты по заказчикам
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Внутренний: <b>Кол-во ЖК</b> / Внешний: <b>Кол-во Литеров</b>
              </p>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[350px] relative">
            {isLoadingNested ? (
              <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <NestedDonutChart
                isDarkMode={isDarkMode}
                innerData={jkData}
                outerData={literData}
                innerTitle="ЖК"
                outerTitle="Литеры"
              />
            )}
          </div>
        </div>

        {/* Custom Chart Card: Elevators By Customer */}
        <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden p-6 flex flex-col hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-colors">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Количество/Статус лифтов по заказчикам
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Сданы / В работе
              </p>
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
        {/* Custom Chart Card: Elevators By Customer */}
        <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden p-6 flex flex-col hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-colors">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Количество/Статус этажей по заказчикам
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Сданы / В работе
              </p>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[350px]">
            <FloorsByCustomerChart
              isDarkMode={isDarkMode}
              selectedCity={selectedCity}
              selectedRegion={selectedRegion}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
