
import { useState, useEffect } from 'react';
import { executeDbQuery } from '../../../utils/dbGatewayApi';
import { EXCLUDED_FIELDS, FINANCIAL_KEYWORDS } from './constants';
import { DB_MAPPING } from '../../../contexts/DataContext';

export interface LiterItem {
  id?: number;
  name: string;
  elevators: number;
  floors: number;
}

export interface Transaction {
  id?: number;
  date: string;
  value: number;
  text: string;
}

interface UseContractLogicProps {
  isOpen: boolean;
  nodeData?: any;
  onSuccess: () => void;
  onClose: () => void;
}

export const useContractLogic = ({ isOpen, nodeData, onSuccess, onClose }: UseContractLogicProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [liters, setLiters] = useState<LiterItem[]>([
      { name: 'Литер 1', elevators: 0, floors: 0 }
  ]);
  const [fieldCurrencies, setFieldCurrencies] = useState<Record<string, string>>({});
  const [optionsMap, setOptionsMap] = useState<Record<string, string[]>>({});
  const [previewSql, setPreviewSql] = useState<string>('');

  // Хранилище транзакций
  const [transactionsMap, setTransactionsMap] = useState<Record<string, Transaction[]>>({});

  const isEditMode = !!(nodeData && nodeData.dbId);

  // Load Transactions from DB
  const loadTransactions = async (contractId: number) => {
      if (!contractId) return;
      try {
          const sql = `SELECT * FROM contract_transactions WHERE contract_id = ${contractId}`;
          const res = await executeDbQuery(sql);
          if (res.ok && res.data) {
              const grouped: Record<string, Transaction[]> = {};
              res.data.forEach((row: any) => {
                  if (!grouped[row.type]) grouped[row.type] = [];
                  grouped[row.type].push({
                      id: row.id,
                      date: row.date ? String(row.date).split('T')[0] : new Date().toISOString().split('T')[0],
                      value: Number(row.value),
                      text: row.text || ''
                  });
              });
              setTransactionsMap(grouped);
              
              // Синхронизируем суммы формы с транзакциями (Source of Truth)
              const updates: Record<string, number> = {};
              Object.keys(grouped).forEach(key => {
                  updates[key] = grouped[key].reduce((sum, t) => sum + t.value, 0);
              });
              setFormData(prev => ({ ...prev, ...updates }));
          }
      } catch (e) {
          console.error("Error loading transactions:", e);
      }
  };

  // Инициализация
  useEffect(() => {
      if (isOpen) {
          setTransactionsMap({}); // Сброс

          if (nodeData && nodeData.fullData) {
              const data = nodeData.fullData;
              setFormData({
                  ...data,
                  elevators_count: data.elevators_count ?? 0,
                  floors_count: data.floors_count ?? 0
              });

              // Загружаем транзакции, если есть ID контракта
              if (data.contract_id) {
                  loadTransactions(data.contract_id);
              }
          } else {
              // Новый договор
              setFormData({
                  city: '',
                  housing_complex: '',
                  contract_id: 0, 
                  year: new Date().getFullYear(),
                  elevators_count: 0,
                  floors_count: 0
              });
              setLiters([{ name: 'Литер 1', elevators: 0, floors: 0 }]);
          }
          
          // Загрузка справочников
          const fetchOptions = async () => {
             const sql = "SELECT category, value FROM app_dictionaries WHERE is_active = true ORDER BY sort_order ASC";
             const res = await executeDbQuery(sql);
             
             if (res.ok && res.data) {
                 const map: Record<string, string[]> = {};
                 res.data.forEach((r: any) => {
                     let field = '';
                     
                     // Mapping dictionary categories to DB fields
                     if (r.category === 'region') field = 'region';
                     if (r.category === 'client') field = 'client_name';
                     if (r.category === 'object_type') field = 'object_type';
                     if (r.category === 'jk') field = 'housing_complex';
                     
                     // FIX: Добавлена поддержка поля Город
                     if (r.category === 'city_base_index' || r.category === 'city') field = 'city';
                     
                     if (field) {
                         if (!map[field]) map[field] = [];
                         // Избегаем дублей
                         if (!map[field].includes(r.value)) {
                            map[field].push(r.value);
                         }
                     }
                 });
                 setOptionsMap(map);
             }
          };
          fetchOptions();
      }
  }, [isOpen, nodeData]);

  const handleChange = (key: string, value: any) => {
      setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleTransactionChange = (fieldKey: string, newTransactions: Transaction[]) => {
      // 1. Обновляем список транзакций в стейте
      setTransactionsMap(prev => ({
          ...prev,
          [fieldKey]: newTransactions
      }));
      
      // 2. Пересчитываем сумму для отображения
      const newSum = newTransactions.reduce((acc, t) => acc + (Number(t.value) || 0), 0);
      
      setFormData(prev => {
          const nextData = { ...prev, [fieldKey]: newSum };
          
          // Live Recalculation for Gross Profit in UI
          if (fieldKey === 'income_total_fact' || fieldKey === 'expense_total_fact') {
              const income = fieldKey === 'income_total_fact' ? newSum : (nextData.income_total_fact || 0);
              const expense = fieldKey === 'expense_total_fact' ? newSum : (nextData.expense_total_fact || 0);
              nextData.gross_profit = income - expense;
          }
          
          return nextData;
      });
  };

  const handleCurrencyChange = (key: string, value: string) => {
      setFieldCurrencies(prev => ({ ...prev, [key]: value }));
  };

  const addLiter = () => setLiters([...liters, { name: `Литер ${liters.length + 1}`, elevators: 0, floors: 0 }]);
  const removeLiter = (idx: number) => setLiters(liters.filter((_, i) => i !== idx));
  const updateLiter = (idx: number, field: keyof LiterItem, value: any) => {
      const newLiters = [...liters];
      newLiters[idx] = { ...newLiters[idx], [field]: value };
      setLiters(newLiters);
      
      const totalElevators = newLiters.reduce((sum, l) => sum + Number(l.elevators || 0), 0);
      const totalFloors = newLiters.reduce((sum, l) => sum + Number(l.floors || 0), 0);
      setFormData(prev => ({ ...prev, elevators_count: totalElevators, floors_count: totalFloors }));
  };

  // Preview SQL generator
  useEffect(() => {
      const fields = Object.keys(formData).filter(k => !EXCLUDED_FIELDS.includes(k) && k !== 'gross_profit' && formData[k] !== undefined && formData[k] !== '');
      if (fields.length === 0) {
          setPreviewSql('-- Нет изменений');
          return;
      }
      const setClause = fields.map(k => `${k} = '${formData[k]}'`).join(',\n  ');
      setPreviewSql(`UPDATE data_contracts SET\n  ${setClause}\nWHERE id = ${formData.id || 'NEW'};`);
  }, [formData]);

  const handleSave = async () => {
      setLoading(true);
      try {
          const payload = { ...formData };
          
          // Генерируем contract_id для новых, если его нет
          if (!payload.contract_id || payload.contract_id === 0) {
              payload.contract_id = Math.floor(Date.now() / 1000); 
          }
          
          // 1. Сохранение data_contracts
          let saveContractSql = '';
          
          // Список полей, которые НЕЛЬЗЯ писать в базу (PK, Generated, Service)
          const dbReadOnlyFields = [
              'id', 
              'created_at', 
              'updated_at', 
              'rentability_calculated', 
              'profit_per_lift_calculated',
              'gross_profit', // Generated Column
              'is_total',
              'no_liter_breakdown',
              'is_separate_liter'
          ];
          
          // Фильтруем payload для data_contracts
          // contract_id должен остаться!
          const cleanEntries = Object.entries(payload).filter(([k, v]) => 
              !dbReadOnlyFields.includes(k) && v !== undefined
          );
          
          if (isEditMode && payload.id) {
              const setClause = cleanEntries.map(([k, v]) => {
                  const val = typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v;
                  return `"${k}" = ${val}`;
              }).join(', ');
              saveContractSql = `UPDATE data_contracts SET ${setClause} WHERE id = ${payload.id}`;
          } else {
              const cols = cleanEntries.map(([k]) => `"${k}"`).join(', ');
              const vals = cleanEntries.map(([_, v]) => typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v).join(', ');
              saveContractSql = `INSERT INTO data_contracts (${cols}) VALUES (${vals})`;
          }
          await executeDbQuery(saveContractSql);

          // 2. Сохранение contract_transactions
          const contractId = payload.contract_id;
          for (const [type, txs] of Object.entries(transactionsMap)) {
              // Удаляем старые
              const deleteSql = `DELETE FROM contract_transactions WHERE contract_id = ${contractId} AND type = '${type}'`;
              await executeDbQuery(deleteSql);

              if (txs.length > 0) {
                  // Вставляем новые
                  const values = txs.map(t => {
                      const val = t.value || 0;
                      const txt = (t.text || '').replace(/'/g, "''");
                      const dt = t.date || new Date().toISOString().split('T')[0];
                      return `(${contractId}, '${type}', ${val}, '${txt}', '${dt}')`;
                  }).join(', ');
                  
                  const insertSql = `INSERT INTO contract_transactions (contract_id, type, value, text, date) VALUES ${values}`;
                  await executeDbQuery(insertSql);
              }
          }

          onSuccess();
          onClose();
      } catch (err) {
          console.error("Save Error:", err);
          alert("Ошибка при сохранении: " + err);
      } finally {
          setLoading(false);
      }
  };

  // Поля, которые мы скрываем из UI
  const fieldsToExcludeFromUI = [
      ...EXCLUDED_FIELDS,
      'is_total', 
      'no_liter_breakdown', 
      'is_separate_liter'
  ];

  const generalFields = DB_MAPPING.filter(m => 
      !FINANCIAL_KEYWORDS.some(k => m.db.includes(k)) && 
      !fieldsToExcludeFromUI.includes(m.db) && 
      !m.db.includes('count')
  );

  return {
    formData,
    loading,
    liters,
    fieldCurrencies,
    optionsMap,
    generalFields,
    isEditMode,
    previewSql,
    transactionsMap,
    handleChange,
    handleTransactionChange,
    handleCurrencyChange,
    addLiter,
    removeLiter,
    updateLiter,
    handleSave
  };
};
