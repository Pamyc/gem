import React from 'react';
import { Sparkles } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      <div className="text-center p-10 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 animate-fade-in-up transform transition-all hover:scale-105">
        <div className="flex justify-center mb-4">
          <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse" />
        </div>
        <h1 className="text-6xl font-bold mb-4 drop-shadow-md">
          Привет!
        </h1>
        <p className="text-xl font-light text-white/90">
          (Это короткий ответ в виде веб-приложения)
        </p>
      </div>
    </div>
  );
};

export default App;