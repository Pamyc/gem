import React, { useState, useEffect } from 'react';
import EChartComponent from '../../components/charts/EChartComponent';
import { useComparisonData } from './helperComparisonChart/useComparisonData';
import { useComparisonChartOptions } from './helperComparisonChart/useComparisonChartOptions';
import HeaderControls from './helperComparisonChart/HeaderControls';
import ObjectSelectors from './helperComparisonChart/ObjectSelectors';
import { ComparisonCategory, ComparisonFilterState } from './helperComparisonChart/types';

interface ComparisonChartProps {
  isDarkMode: boolean;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ isDarkMode }) => {
  // --- STATE ---
  const [category, setCategory] = useState<ComparisonCategory>('city');
  const [itemA, setItemA] = useState<string>('');
  const [itemB, setItemB] = useState<string>('');
  
  const [filters, setFilters] = useState<ComparisonFilterState>({
    years: [],
    regions: [],
    cities: [],
    jks: [],
    clients: [],
    statuses: [],
    objectTypes: []
  });

  // --- DATA HOOK ---
  // treeOptions aliased to availableItems to match component usage
  const { treeOptions: availableItems, aggregatedData, filterOptions } = useComparisonData(category, filters);

  // --- CHART OPTIONS HOOK ---
  const chartOption = useComparisonChartOptions({
    aggregatedData,
    itemA,
    itemB,
    isDarkMode
  });

  // Reset selection when category changes or items become unavailable
  useEffect(() => {
    if (category === 'status') {
      setItemA('В работе');
      setItemB('Сданы');
    } else if (category === 'client') {
      setItemA('ЮСИ');
      setItemB('ССК');
    } else if (category === 'year') {
      setItemA('Весь период');
      setItemB('Весь период');
    } else if (['region', 'city', 'jk', 'liter'].includes(category)) {
      setItemA('Все объекты');
      setItemB('Все объекты');
    } else {
      setItemA('');
      setItemB('');
    }
  }, [category]);

  return (
    <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
       
       <HeaderControls 
          category={category}
          setCategory={setCategory}
          filters={filters}
          setFilters={setFilters}
          filterOptions={filterOptions}
       />

       <div className="p-6 min-h-[500px]">
          {/* Selectors overlay - Controls are separate from the chart positioning context */}
          <ObjectSelectors 
             mode="controls"
             itemA={itemA} setItemA={setItemA}
             itemB={itemB} setItemB={setItemB}
             availableItems={availableItems}
          />

          {/* Chart Area Wrapper: Relative context for aligning Chart + Central Labels */}
          <div className="h-[400px] mt-8 relative">
             {itemA && itemB ? (
                <>
                    <EChartComponent 
                        options={chartOption}
                        theme={isDarkMode ? 'dark' : 'light'}
                        height="100%"
                    />
                    
                    {/* Metric Labels Overlay (Center) - Now inside the relative chart container */}
                    <ObjectSelectors 
                        mode="labels"
                        itemA={itemA} setItemA={setItemA}
                        itemB={itemB} setItemB={setItemB}
                        availableItems={availableItems}
                    />
                </>
             ) : (
                <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl">
                    Выберите два объекта для сравнения
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default ComparisonChart;