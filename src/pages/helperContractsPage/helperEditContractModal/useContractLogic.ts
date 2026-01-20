
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

  // Load Liters from DB
  const loadLiters = async (contractId: number, currentRecordId?: number) => {
      if (!contractId) return;
      try {
          // Используем диапазон для поиска всех записей группы (например, 1004, 1004.001, 1004.002)
          // Ищем всё, что >= contractId и < (contractId + 1)
          const baseId = Math.floor(contractId);
          let sql = `SELECT id, liter, elevators_count, floors_count FROM data_contracts WHERE contract_id >= ${baseId} AND contract_id < ${baseId + 1}`;
          
          // Исключаем саму текущую редактируемую запись
          if (currentRecordId) {
              sql += ` AND id != ${currentRecordId}`;
          }
          
          sql += ` ORDER BY id ASC`;

          const res = await executeDbQuery(sql);
          
          if (res.ok && res.data && res.data.length > 0) {
              const mappedLiters: LiterItem[] = res.data.map((row: any) => ({
                  id: row.id,
                  name: row.liter || 'Без названия',
                  elevators: Number(row.elevators_count) || 0,
                  floors: Number(row.floors_count) || 0
              }));
              setLiters(mappedLiters);
          } else {
              // Если это редактирование и литеров нет - показываем пустой список (а не дефолтный),
              // чтобы пользователь не думал, что создался новый литер.
              setLiters([]);
          }
      } catch (e) {
          console.error("Error loading liters:", e);
      }
  };

  // Инициализация
  useEffect(() => {
      if (isOpen) {
          setTransactionsMap({}); // Сброс

          const initData = async () => {
              if (nodeData && nodeData.fullData) {
                  const data = nodeData.fullData;
                  setFormData({
                      ...data,
                      elevators_count: data.elevators_count ?? 0,
                      floors_count: data.floors_count ?? 0
                  });

                  let cid = data.contract_id;
                  
                  // Если contract_id нет в данных (например, не пришел с грида), попробуем достать актуальный из БД по ID записи
                  if (!cid && data.id) {
                      try {
                          const res = await executeDbQuery(`SELECT contract_id FROM data_contracts WHERE id = ${data.id}`);
                          if (res.ok && res.data && res.data.length > 0) {
                              cid = res.data[0].contract_id;
                              // Обновим formData, чтобы при сохранении ID был
                              setFormData(prev => ({ ...prev, contract_id: cid }));
                          }
                      } catch (e) {
                          console.error("Failed to fetch fresh contract_id", e);
                      }
                  }

                  // Загружаем связанные данные, если нашли ID контракта
                  if (cid) {
                      await loadTransactions(cid);
                      await loadLiters(cid, data.id);
                  } else {
                      // Fallback: если contract_id нет даже в БД, значит это "одинокая" запись.
                      // Показываем пустой список литеров (так как сама запись - это и есть объект).
                      setLiters([]);
                  }
              } else {
                  // Новый договор (Режим создания)
                  setFormData({
                      city: '',
                      housing_complex: '',
                      contract_id: 0, 
                      year: new Date().getFullYear(),
                      elevators_count: 0,
                      floors_count: 0
                  });
                  // Для нового договора сразу предлагаем 1 литер
                  setLiters([{ name: 'Литер 1', elevators: 0, floors: 0 }]);
              }
          };

          initData();
          
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
                     if (r.category === 'city_base_index' || r.category === 'city') field = 'city';
                     
                     if (field) {
                         if (!map[field]) map[field] = [];
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
      setTransactionsMap(prev => ({
          ...prev,
          [fieldKey]: newTransactions
      }));
      
      const newSum = newTransactions.reduce((acc, t) => acc + (Number(t.value) || 0), 0);
      
      setFormData(prev => {
          const nextData = { ...prev, [fieldKey]: newSum };
          
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
          
          const contractId = payload.contract_id;

          // --- 1. Сохранение data_contracts (Основная запись договора) ---
          let saveContractSql = '';
          
          const dbReadOnlyFields = [
              'id', 
              'created_at', 
              'updated_at', 
              'rentability_calculated', 
              'profit_per_lift_calculated',
              'gross_profit',
              'is_total',
              'no_liter_breakdown',
              'is_separate_liter'
          ];
          
          // Основной договор: флаг no_liter_breakdown = true
          payload.no_liter_breakdown = true; 
          payload.is_total = false; 
          payload.is_separate_liter = false;

          const cleanEntries = Object.entries(payload).filter(([k, v]) => 
              !dbReadOnlyFields.includes(k) && v !== undefined
          );
          
          if (isEditMode && payload.id) {
              const setClause = cleanEntries.map(([k, v]) => {
                  const val = typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v;
                  return `"${k}" = ${val}`;
              }).join(', ');
              saveContractSql = `UPDATE data_contracts SET ${setClause}, no_liter_breakdown = true WHERE id = ${payload.id}`;
          } else {
              const cols = [...cleanEntries.map(([k]) => `"${k}"`), 'no_liter_breakdown'].join(', ');
              const vals = [...cleanEntries.map(([_, v]) => typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v), 'true'].join(', ');
              saveContractSql = `INSERT INTO data_contracts (${cols}) VALUES (${vals})`;
          }
          await executeDbQuery(saveContractSql);

          // --- 2. Сохранение Литеров (Sync Liters) ---
          
          // A. Удаляем литеры (которые не являются основной записью), которых больше нет в списке UI
          const existingIds = liters.map(l => l.id).filter(id => id !== undefined);
          
          // Важно: удаляем только те, которые принадлежат этому контракту И не являются самим контрактом (id != payload.id)
          // Если это создание, payload.id еще может не быть, но contract_id уникален.
          let deleteCondition = `contract_id = ${contractId}`;
          
          // Исключаем текущий ID редактируемой записи (чтобы случайно не удалить родителя, если флаги кривые)
          if (payload.id) {
              deleteCondition += ` AND id != ${payload.id}`;
          } else {
              // Если создание, то родителя еще нет или мы его только что вставили (но ID не знаем без RETURNING).
              // Для упрощения считаем, что при создании мы сначала удаляем "мусор" (которого быть не должно), а потом вставляем.
              // Но лучше добавить условие no_liter_breakdown = false для удаления.
              deleteCondition += ` AND no_liter_breakdown = false`;
          }

          if (existingIds.length > 0) {
              deleteCondition += ` AND id NOT IN (${existingIds.join(',')})`;
          }
          await executeDbQuery(`DELETE FROM data_contracts WHERE ${deleteCondition}`);

          // B. Upsert (Обновление или Вставка) для каждого литера
          for (const liter of liters) {
              const literData: Record<string, any> = {
                  contract_id: contractId,
                  liter: liter.name,
                  elevators_count: liter.elevators,
                  floors_count: liter.floors,
                  
                  // Наследуем контекст
                  city: payload.city,
                  housing_complex: payload.housing_complex,
                  region: payload.region,
                  client_name: payload.client_name,
                  year: payload.year,
                  object_type: payload.object_type,
                  is_handed_over: payload.is_handed_over,
                  
                  no_liter_breakdown: false, // Это дочерний элемент
                  is_separate_liter: true,
                  is_total: false
              };

              if (liter.id) {
                  const updates = Object.entries(literData)
                      .map(([k, v]) => {
                          const val = typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v;
                          return `"${k}" = ${val}`;
                      })
                      .join(', ');
                  await executeDbQuery(`UPDATE data_contracts SET ${updates} WHERE id = ${liter.id}`);
              } else {
                  const cols = Object.keys(literData).map(k => `"${k}"`).join(', ');
                  const vals = Object.values(literData).map(v => typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v).join(', ');
                  await executeDbQuery(`INSERT INTO data_contracts (${cols}) VALUES (${vals})`);
              }
          }

          // --- 3. Сохранение транзакций ---
          for (const [type, txs] of Object.entries(transactionsMap)) {
              const deleteSql = `DELETE FROM contract_transactions WHERE contract_id = ${contractId} AND type = '${type}'`;
              await executeDbQuery(deleteSql);

              if (txs.length > 0) {
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
