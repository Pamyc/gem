import React from 'react';
import { Sparkles, FileText } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">v2.1 Charts</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Добро пожаловать!</h1>
          <p className="text-lg text-indigo-100 max-w-2xl">
            Интерфейс успешно обновлен. Теперь у вас есть доступ к разделу "Статистика" с интерактивными графиками ECharts.
          </p>
        </div>
      </div>

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
