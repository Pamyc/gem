
import React from 'react';
import GeneralTab from './helperExample2Page/GeneralTab';

interface Example2PageProps {
  isDarkMode: boolean;
  mainColor: string;
}

const Example2Page: React.FC<Example2PageProps> = ({ isDarkMode, mainColor }) => {
  return (
    <div className="w-full mx-auto space-y-6">
       <div className="pt-2">
          <GeneralTab isDarkMode={isDarkMode}  mainColor={mainColor} />
       </div>
    </div>
  );
};

export default Example2Page;
