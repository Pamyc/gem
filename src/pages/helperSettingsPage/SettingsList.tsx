import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const SettingsList: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-[#151923] rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 overflow-hidden transition-colors">
        <div className="p-8 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Настройки приложения</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-white/5">
          
          {/* Toggle Item 1 */}
          <div className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <div>
              <p className="font-bold text-gray-800 dark:text-gray-200">Уведомления</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Получать email при обновлении статуса</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-12 h-7 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-violet-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600 dark:peer-checked:bg-violet-600"></div>
            </label>
          </div>

          {/* Toggle Item 2 */}
          <div className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <div>
              <p className="font-bold text-gray-800 dark:text-gray-200">Темная тема (System)</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Автоматически переключать тему по настройкам ОС</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-12 h-7 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-violet-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600 dark:peer-checked:bg-violet-600"></div>
            </label>
          </div>

          {/* Dropdown in Settings */}
          <div className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <div>
              <p className="font-bold text-gray-800 dark:text-gray-200">Язык интерфейса</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Выберите предпочтительный язык</p>
            </div>
            <select className="bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 text-sm rounded-xl focus:ring-indigo-500 dark:focus:ring-violet-500 focus:border-indigo-500 block p-3 outline-none cursor-pointer font-medium">
              <option>Русский</option>
              <option>English</option>
              <option>Español</option>
            </select>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-[#0b0f19]/50 flex items-start gap-4">
            <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={22} />
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Система работает стабильно</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Последняя проверка: 2 минуты назад</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsList;