import React, { useMemo } from 'react';
import GeneralChartCard from './helperGeneralTab/GeneralChartCard';
import PieDonutChart from './helperGeneralTab/PieDonutChart';
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 min-[2000px]:grid-cols-3 gap-6">
      <GeneralChartCard config={SumElevatorDataConfig}>
        {(data) => (
          <PieDonutChart 
            isDarkMode={isDarkMode} 
            data={data} 
            radius={['17%', '37%']}
            title={SumElevatorDataConfig.title}
          />
        )}
      </GeneralChartCard>

      <GeneralChartCard config={SumFloorDataConfig}>
        {(data) => (
          <PieDonutChart 
            isDarkMode={isDarkMode} 
            data={data} 
            radius={['0%', '37%']}
            title={SumFloorDataConfig.title}
          />
        )}
      </GeneralChartCard>
    </div>
    
  );
};

export default GeneralTab;