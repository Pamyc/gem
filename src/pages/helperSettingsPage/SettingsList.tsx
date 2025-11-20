import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const SettingsList: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Настройки приложения</h3>
        </div>
        <div className="divide-y divide-gray-100">
          
          {/* Toggle Item 1 */}
          <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium text-gray-800">Уведомления</p>
              <p className="text-sm text-gray-500">Получать email при обновлении статуса</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Toggle Item 2 */}
          <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium text-gray-800">Темная тема</p>
              <p className="text-sm text-gray-500">Использовать темное оформление интерфейса</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Dropdown in Settings */}
          <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium text-gray-800">Язык интерфейса</p>
              <p className="text-sm text-gray-500">Выберите предпочтительный язык</p>
            </div>
            <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none cursor-pointer">
              <option>Русский</option>
              <option>English</option>
              <option>Español</option>
            </select>
          </div>

          <div className="p-6 bg-gray-50 flex items-start gap-3">
            <CheckCircle2 className="text-green-500 shrink-0 mt-1" size={20} />
            <div>
              <p className="text-sm font-medium text-gray-800">Система работает стабильно</p>
              <p className="text-xs text-gray-500 mt-1">Последняя проверка: 2 минуты назад</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsList;