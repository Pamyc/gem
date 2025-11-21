import React, { useState, useEffect } from 'react';
import WelcomeBanner from './helperHomePage/WelcomeBanner';
import SheetSelector from './helperHomePage/SheetSelector';
import SheetConfigTable from './helperHomePage/SheetConfigTable';
import SheetMetrics from './helperHomePage/SheetMetrics';
import { useDataStore } from '../contexts/DataContext';

const HomePage: React.FC = () => {
  const { sheetConfigs } = useDataStore();
  const [selectedSheetKey, setSelectedSheetKey] = useState<string>('');

  // Устанавливаем первую таблицу по умолчанию, когда загрузились конфиги
  useEffect(() => {
    if (sheetConfigs.length > 0 && !selectedSheetKey) {
      setSelectedSheetKey(sheetConfigs[0].key);
    }
  }, [sheetConfigs, selectedSheetKey]);

  return (
    <div className="w-full max-w-[1152px] mx-auto space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google Sheets Selector (Controlled) */}
        <SheetSelector 
          selectedSheetKey={selectedSheetKey} 
          onSheetChange={setSelectedSheetKey} 
        />
        
        {/* Metrics for the selected sheet */}
        <SheetMetrics selectedSheetKey={selectedSheetKey} />
      </div>

      {/* Sheet Configuration Table */}
      <SheetConfigTable />
    </div>
  );
};

export default HomePage;