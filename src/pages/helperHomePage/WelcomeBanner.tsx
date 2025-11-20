import React from 'react';
import { Sparkles } from 'lucide-react';

const WelcomeBanner: React.FC = () => {
  return (
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
  );
};

export default WelcomeBanner;