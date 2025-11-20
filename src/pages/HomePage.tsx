import React from 'react';
import { FileText } from 'lucide-react';
import WelcomeBanner from './helperHomePage/WelcomeBanner';

const HomePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome Banner from Helper */}
      <WelcomeBanner />

      {/* Stats Grid Example */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
              <FileText size={24} />
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Активные задачи</h3>
            <p className="text-3xl font-bold text-gray-800">{12 * i}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;