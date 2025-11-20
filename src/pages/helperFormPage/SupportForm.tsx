import React, { useState } from 'react';
import { User, Mail, MessageSquare, ChevronLeft, Send } from 'lucide-react';

const SupportForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'support',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-[#151923] rounded-3xl shadow-lg shadow-gray-100/50 dark:shadow-none border border-gray-200 dark:border-white/5 p-8 md:p-10 transition-colors">
        <div className="mb-8 border-b border-gray-100 dark:border-white/5 pb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Создать обращение</h3>
          <p className="text-gray-500 dark:text-gray-400">Заполните форму ниже, и мы свяжемся с вами.</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 ml-1">
                <User size={16} className="text-indigo-500 dark:text-violet-400" /> Ваше имя
              </label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0b0f19] text-gray-800 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-violet-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-violet-500/20 transition-all outline-none focus:bg-white dark:focus:bg-[#0f131e]"
                placeholder="Иван Иванов"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 ml-1">
                <Mail size={16} className="text-indigo-500 dark:text-violet-400" /> Email
              </label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0b0f19] text-gray-800 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-violet-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-violet-500/20 transition-all outline-none focus:bg-white dark:focus:bg-[#0f131e]"
                placeholder="ivan@example.com"
              />
            </div>
          </div>

          {/* Dropdown (Select) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Тип обращения</label>
            <div className="relative group">
              <select 
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0b0f19] text-gray-800 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-violet-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-violet-500/20 transition-all outline-none appearance-none cursor-pointer focus:bg-white dark:focus:bg-[#0f131e]"
              >
                <option value="support">🛠 Техническая поддержка</option>
                <option value="sales">💼 Вопросы продаж</option>
                <option value="general">👋 Общие вопросы</option>
                <option value="bug">🐛 Сообщить об ошибке</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-indigo-500 transition-colors">
                <ChevronLeft size={18} className="-rotate-90" />
              </div>
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 ml-1">
              <MessageSquare size={16} className="text-indigo-500 dark:text-violet-400" /> Сообщение
            </label>
            <textarea 
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0b0f19] text-gray-800 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-violet-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-violet-500/20 transition-all outline-none focus:bg-white dark:focus:bg-[#0f131e] resize-none"
              placeholder="Опишите вашу проблему или вопрос..."
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <button 
              className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 cursor-pointer transform active:scale-[0.98]"
            >
              <Send size={18} /> Отправить
            </button>
            <button 
              type="button"
              className="px-8 py-4 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-800 dark:hover:text-gray-200 font-semibold transition-colors cursor-pointer"
              onClick={() => setFormData({ name: '', email: '', type: 'support', message: '' })}
            >
              Очистить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportForm;