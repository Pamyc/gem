
import React, { useMemo } from 'react';
import { useDataStore } from '../../contexts/DataContext';
import { CardConfig } from '../../types/card';
import { calculateCardMetrics, CalculationResult } from '../../utils/cardCalculation';

// Import Templates
import ClassicCard from './helper/ClassicCard';
import GradientCard from './helper/GradientCard';
import MinMaxCard from './helper/MinMaxCard';
import CustomCard from './helper/CustomCard';

interface DynamicCardProps {
  config: CardConfig;
  className?: string;
}

export type { CalculationResult }; // Re-export for sub-components

const DynamicCard: React.FC<DynamicCardProps> = ({ config, className = "" }) => {
  const { googleSheets, sheetConfigs } = useDataStore();

  // --- 1. Data Processing Logic (Global Card Metric) ---
  const calculationResult: CalculationResult = useMemo(() => {
    return calculateCardMetrics(googleSheets, sheetConfigs, config);
  }, [googleSheets, sheetConfigs, config]);

  // --- 2. Common Style Props ---
  const containerStyle: React.CSSProperties = {
      width: config.width || '100%',
      height: config.height === 'auto' ? 'auto' : config.height,
      minHeight: config.height === 'auto' ? 'auto' : config.height,
  };

  // --- 3. Render Based on Template ---
  if (config.template === 'custom') {
    return <CustomCard config={config} globalData={calculationResult} containerStyle={containerStyle} />;
  }

  if (config.template === 'minMax') {
      return <MinMaxCard config={config} data={calculationResult} containerStyle={containerStyle} />;
  }

  if (config.template === 'gradient') {
      return <GradientCard config={config} data={calculationResult} containerStyle={containerStyle} />;
  }

  // Default to Classic
  return <ClassicCard config={config} data={calculationResult} containerStyle={containerStyle} />;
};

export default DynamicCard;
