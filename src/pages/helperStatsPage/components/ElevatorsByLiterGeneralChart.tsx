
import React, { useState, useRef, useEffect } from 'react';
import EChartComponent, { EChartInstance } from '../../../components/charts/EChartComponent';
import {
  COLORS,
  STATUS_COLORS,
  ROOT_ID,
  ChartType,
  ColorMode,
  MetricKey,
  FilterState,
  TooltipData,
  SEPARATOR
} from './helperElevatorsByLiterGeneralChart/types';
import { useChartData } from './helperElevatorsByLiterGeneralChart/useChartData';
import { useChartOptions, getTooltipHtml } from './helperElevatorsByLiterGeneralChart/useChartOptions';
import HeaderControls from './helperElevatorsByLiterGeneralChart/HeaderControls';
import SideList from './helperElevatorsByLiterGeneralChart/SideList';

interface ElevatorsByLiterGeneralChartProps {
  isDarkMode: boolean;
  selectedCity?: string;
  selectedYear?: string;
  selectedRegion?: string;
}

// Helper to parse ID to Breadcrumbs
const getBreadcrumbs = (id: string | null) => {
  if (!id || id === ROOT_ID) return [];
  const parts = id.split('|');
  const path: string[] = [];

  parts.forEach(part => {
    const [type, name] = part.split(':');
    if (name) path.push(name);
  });

  return path;
};

// Helper to get parent ID
const getParentId = (id: string | null) => {
  if (!id || id === ROOT_ID) return null; // No parent for root
  const parts = id.split('|');
  if (parts.length === 1) return ROOT_ID; // Parent of City is Root
  parts.pop();
  return parts.join('|');
};

