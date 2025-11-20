import React, { useState } from 'react';
import { User, Mail, MessageSquare, ChevronLeft, Send } from 'lucide-react';

const FormPage: React.FC = () => {
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
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={18} /> Отправить
            </button>
            <button 
              type="button"
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 font-medium transition-colors cursor-pointer"
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

export default FormPage;
