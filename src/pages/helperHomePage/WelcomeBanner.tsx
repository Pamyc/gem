import React from 'react';
import { Sparkles } from 'lucide-react';

const WelcomeBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-violet-500/10 relative overflow-hidden border border-white/10">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-10 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-md">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          </div>
          <span className="bg-black/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm uppercase border border-white/10">v2.2 Updated</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">Добро пожаловать!</h1>
        <p className="text-lg text-violet-100 max-w-2xl leading-relaxed">
          Интерфейс обновлен. Наслаждайтесь новой цветовой гаммой и улучшенной производительностью графиков.
        </p>
      </div>
    </div>
  );
};

export default WelcomeBanner;