import React from 'react';
import { Sparkles } from 'lucide-react';

const WelcomeBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-violet-500/10 relative overflow-hidden border border-white/10">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-10 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl"></div>

      <div className="relative z-10">

        <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">Добро пожаловать!</h1>

      </div>
    </div>
  );
};

export default WelcomeBanner;