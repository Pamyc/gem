import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Menu, 
  ChevronLeft, 
  Sparkles, 
  Send, 
  User, 
  Mail, 
  MessageSquare,
  CheckCircle2,
  Bell,
  BarChart3
} from 'lucide-react';
import * as echarts from 'echarts';

// --- ECharts Wrapper Component ---
interface ChartProps {
  options: any;
  height?: string;
}

const EChartComponent: React.FC<ChartProps> = ({ options, height = "300px" }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // Инициализация графика
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      chartInstance.current.setOption(options);
    }

    // Функция изменения размера
    const resizeChart = () => {
      chartInstance.current?.resize();
    };

    // 1. ResizeObserver следит за размером контейнера (самое важное для фикса)
    const resizeObserver = new ResizeObserver(() => {
      resizeChart();
    });

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    // 2. Обычный ресайз окна (на всякий случай)
    window.addEventListener('resize', resizeChart);

    return () => {
      window.removeEventListener('resize', resizeChart);
      resizeObserver.disconnect();
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [options]);

  return <div ref={chartRef} style={{ width: '100%', height, overflow: 'hidden' }} />;
};

// --- Main App Component ---

type Tab = 'home' | 'form' | 'settings' | 'stats';

const App: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  // Данные формы (для демонстрации)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'support',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const menuItems = [
    { id: 'home', label: 'Главная', icon: LayoutDashboard },
    { id: 'stats', label: 'Статистика', icon: BarChart3 },
    { id: 'form', label: 'Заявка', icon: FileText },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  // --- Chart Configurations ---
  
  const lineChartOption = {
    title: { text: 'Динамика обращений', textStyle: { fontSize: 14, color: '#64748b' } },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#64748b' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
    },
    series: [
      {
        name: 'Заявки',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210],
        lineStyle: { color: '#6366f1', width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(99, 102, 241, 0.5)' },
            { offset: 1, color: 'rgba(99, 102, 241, 0.0)' }
          ])
        }
      },
      {
        name: 'Решено',
        type: 'line',
        smooth: true,
        data: [100, 120, 90, 120, 85, 200, 190],
        lineStyle: { color: '#10b981', width: 3 },
      }
    ]
  };

  const barChartOption = {
    title: { text: 'Загрузка менеджеров', textStyle: { fontSize: 14, color: '#64748b' } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Анна', 'Олег', 'Мария', 'Дмитрий', 'Елена'],
      axisTick: { alignWithLabel: true },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#64748b' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
    },
    series: [
      {
        name: 'Обработано',
        type: 'bar',
        barWidth: '60%',
        data: [320, 250, 200, 334, 290],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#818cf8' },
            { offset: 1, color: '#4f46e5' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  };

  const donutChartOption = {
    title: { text: 'Категории', left: 'center', textStyle: { fontSize: 14, color: '#64748b' } },
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', left: 'center' },
    series: [
      {
        name: 'Тип обращения',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 20, fontWeight: 'bold' }
        },
        data: [
          { value: 1048, name: 'Техподдержка', itemStyle: { color: '#6366f1' } },
          { value: 735, name: 'Продажи', itemStyle: { color: '#ec4899' } },
          { value: 580, name: 'Бухгалтерия', itemStyle: { color: '#f59e0b' } },
          { value: 484, name: 'Другое', itemStyle: { color: '#10b981' } },
        ]
      }
    ]
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`
          ${isCollapsed ? 'w-20' : 'w-72'} 
          bg-slate-900 text-white transition-all duration-300 ease-in-out relative flex flex-col shadow-xl
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-center border-b border-slate-700/50">
          <div className="flex items-center gap-3 overflow-hidden px-4">
            <div className="bg-indigo-500 p-2 rounded-lg shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className={`font-bold text-xl whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              Timeweb App
            </span>
          </div>
        </div>

        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-indigo-500 text-white p-1 rounded-full shadow-lg hover:bg-indigo-600 transition-colors z-10 border-2 border-slate-900"
        >
          {isCollapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`
                  w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-white' : 'group-hover:text-indigo-400'}`} />
                <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 translate-x-4 w-0 overflow-hidden' : 'opacity-100 translate-x-0'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-800">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 shrink-0 border-2 border-slate-700"></div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white">Пользователь</p>
                <p className="text-xs text-slate-400 truncate">user@example.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm shrink-0 z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {menuItems.find(i => i.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* TAB: HOME */}
          {activeTab === 'home' && (
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
          )}

          {/* TAB: STATISTICS */}
          {activeTab === 'stats' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Top Row: Line Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <EChartComponent options={lineChartOption} height="350px" />
              </div>

              {/* Bottom Row: Bar and Donut */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <EChartComponent options={barChartOption} height="300px" />
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <EChartComponent options={donutChartOption} height="300px" />
                </div>
              </div>
            </div>
          )}

          {/* TAB: FORM */}
          {activeTab === 'form' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="mb-8 border-b border-gray-100 pb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Создать обращение</h3>
                  <p className="text-gray-500">Заполните форму ниже, и мы свяжемся с вами.</p>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <User size={16} /> Ваше имя
                      </label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-gray-50 focus:bg-white"
                        placeholder="Иван Иванов"
                      />
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail size={16} /> Email
                      </label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-gray-50 focus:bg-white"
                        placeholder="ivan@example.com"
                      />
                    </div>
                  </div>

                  {/* Dropdown (Select) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Тип обращения</label>
                    <div className="relative">
                      <select 
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                      >
                        <option value="support">🛠 Техническая поддержка</option>
                        <option value="sales">💼 Вопросы продаж</option>
                        <option value="general">👋 Общие вопросы</option>
                        <option value="bug">🐛 Сообщить об ошибке</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronLeft size={16} className="-rotate-90" />
                      </div>
                    </div>
                  </div>

                  {/* Textarea */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MessageSquare size={16} /> Сообщение
                    </label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-gray-50 focus:bg-white resize-none"
                      placeholder="Опишите вашу проблему или вопрос..."
                    ></textarea>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-4 pt-4">
                    <button 
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                      <Send size={18} /> Отправить
                    </button>
                    <button 
                      type="button"
                      className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 font-medium transition-colors"
                      onClick={() => setFormData({ name: '', email: '', type: 'support', message: '' })}
                    >
                      Очистить
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
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
                    <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none">
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
          )}

        </div>
      </main>
    </div>
  );
};

export default App;