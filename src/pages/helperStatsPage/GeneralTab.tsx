import React, { useMemo } from 'react';
import GeneralChartCard from './helperGeneralTab/GeneralChartCard';
import PieDonutChart from './helperGeneralTab/PieDonutChart';
import TreemapSunburstChart from './helperGeneralTab/TreemapSunburstChart';
import HorizontalBarChart from './helperGeneralTab/HorizontalBarChart';
import LineChart from './helperGeneralTab/LineChart';
import { ChartConfig } from '../../types/chart';

interface GeneralTabProps {
  isDarkMode: boolean;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ isDarkMode }) => {

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
      <GeneralChartCard config={SumElevatorDataConfig}>
        {(data) => (
          <PieDonutChart 
            isDarkMode={isDarkMode} 
            data={data} 
            title={SumElevatorDataConfig.title}
            valueSuffix=" шт."
          />
        )}
      </GeneralChartCard>

      <GeneralChartCard config={SumFloorDataConfig}>
        {(data) => (
          <PieDonutChart 
            isDarkMode={isDarkMode} 
            data={data} 
            radius={['0%', '60%']}
            title={SumFloorDataConfig.title}
            valueSuffix=" шт."
          />
        )}
      </GeneralChartCard>

      <GeneralChartCard config={TreemapDataConfig}>
        {(data) => (
          <TreemapSunburstChart 
            isDarkMode={isDarkMode} 
            data={data}
            title={TreemapDataConfig.title}
            valuePrefix="₽ "
          />
        )}
      </GeneralChartCard>

      <GeneralChartCard config={AverageProfitConfig}>
        {(data) => (
          <HorizontalBarChart 
            isDarkMode={isDarkMode} 
            data={data}
            title={AverageProfitConfig.title}
            valuePrefix="₽ "
          />
        )}
      </GeneralChartCard>

      {/* Новые линейные графики */}
      <GeneralChartCard config={GrossProfitByJKConfig}>
        {(data) => (
          <LineChart 
            isDarkMode={isDarkMode} 
            data={data}
            title={GrossProfitByJKConfig.title}
            valuePrefix="₽ "
          />
        )}
      </GeneralChartCard>

      <GeneralChartCard config={AvgProfitPerLiftByJKConfig}>
        {(data) => (
          <LineChart 
            isDarkMode={isDarkMode} 
            data={data}
            title={AvgProfitPerLiftByJKConfig.title}
            valuePrefix="₽ "
          />
        )}
      </GeneralChartCard>
    </div>
    
  );
};

export default GeneralTab;