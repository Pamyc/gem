import React, { useState } from 'react';
import { Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CCMLogo from '../components/CCMLogo';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  // Предустановленные значения по умолчанию
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Имитация задержки сети
    setTimeout(() => {
      const success = login(username, password);
      if (!success) {
        setError('Неверное имя пользователя или пароль');
        setIsLoading(false);
      }
      // Если успех, перенаправление произойдет автоматически через обновление стейта в App
    }, 600);
  };

  return (
    <div className="dark font-sans">
      <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
         {/* Background Accents */}
         <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none"></div>

         {/* LEFT Flanking Logo */}
         <div className="absolute left-10 lg:left-20 top-1/2 -translate-y-1/2 h-[70vh] w-auto aspect-[1/2] text-[#C5A059] opacity-[0.37] pointer-events-none hidden xl:block">
            <CCMLogo className="w-full h-full" />
         </div>

         {/* RIGHT Flanking Logo */}
         <div className="absolute right-10 lg:right-20 top-1/2 -translate-y-1/2 h-[70vh] w-auto aspect-[1/2] text-[#C5A059] opacity-[0.37] pointer-events-none hidden xl:block">
            <CCMLogo className="w-full h-full" />
         </div>

        <div className="bg-[#151923] w-full max-w-md rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative z-10">
          
          {/* Header */}
          <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-10 text-center relative overflow-hidden min-h-[180px] flex flex-col items-center justify-center">
             {/* Background Watermark Logo inside card */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-96 text-white opacity-[0.15] pointer-events-none transform scale-125">
                <CCMLogo className="w-full h-full" />
             </div>
             
             {/* Text Content */}
             <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">CCM Elevator</h2>
                <p className="text-violet-100 mt-2 text-sm font-medium opacity-90">Лучшая установка лифтов ЮГА России</p>
             </div>
          </div>

          {/* Form */}
          <div className="p-8 pt-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 ml-1">Логин</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <UserIcon size={20} />
                  </div>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-2xl border border-white/10 bg-[#0b0f19] text-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all outline-none font-medium placeholder-gray-600"
                    placeholder="admin"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 ml-1">Пароль</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-2xl border border-white/10 bg-[#0b0f19] text-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all outline-none font-medium placeholder-gray-600"
                    placeholder="•••••"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-900/20 text-red-400 text-sm font-medium text-center border border-red-500/20 animate-shake">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    Войти
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                Используйте <span className="font-mono bg-white/10 px-1 rounded text-gray-300">admin</span> / <span className="font-mono bg-white/10 px-1 rounded text-gray-300">admin</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;