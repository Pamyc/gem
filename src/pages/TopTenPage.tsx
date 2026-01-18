
import React, { useState, useEffect } from 'react';
import RegionSelector from './helperStatsPage/helperElevatorTab/RegionSelector';
import CitySelector from './helperStatsPage/helperElevatorTab/CitySelector';
import YearSelector from './helperStatsPage/helperElevatorTab/YearSelector';
import ComplexComparisons from './helperStatsPage/helperElevatorTab/ComplexComparisons';
import ComplexComparisonsDB from './helperStatsPage/helperElevatorTab/ComplexComparisonsDB';
import DataIdentityCheck from './helperStatsPage/DataIdentityCheck';
import ComparisonModal from './helperStatsPage/ComparisonModal';
import { Database, FileSpreadsheet, Maximize2 } from 'lucide-react';

interface TopTenPageProps {
  isDarkMode: boolean;
}

const TopTenPage: React.FC<TopTenPageProps> = ({ isDarkMode }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isSticky, setIsSticky] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const container = document.getElementById('main-scroll-container');
    if (!container) return;

    const handleScroll = () => {
      setIsSticky(container.scrollTop > 50);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedCity('');
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-20 px-2 md:px-6">
      
      {/* 1. Sticky Header Controls */}
      <div 
        className={`
          sticky top-[60px] z-40 flex flex-col items-start gap-2 transition-all duration-500 ease-in-out origin-top-left
          ${isSticky 
            ? 'bg-slate-50/90 dark:bg-[#0b0f19]/0 backdrop-blur-md p-4 -mx-4 px-8 rounded-b-2xl shadow-md border-b border-gray-200/10 transform scale-95 translate-y-[-5px] w-[105%]' 
            : 'w-full'
          }
        `}
      >
        <div className="flex flex-wrap gap-4 items-center justify-between w-full">
            <div className="flex flex-wrap gap-4 items-center">
                <RegionSelector selectedRegion={selectedRegion} onSelectRegion={handleRegionChange} />
                <CitySelector selectedCity={selectedCity} onSelectCity={setSelectedCity} selectedRegion={selectedRegion} />
                <YearSelector selectedYear={selectedYear} onSelectYear={setSelectedYear} selectedCity={selectedCity} selectedRegion={selectedRegion} />
            </div>
            
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
                <Maximize2 size={18} />
                <span>Режим сравнения</span>
            </button>
        </div>
      </div>

      {/* 2. Identity Check (Immediate Answer) */}
      <DataIdentityCheck />

      {/* 3. Two Column Comparison Layout (On Page) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Left Column: Google Sheets */}
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-2 border-b-2 border-indigo-500">
                <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <FileSpreadsheet size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Google Sheets</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">key: "clientGrowth"</p>
                </div>
            </div>
            
            <div className="relative">
                <ComplexComparisons 
                    isDarkMode={isDarkMode}
                    selectedCity={selectedCity}
                    selectedYear={selectedYear}
                    selectedRegion={selectedRegion}
                />
            </div>
        </div>

        {/* Right Column: Database */}
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-2 border-b-2 border-emerald-500">
                <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <Database size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">PostgreSQL</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">key: "database_clientGrowth"</p>
                </div>
            </div>

            <div className="relative">
                <ComplexComparisonsDB 
                    isDarkMode={isDarkMode}
                    selectedCity={selectedCity}
                    selectedYear={selectedYear}
                    selectedRegion={selectedRegion}
                />
            </div>
        </div>

      </div>

      {/* 4. Comparison Modal */}
      <ComparisonModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isDarkMode={isDarkMode}
        selectedCity={selectedCity}
        selectedYear={selectedYear}
        selectedRegion={selectedRegion}
      />

    </div>
  );
};

export default TopTenPage;
