import React, { useMemo } from 'react';
import GeneralChartCard from './GeneralChartCard';
import PieDonutChart from './PieDonutChart';
import TreemapSunburstChart from './TreemapSunburstChart';
import HorizontalBarChart from './HorizontalBarChart';
import LineChart from './LineChart';
import { ChartConfig } from '../../../types/chart';

interface ChartsSectionProps {
  isDarkMode: boolean;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ isDarkMode }) => {

  // Конфигурация для PieDonutChart
  const SumElevatorDataConfig = useMemo<Partial<ChartConfig>>(() => ({
    title: 'Кол-во лифтов',
    sheetKey: 'clientGrowth',
    xAxisColumn: 'Город',
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
  }), []);

  const SumFloorDataConfig = useMemo<Partial<ChartConfig>>(() => ({
    title: 'Кол-во этажей',
    sheetKey: 'clientGrowth',
    xAxisColumn: 'Город',
    yAxisColumn: 'Кол-во этажей',
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
  }), []);

  const TreemapDataConfig = useMemo<Partial<ChartConfig>>(() => ({
    title: 'Валовая прибыль по городам',
    sheetKey: 'clientGrowth',
    xAxisColumn: 'Город',
    yAxisColumn: 'Валовая',
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
  }), []);

  const AverageProfitConfig = useMemo<Partial<ChartConfig>>(() => ({
    title: 'Средняя прибыль с 1 лифта',
    sheetKey: 'clientGrowth',
    xAxisColumn: 'Город',
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
  }), []);

  // Новая конфигурация: Валовая прибыль по ЖК (Line Chart)
  const GrossProfitByJKConfig = useMemo<Partial<ChartConfig>>(() => ({ 
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
  }), []);

  // Новая конфигурация: Средняя прибыль с 1 лифта по ЖК (Line Chart)
  const AvgProfitPerLiftByJKConfig = useMemo<Partial<ChartConfig>>(() => ({ 
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
  }), []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 min-[2000px]:grid-cols-3 gap-6">
      {/* Круговые диаграммы оставляем с лимитом по умолчанию (7), чтобы не было каши */}
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

      <GeneralChartCard config={SumFloorDataConfig} limit={8} showTotal valueSuffix=" шт.">
        {(data, isExpanded) => (
          <PieDonutChart 
            isDarkMode={isDarkMode} 
            data={data} 
            radius={['0%', '60%']}
            title=""
            valueSuffix=" шт."
            className={isExpanded ? "w-full h-full" : undefined}
          />
        )}
      </GeneralChartCard>

      {/* Treemap можно показать чуть больше, например 10 */}
      <GeneralChartCard config={TreemapDataConfig} limit={7} showTotal valuePrefix="₽ ">
        {(data, isExpanded) => (
          <TreemapSunburstChart 
            isDarkMode={isDarkMode} 
            data={data}
            title=""
            valuePrefix="₽ "
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