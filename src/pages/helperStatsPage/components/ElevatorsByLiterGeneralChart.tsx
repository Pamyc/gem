import React, { useState, useRef, useEffect } from 'react';
import EChartComponent, { EChartInstance } from '../../../components/charts/EChartComponent';
import {
  COLORS,
  STATUS_COLORS,
  ROOT_ID,
  ChartType,
  ColorMode,
  MetricKey,
  FilterState
} from './helperElevatorsByLiterGeneralChart/types';
import { useChartData } from './helperElevatorsByLiterGeneralChart/useChartData';
import { useChartOptions } from './helperElevatorsByLiterGeneralChart/useChartOptions';
import HeaderControls from './helperElevatorsByLiterGeneralChart/HeaderControls';
import SideList from './helperElevatorsByLiterGeneralChart/SideList';

interface ElevatorsByLiterGeneralChartProps {
  isDarkMode: boolean;
  selectedCity?: string;
  selectedYear?: string;
  selectedRegion?: string;
}

const SHOW_DELAY = 1300;

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
  const [activeMetric, setActiveMetric] = useState<MetricKey>('value'); // Default to Elevators

  // Side List Expansion States
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [expandedJK, setExpandedJK] = useState<string | null>(null);

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
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);

  // Sync external year prop with internal state if provided
  useEffect(() => {
    if (externalSelectedYear && externalSelectedYear !== 'Весь период') {
      setFilters(prev => ({ ...prev, years: [externalSelectedYear] }));
    } else {
      // If "All years" or empty, clear the year filter, but keep others
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

  // Handler needed for useEffect below
  const handleResetZoom = () => {
    setSunburstRootId(ROOT_ID);
    setBreadcrumbs([]);
    setExpandedCity(null);
    setExpandedJK(null);
  };

  // --- 1. Get Data via Custom Hook ---
  const {
    chartData,
    sunburstData,
    uniqueJKs,
    citySummary,
    totalValue,
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

  // Sync side list selection with Chart Drill-down
  const toggleCity = (cityName: string) => {
    if (expandedCity === cityName) {
      // Collapse City -> Go to Root
      setExpandedCity(null);
      setExpandedJK(null);

      setSunburstRootId(ROOT_ID);
      setBreadcrumbs([]);
    } else {
      // Expand City -> Drill into City
      setExpandedCity(cityName);
      setExpandedJK(null);

      const nextId = `city:${cityName}`;
      setSunburstRootId(nextId);
      setBreadcrumbs(getBreadcrumbs(nextId));
    }
  };

  const toggleJK = (jkName: string) => {
    if (expandedJK === jkName) {
      // Collapse JK -> Go back to City level
      setExpandedJK(null);
      if (expandedCity) {
        const parentId = `city:${expandedCity}`;
        setSunburstRootId(parentId);
        setBreadcrumbs(getBreadcrumbs(parentId));
      } else {
        // Fallback if state drifted
        setSunburstRootId(ROOT_ID);
        setBreadcrumbs([]);
      }
    } else {
      // Expand JK -> Drill into JK
      setExpandedJK(jkName);
      if (expandedCity) {
        const nextId = `city:${expandedCity}|jk:${jkName}`;
        setSunburstRootId(nextId);
        setBreadcrumbs(getBreadcrumbs(nextId));
      }
    }
  };

  // Click Handler for manual drill-down/up in Sunburst via Chart Click 
  // AND Tooltip manual management (reset on move)
  useEffect(() => {
    const instance = chartRef.current?.getInstance();
    if (!instance) return;

    const handleClick = (params: any) => {
      const clickedId = params.data?.id;
      if (!clickedId) return;

      let nextRootId = clickedId;

      // If we clicked the node that is currently the root (the center), go UP
      if (clickedId === sunburstRootId) {
        const parent = getParentId(clickedId);
        if (parent) nextRootId = parent;
      }
      // Otherwise, we clicked a child, so go DOWN (set it as root)
      else {
        nextRootId = clickedId;
      }

      setSunburstRootId(nextRootId);
      setBreadcrumbs(getBreadcrumbs(nextRootId));

      // Sync side panel expansion based on chart click
      if (nextRootId && nextRootId !== ROOT_ID) {
        const parts = nextRootId.split('|');
        const cityPart = parts.find(p => p.startsWith('city:'));

        if (cityPart) {
          const cityName = cityPart.split(':')[1];
          setExpandedCity(cityName);

          // If drill down goes to JK level, expand that too
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

    // MANUAL TOOLTIP DEBOUNCE LOGIC
    const handleMouseMove = (params: any) => {
      // 1. Clear any pending timeout immediately
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
        tooltipTimeoutRef.current = null;
      }

      // 2. Hide current tooltip while moving
      instance.dispatchAction({ type: 'hideTip' });

      // 3. If we are over a data element, start a new timer
      if (params.data && params.data.id !== sunburstRootId) {
        // --- NEW: remember mouse position (so tooltip appears under cursor) ---
        const e = params?.event;
        const x =
          e?.offsetX ??
          e?.zrX ??
          e?.event?.offsetX ??
          0;
        const y =
          e?.offsetY ??
          e?.zrY ??
          e?.event?.offsetY ??
          0;

        lastMousePosRef.current = { x, y };

        tooltipTimeoutRef.current = setTimeout(() => {
          const pos = lastMousePosRef.current;

          instance.dispatchAction({
            type: 'showTip',
            seriesIndex: params.seriesIndex,
            dataIndex: params.dataIndex,

            // --- NEW: pin tooltip to cursor ---
            x: pos?.x,
            y: pos?.y + 3 // чуть ниже курсора
          });

          tooltipTimeoutRef.current = null;
        }, SHOW_DELAY);
      }

    };

    const handleMouseOut = () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
        tooltipTimeoutRef.current = null;
      }
      instance.dispatchAction({ type: 'hideTip' });
    };

    instance.on('click', handleClick);
    instance.on('mousemove', handleMouseMove);
    instance.on('globalout', handleMouseOut); // Fires when leaving chart canvas

    return () => {
      instance.off('click', handleClick);
      instance.off('mousemove', handleMouseMove);
      instance.off('globalout', handleMouseOut);
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    };
  }, [sunburstRootId]);

  return (
    <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden p-5 flex flex-col gap-2 w-full relative group">

      {/* Header Controls */}
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
      <div className="h-[580px] w-full flex flex-row relative">

        {/* Side List (Only for Sunburst) */}
        {chartType === 'sunburst' && (
          <SideList
            citySummary={citySummary}
            totalValue={totalValue}
            expandedCity={expandedCity}
            toggleCity={toggleCity}
            expandedJK={expandedJK}
            toggleJK={toggleJK}
            onHoverItem={handleItemHover}
            onLeaveItem={handleItemLeave}
            colorMode={colorMode}
            activeMetric={activeMetric}
          />
        )}

        {/* Chart */}
        <div className="flex-1 h-full min-w-0">
          <EChartComponent
            ref={chartRef}
            options={option}
            theme={isDarkMode ? 'dark' : 'light'}
            height="100%"
            merge={true}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center px-2 pb-1 border-t border-gray-100 dark:border-white/5 pt-3">
        {colorMode === 'status' ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs">
              <div
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: STATUS_COLORS.yes }}
              />
              <span className="text-gray-600 dark:text-gray-400 font-bold">Сдан (Да)</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: STATUS_COLORS.no }}
              />
              <span className="text-gray-600 dark:text-gray-400 font-bold">Не сдан / В работе</span>
            </div>
          </div>
        ) : (
          chartType === 'bar' &&
          uniqueJKs.length > 0 &&
          uniqueJKs.map((jk, idx) => (
            <div key={jk} className="flex items-center gap-1.5 text-[10px]">
              <div
                className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-gray-600 dark:text-gray-400 font-bold whitespace-nowrap">
                {jk}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ElevatorsByLiterGeneralChart;