
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
          // Используем floor, чтобы найти транзакции, привязанные к "телу" договора (целое число)
          const baseId = Math.floor(contractId);
          // Транзакции могут быть привязаны как к X (8001), так и к X.999. Ищем по диапазону для надежности
          const sql = `SELECT * FROM contract_transactions WHERE contract_id >= ${baseId} AND contract_id < ${baseId + 1}`;
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
          const baseId = Math.floor(contractId);
          
          let sql = `SELECT id, liter, elevators_count, floors_count FROM data_contracts WHERE contract_id >= ${baseId} AND contract_id < ${baseId + 1} AND is_separate_liter = true`;
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
                  
                  if (!cid && data.id) {
                      try {
                          const res = await executeDbQuery(`SELECT contract_id FROM data_contracts WHERE id = ${data.id}`);
                          if (res.ok && res.data && res.data.length > 0) {
                              cid = res.data[0].contract_id;
                              setFormData(prev => ({ ...prev, contract_id: cid }));
                          }
                      } catch (e) {
                          console.error("Failed to fetch fresh contract_id", e);
                      }
                  }

                  if (cid) {
                      await loadTransactions(cid);
                      await loadLiters(cid, data.id);
                  } else {
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

  // --- ЛОГИКА СОХРАНЕНИЯ СПРАВОЧНИКОВ ---
  const updateDictionaries = async () => {
      const categoriesToCheck = [
          { field: 'region', cat: 'region' },
          { field: 'city', cat: 'city' },
          { field: 'client_name', cat: 'client' },
          { field: 'object_type', cat: 'object_type' },
          { field: 'housing_complex', cat: 'jk' }
      ];

      for (const item of categoriesToCheck) {
          const val = formData[item.field];
          if (val && typeof val === 'string' && val.trim() !== '') {
              const cleanVal = val.trim().replace(/'/g, "''");
              // Проверяем наличие
              const checkSql = `SELECT id FROM app_dictionaries WHERE category = '${item.cat}' AND value = '${cleanVal}'`;
              const checkRes = await executeDbQuery(checkSql);
              
              // Если нет - вставляем
              if (!checkRes.data || checkRes.data.length === 0) {
                  const insertSql = `INSERT INTO app_dictionaries (category, value, is_active) VALUES ('${item.cat}', '${cleanVal}', true)`;
                  await executeDbQuery(insertSql);
              }
          }
      }
  };

  // --- ЛОГИКА ГЕНЕРАЦИИ ID ---
  const generateContractId = async (cityName: string): Promise<number> => {
      if (!cityName) {
          // Если город не указан, берем дефолтный диапазон (например, 90000)
          return Math.floor(Date.now() / 1000); 
      }

      const cleanCity = cityName.trim().replace(/'/g, "''");

      // 1. Ищем базовый индекс города
      let baseIndex = 0;
      const baseSql = `SELECT code FROM app_dictionaries WHERE category = 'city_base_index' AND value = '${cleanCity}'`;
      const baseRes = await executeDbQuery(baseSql);

      if (baseRes.data && baseRes.data.length > 0) {
          baseIndex = Number(baseRes.data[0].code);
      } else {
          // 2. Города нет, создаем новый индекс
          const maxSql = `SELECT MAX(code) as max_code FROM app_dictionaries WHERE category = 'city_base_index'`;
          const maxRes = await executeDbQuery(maxSql);
          const maxCode = maxRes.data && maxRes.data[0].max_code ? Number(maxRes.data[0].max_code) : 1000;
          
          baseIndex = maxCode + 1000; // Шаг 1000

          // Сохраняем привязку
          const insertBaseSql = `INSERT INTO app_dictionaries (category, value, code, is_active) VALUES ('city_base_index', '${cleanCity}', ${baseIndex}, true)`;
          await executeDbQuery(insertBaseSql);
      }

      // 3. Ищем свободный слот в диапазоне [baseIndex, baseIndex + 999]
      const rangeStart = baseIndex;
      const rangeEnd = baseIndex + 1000;
      const maxIdSql = `SELECT MAX(contract_id) as max_id FROM data_contracts WHERE contract_id >= ${rangeStart} AND contract_id < ${rangeEnd}`;
      const maxIdRes = await executeDbQuery(maxIdSql);
      
      let nextId = rangeStart + 1; // Default first ID (e.g. 8001)
      
      if (maxIdRes.data && maxIdRes.data.length > 0 && maxIdRes.data[0].max_id) {
          const currentMax = Math.floor(Number(maxIdRes.data[0].max_id));
          if (currentMax >= rangeStart) {
              nextId = currentMax + 1;
          }
      }

      return nextId;
  };

  const handleSave = async () => {
      setLoading(true);
      try {
          // 0. Обновляем справочники новыми значениями
          await updateDictionaries();

          let baseContractId = 0;

          if (isEditMode && formData.contract_id) {
              // Редактирование: оставляем старый ID
              baseContractId = Math.floor(formData.contract_id);
          } else {
              // Создание: генерируем новый ID на основе города
              baseContractId = await generateContractId(formData.city);
          }

          // 1. Parent Contract ID is now X.999 (e.g. 8001.999)
          const parentContractId = baseContractId + 0.999;
          
          // 2. Transaction Link ID is Integer X (e.g. 8001) - so they group nicely
          const transactionLinkId = baseContractId;

          const effectiveLiters = liters.length === 0 ? [{name: 'Литер 1', elevators: 0, floors: 0}] : liters;

          // 3. Clean Old Data (Full Wipe of the range X to X+1)
          if (isEditMode) {
              // Only delete if editing existing ID range. 
              // If creating new, range is supposedly empty (checked by generate logic), but safe to wipe.
              const deleteContractsSql = `DELETE FROM data_contracts WHERE contract_id >= ${baseContractId} AND contract_id < ${baseContractId + 1}`;
              await executeDbQuery(deleteContractsSql);
              
              const deleteTransactionsSql = `DELETE FROM contract_transactions WHERE contract_id >= ${baseContractId} AND contract_id < ${baseContractId + 1}`;
              await executeDbQuery(deleteTransactionsSql);
          }

          // Helper: Generate INSERT SQL
          const generateInsert = (data: Record<string, any>) => {
              const safeData = { ...data };
              delete safeData.id;
              delete safeData.created_at;
              delete safeData.updated_at;
              delete safeData.rentability_calculated;
              delete safeData.profit_per_lift_calculated;
              delete safeData.gross_profit;
              
              const keys = Object.keys(safeData);
              const cols = keys.map(k => `"${k}"`).join(', ');
              const vals = keys.map(k => {
                  const val = safeData[k];
                  if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                  if (val === undefined || val === null) return 'NULL';
                  if (typeof val === 'boolean') return val ? 'true' : 'false';
                  return val;
              }).join(', ');
              return `INSERT INTO data_contracts (${cols}) VALUES (${vals})`;
          };

          // Prepare Base Data
          const baseData = { ...formData };
          
          // Gross Profit Calculation
          if (baseData.income_total_fact !== undefined && baseData.expense_total_fact !== undefined) {
              baseData.gross_profit = Number(baseData.income_total_fact) - Number(baseData.expense_total_fact);
          }

          // --- INSERT PARENT RECORD (8001.999) ---
          const totalElevators = effectiveLiters.reduce((sum, l) => sum + Number(l.elevators || 0), 0);
          const totalFloors = effectiveLiters.reduce((sum, l) => sum + Number(l.floors || 0), 0);
          
          const parentRecord = {
              ...baseData,
              contract_id: parentContractId, // .999
              liter: '', // Empty for parent aggregation row
              elevators_count: totalElevators,
              floors_count: totalFloors,
              no_liter_breakdown: true, // Это агрегированная запись
              is_separate_liter: false,
              is_total: false
          };
          await executeDbQuery(generateInsert(parentRecord));

          // --- INSERT CHILD RECORDS (8001.001, 8001.002 ...) ---
          for (let i = 0; i < effectiveLiters.length; i++) {
              const liter = effectiveLiters[i];
              // ID format: X.001, X.002 ...
              const childId = baseContractId + (i + 1) / 1000;
              
              const childRecord = {
                  ...baseData,
                  contract_id: childId,
                  liter: liter.name,
                  elevators_count: liter.elevators,
                  floors_count: liter.floors,
                  no_liter_breakdown: false,
                  is_separate_liter: true, // Это отдельный литер
                  is_total: false
              };
              
              // Clear financials for children (kept only on parent)
              FINANCIAL_KEYWORDS.forEach(kw => {
                  Object.keys(childRecord).forEach(key => {
                      if (key.includes(kw)) (childRecord as any)[key] = 0;
                  });
              });

              await executeDbQuery(generateInsert(childRecord));
          }

          // 4. Save Transactions (Linked to Integer ID = 8001)
          for (const [type, txs] of Object.entries(transactionsMap)) {
              if (txs.length > 0) {
                  const values = txs.map(t => {
                      const val = t.value || 0;
                      const txt = (t.text || '').replace(/'/g, "''");
                      const dt = t.date || new Date().toISOString().split('T')[0];
                      return `(${transactionLinkId}, '${type}', ${val}, '${txt}', '${dt}')`;
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