const ElevatorsByLiterGeneralChart: React.FC<ElevatorsByLiterGeneralChartProps> = ({
  isDarkMode,
  selectedCity,
  selectedYear: externalSelectedYear,
  selectedRegion
}) => {
  // State
  const [chartType, setChartType] = useState<ChartType>('sunburst');
  const [colorMode, setColorMode] = useState<ColorMode>('jk');
  const [activeMetric, setActiveMetric] = useState<MetricKey>('value'); 

  // Side List Expansion States
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [expandedJK, setExpandedJK] = useState<string | null>(null);

  // Tooltip Panel State
  const [activeTooltip, setActiveTooltip] = useState<{ title: string; data: TooltipData } | null>(null);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    years: [],
    regions: [],
    cities: [],
    jks: [],
    clients: [],
    statuses: [],
    objectTypes: []
  });

  // Drill-down State
  const [sunburstRootId, setSunburstRootId] = useState<string>(ROOT_ID);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);

  const chartRef = useRef<EChartInstance>(null);

  // Sync external year prop with internal state if provided
  useEffect(() => {
    if (externalSelectedYear && externalSelectedYear !== 'Весь период') {
      setFilters(prev => ({ ...prev, years: [externalSelectedYear] }));
    } else {
      setFilters(prev => ({ ...prev, years: [] }));
    }
  }, [externalSelectedYear]);

  // Sync external city prop
  useEffect(() => {
    if (selectedCity) {
      setFilters(prev => ({ ...prev, cities: [selectedCity] }));
      handleResetZoom();
    } else {
      setFilters(prev => ({ ...prev, cities: [] }));
    }
  }, [selectedCity]);

  // Sync external region prop
  useEffect(() => {
    if (selectedRegion) {
      setFilters(prev => ({ ...prev, regions: [selectedRegion] }));
      handleResetZoom();
    } else {
      setFilters(prev => ({ ...prev, regions: [] }));
    }
  }, [selectedRegion]);

  const handleResetZoom = () => {
    setSunburstRootId(ROOT_ID);
    setBreadcrumbs([]);
    setExpandedCity(null);
    setExpandedJK(null);
    // Reset tooltip to default
    setActiveTooltip(null);
  };

  // --- 1. Get Data via Custom Hook ---
  const {
    chartData,
    sunburstData,
    uniqueJKs,
    citySummary,
    totalValue,
    globalStats, // New default stats
    filterOptions
  } = useChartData({
    filters,
    colorMode,
    activeMetric
  });

  // --- 2. Get Chart Options via Custom Hook ---
  const option = useChartOptions({
    isDarkMode,
    chartType,
    sunburstRootId,
    chartData,
    fullSunburstData: sunburstData,
    activeMetric
  });

  // --- 3. Handlers ---

  const handleItemHover = (name: string) => {
    const instance = chartRef.current?.getInstance();
    if (instance) {
      instance.dispatchAction({ type: 'highlight', name });
    }
  };

  const handleItemLeave = (name: string) => {
    const instance = chartRef.current?.getInstance();
    if (instance) {
      instance.dispatchAction({ type: 'downplay', name });
    }
  };

  const handleTooltipUpdate = (title: string, data: TooltipData | null) => {
      if (data) {
          setActiveTooltip({ title, data });
      } else {
          setActiveTooltip(null);
      }
  };

  // Sync side list selection with Chart Drill-down
  const toggleCity = (cityName: string) => {
    if (expandedCity === cityName) {
      setExpandedCity(null);
      setExpandedJK(null);
      setSunburstRootId(ROOT_ID);
      setBreadcrumbs([]);
    } else {
      setExpandedCity(cityName);
      setExpandedJK(null);
      const nextId = `city:${cityName}`;
      setSunburstRootId(nextId);
      setBreadcrumbs(getBreadcrumbs(nextId));
    }
  };

  const toggleJK = (jkName: string) => {
    if (expandedJK === jkName) {
      setExpandedJK(null);
      if (expandedCity) {
        const parentId = `city:${expandedCity}`;
        setSunburstRootId(parentId);
        setBreadcrumbs(getBreadcrumbs(parentId));
      } else {
        setSunburstRootId(ROOT_ID);
        setBreadcrumbs([]);
      }
    } else {
      setExpandedJK(jkName);
      if (expandedCity) {
        const nextId = `city:${expandedCity}|jk:${jkName}`;
        setSunburstRootId(nextId);
        setBreadcrumbs(getBreadcrumbs(nextId));
      }
    }
  };

  // Setup Chart Interaction for Central Panel Update
  useEffect(() => {
    const instance = chartRef.current?.getInstance();
    if (!instance) return;

    // Remove existing listeners to avoid duplicates
    instance.off('click');
    instance.off('contextmenu');

    const handleClick = (params: any) => {
      const clickedId = params.data?.id;
      if (!clickedId) return;

      let nextRootId = clickedId;
      if (clickedId === sunburstRootId) {
        const parent = getParentId(clickedId);
        if (parent) nextRootId = parent;
      } else {
        nextRootId = clickedId;
      }

      setSunburstRootId(nextRootId);
      setBreadcrumbs(getBreadcrumbs(nextRootId));

      if (nextRootId && nextRootId !== ROOT_ID) {
        const parts = nextRootId.split('|');
        const cityPart = parts.find(p => p.startsWith('city:'));

        if (cityPart) {
          const cityName = cityPart.split(':')[1];
          setExpandedCity(cityName);
          const jkPart = parts.find(p => p.startsWith('jk:'));
          if (jkPart) {
            setExpandedJK(jkPart.split(':')[1]);
          } else {
            setExpandedJK(null);
          }
        } else {
          setExpandedCity(null);
          setExpandedJK(null);
        }
      } else {
        setExpandedCity(null);
        setExpandedJK(null);
      }
    };

    // Right Click handler for Tooltip update
    const handleRightClick = (params: any) => {
        // Prevent default browser menu logic is handled on container div usually, 
        // but ECharts event happens before bubbling sometimes.
        // ECharts event doesn't pass the original DOM event directly in a way to preventDefault easily here,
        // but we handle the state update.
        
        const p = params;
        if (!p || !p.data) return;
        
        let label = '';
        let extra: any = {};

        if (p.seriesType === 'sunburst') {
            const parts = p.name.split(SEPARATOR);
            label = parts[parts.length - 1];
            extra = p.data.data || {};
        } else {
            const data = p.data;
            label = `${data.cityName} / ${data.jkName}`;
            extra = data;
        }

        const tooltipData: TooltipData = {
            value: extra.value || extra.elevators || 0,
            floors: extra.floors || 0,
            profit: extra.profit || 0,
            percent: extra.percent,
            incomeFact: extra.incomeFact,
            expenseFact: extra.expenseFact,
            incomeLO: extra.incomeLO,
            expenseLO: extra.expenseLO,
            incomeObr: extra.incomeObr,
            expenseObr: extra.expenseObr,
            incomeMont: extra.incomeMont,
            expenseMont: extra.expenseMont,
            profitPerLift: extra.profitPerLift,
            clients: extra.clients || [],
            cities: extra.cities || [],
            jks: extra.jks || [],
            statuses: extra.statuses || [],
            objectTypes: extra.objectTypes || [],
            years: extra.years || []
        };

        setActiveTooltip({ title: label, data: tooltipData });
    };

    instance.on('click', handleClick);
    instance.on('contextmenu', handleRightClick);

    return () => {
      instance.off('click', handleClick);
      instance.off('contextmenu', handleRightClick);
    };
  }, [sunburstRootId, chartType]);

  // Determine content for the middle panel
  const panelContentHtml = React.useMemo(() => {
      if (activeTooltip) {
          return getTooltipHtml(activeTooltip.title, activeTooltip.data, isDarkMode, activeMetric);
      }
      
      if (globalStats) {
          return getTooltipHtml("Общая статистика", globalStats, isDarkMode, activeMetric);
      }

      return `<div style="padding: 20px; text-align: center; color: #888;">Нет данных</div>`;
  }, [activeTooltip, globalStats, isDarkMode, activeMetric]);

  return (
    <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden p-5 flex flex-col gap-2 w-full relative group">

      <HeaderControls
        colorMode={colorMode}
        setColorMode={setColorMode}
        chartType={chartType}
        setChartType={setChartType}
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
        breadcrumbs={breadcrumbs}
        onResetZoom={handleResetZoom}
        activeMetric={activeMetric}
        setActiveMetric={setActiveMetric}
      />

      {/* Main Content Area */}
      <div className="flex h-[550px] relative">
        
        {/* Left Side List */}
        <SideList
          citySummary={citySummary}
          totalValue={totalValue}
          expandedCity={expandedCity}
          toggleCity={toggleCity}
          expandedJK={expandedJK}
          toggleJK={toggleJK}
          onHoverItem={handleItemHover}
          onLeaveItem={handleItemLeave}
          onHoverData={handleTooltipUpdate}
          colorMode={colorMode}
          activeMetric={activeMetric}
        />

        {/* Central Info Panel (Fixed) */}
        <div className="w-[300px] border-r border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0b0f19]/30 flex flex-col relative shrink-0">
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-3">
               <div 
                  className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-gray-200 dark:border-white/5 p-3 min-h-[200px]"
                  dangerouslySetInnerHTML={{ __html: panelContentHtml }}
               />
            </div>
        </div>

        {/* Right Chart Area */}
        <div 
            className="flex-1 min-w-0 relative"
            onContextMenu={(e) => e.preventDefault()} // Prevent browser menu on container
        >
          <EChartComponent
            ref={chartRef}
            options={option}
            theme={isDarkMode ? 'dark' : 'light'}
            height="100%"
          />
          
          {/* Overlay Hint if needed */}
          {chartData.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                Нет данных для отображения
             </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ElevatorsByLiterGeneralChart;
