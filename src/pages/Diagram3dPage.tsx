
import React from 'react';
import GlTestWidget from './helperDiagram3dPage/GlTestWidget';

interface Diagram3dPageProps {
  isDarkMode: boolean;
}

const Diagram3dPage: React.FC<Diagram3dPageProps> = ({ isDarkMode }) => {
  return (
    <div className="w-full max-w-[1152px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
         <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">3D Визуализация</h2>
         <p className="text-gray-500 dark:text-gray-400">Экспериментальный раздел для трехмерных графиков и моделей.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlTestWidget />
      </div>
    </div>
  );
};

export default Diagram3dPage;
