
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
    years: [], cities: [], jks: [], clients: [], statuses: [], objectTypes: []
  });

  // --- DATA ---
  const { availableItems, aggregatedData, filterOptions } = useComparisonData(category, filters);

  // --- AUTO SELECT DEFAULTS ---
  useEffect(() => {
      if (availableItems.length >= 2) {
          if (!itemA || !availableItems.includes(itemA)) setItemA(availableItems[0]);
          if (!itemB || !availableItems.includes(itemB)) setItemB(availableItems[1]);
      } else if (availableItems.length === 1) {
          if (!itemA) setItemA(availableItems[0]);
      }
  }, [availableItems, category]);

  // --- CHART OPTIONS ---
  const option = useComparisonChartOptions({
      aggregatedData,
      itemA,
      itemB,
      isDarkMode
  });

  return (
    <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col w-full">
        
        {/* Header Controls */}
        <HeaderControls 
            category={category}
            setCategory={setCategory}
            filters={filters}
            setFilters={setFilters}
            filterOptions={filterOptions}
        />

        {/* Content Area */}
        <div className="p-6">
            
            {/* Selectors (Outside Relative Container to prevent shifting chart) */}
            <ObjectSelectors 
                mode="controls"
                itemA={itemA}
                setItemA={setItemA}
                itemB={itemB}
                setItemB={setItemB}
                availableItems={availableItems}
            />

            <div className="relative w-full h-[400px]">
                {/* Overlay Labels (Absolute) */}
                <ObjectSelectors 
                    mode="labels"
                    itemA={itemA}
                    setItemA={setItemA}
                    itemB={itemB}
                    setItemB={setItemB}
                    availableItems={availableItems}
                />

                {/* EChart */}
                <EChartComponent 
                    options={option} 
                    theme={isDarkMode ? 'dark' : 'light'}
                    height="100%"
                />
            </div>
        </div>
    </div>
  );
};

export default ComparisonChart;
