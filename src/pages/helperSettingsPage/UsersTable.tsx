import React from 'react';
import { Users, Shield, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const UsersTable: React.FC = () => {
  const { usersList } = useAuth();

  return (
    <div className="bg-white dark:bg-[#151923] rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 overflow-hidden transition-colors mt-8">
      <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
        <div className="bg-fuchsia-100 dark:bg-fuchsia-500/20 p-2 rounded-xl text-fuchsia-600 dark:text-fuchsia-300">
            <Users size={20} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Пользователи системы</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#0b0f19] border-b border-gray-100 dark:border-white/5">
              <th className="px-8 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Пользователь</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Логин</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Роль</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {usersList.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                            {u.username.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-800 dark:text-gray-200">{u.name}</span>
                    </div>
                </td>
                <td className="px-8 py-5 font-mono text-sm text-gray-600 dark:text-gray-400">{u.username}</td>
                <td className="px-8 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    u.role === 'admin' 
                      ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30' 
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {u.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                    {u.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40"></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;