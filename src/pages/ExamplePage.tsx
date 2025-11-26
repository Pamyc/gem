import React from 'react';

interface ExamplePageProps {
  isDarkMode: boolean;
}

const ExamplePage: React.FC<ExamplePageProps> = () => {
  // Используем прямой путь к файлу в корне
  // В Vite файлы в корне (public dir или root) доступны по "/"
  const oktbrParkImg = '/pho.avif';

  return (
    <div className="w-full max-w-[1152px] mx-auto space-y-8 p-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          Тест изображения
          <span className="px-3 py-1 text-xs font-normal bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded-full">
            /pho.avif
          </span>
        </h2>
        
        <div className="p-8 bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
           <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* Image Container */}
              <div className="w-full md:w-1/2 relative group">
                 <div className="aspect-video w-full overflow-hidden rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 bg-gray-100 dark:bg-black/20 relative">
                    <img 
                      src={oktbrParkImg} 
                      alt="Oktbr Park" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Not+Found';
                      }}
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end p-4">
                        <p className="text-white font-medium text-sm">pho.avif</p>
                    </div>
                 </div>
              </div>

              {/* Info Panel */}
              <div className="w-full md:w-1/2 space-y-4">
                 <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Файл из корня проекта</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                       Попытка загрузить изображение по адресу <code>/pho.avif</code>.
                       Если изображение физически находится в корневой папке проекта (рядом с index.html), оно должно отобразиться.
                    </p>
                 </div>

                 <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-white/5 font-mono text-xs text-gray-600 dark:text-gray-300 break-all">
                    <span className="text-gray-400 select-none">Src URL: </span>
                    {oktbrParkImg}
                 </div>

                 <a 
                   href={oktbrParkImg} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20"
                 >
                    Открыть оригинал
                 </a>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
};

export default ExamplePage;