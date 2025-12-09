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
  const { availableItems, aggregatedData, filterOptions } = useComparisonData(category, filters);

  // --- CHART OPTIONS HOOK ---
  const chartOption = useComparisonChartOptions({
    aggregatedData,
    itemA,
    itemB,
    isDarkMode
  });

  // Reset selection when category changes or items become unavailable
  useEffect(() => {
    setItemA('');
    setItemB('');
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

       <div className="p-6 relative min-h-[500px]">
          {/* Selectors overlay */}
          <ObjectSelectors 
             mode="controls"
             itemA={itemA} setItemA={setItemA}
             itemB={itemB} setItemB={setItemB}
             availableItems={availableItems}
          />

          {/* Chart Area */}
          <div className="h-[400px] mt-8">
             {itemA && itemB ? (
                <EChartComponent 
                    options={chartOption}
                    theme={isDarkMode ? 'dark' : 'light'}
                    height="100%"
                />
             ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                    Выберите два объекта для сравнения
                </div>
             )}
          </div>

          {/* Metric Labels Overlay (Center) */}
          {itemA && itemB && (
             <ObjectSelectors 
                mode="labels"
                itemA={itemA} setItemA={setItemA}
                itemB={itemB} setItemB={setItemB}
                availableItems={availableItems}
             />
          )}
       </div>
    </div>
  );
};

export default ComparisonChart;