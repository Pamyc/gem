import React from 'react';
import ComparisonChart from '../helperExamplePage/ComparisonChart';

interface ComparisonTabProps {
  isDarkMode: boolean;
}

const ComparisonTab: React.FC<ComparisonTabProps> = ({ isDarkMode }) => {
  return (
    <div className="w-full">
       <ComparisonChart isDarkMode={isDarkMode} />
    </div>
  );
};

export default ComparisonTab;