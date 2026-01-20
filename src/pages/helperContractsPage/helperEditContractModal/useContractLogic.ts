
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
          
          // Обновленная логика:
          // 1. Ищем по диапазону ID группы.
          // 2. Фильтруем только записи, являющиеся литерами (is_separate_liter = true).
          // 3. НЕ исключаем текущую запись (currentRecordId), чтобы одиночный литер тоже был в списке.
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
          // 1. Calculate Base ID
          let baseContractId = Math.floor(formData.contract_id || 0);
          if (baseContractId === 0) {
              baseContractId = Math.floor(Date.now() / 1000);
          }

          // 2. Determine Scenario
          // If liters array is empty (unlikely but safe check), treat as 1 dummy
          const effectiveLiters = liters.length === 0 ? [{name: 'Литер 1', elevators: 0, floors: 0}] : liters;
          const litersCount = effectiveLiters.length;
          const isSingle = litersCount === 1;

          // 3. Define Main Contract ID
          // Single (Scenario A): Integer X
          // Group (Scenario B): X.999
          const mainContractId = isSingle ? baseContractId : (baseContractId + 0.999);

          // 4. Clear Old Data (Full Wipe of the range)
          const deleteContractsSql = `DELETE FROM data_contracts WHERE contract_id >= ${baseContractId} AND contract_id < ${baseContractId + 1}`;
          const deleteTransactionsSql = `DELETE FROM contract_transactions WHERE contract_id >= ${baseContractId} AND contract_id < ${baseContractId + 1}`;
          
          await executeDbQuery(deleteContractsSql);
          await executeDbQuery(deleteTransactionsSql);

          // 5. Insert New Records
          
          // Helper: Generate INSERT SQL
          const generateInsert = (data: Record<string, any>) => {
              // Exclude read-only/generated fields
              const safeData = { ...data };
              delete safeData.id;
              delete safeData.created_at;
              delete safeData.updated_at;
              delete safeData.rentability_calculated;
              delete safeData.profit_per_lift_calculated;
              delete safeData.gross_profit; // Can be recalculated by DB, or we pass it if we trust frontend calc
              
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

          // Prepare Base Data (Common fields)
          const baseData = { ...formData };
          
          // Ensure gross_profit is consistent if we decide to save it explicitly
          if (baseData.income_total_fact !== undefined && baseData.expense_total_fact !== undefined) {
              baseData.gross_profit = Number(baseData.income_total_fact) - Number(baseData.expense_total_fact);
          }

          if (isSingle) {
              // --- SCENARIO A: Single Contract ---
              const liter = effectiveLiters[0];
              const record = {
                  ...baseData,
                  contract_id: mainContractId,
                  liter: liter.name,
                  elevators_count: liter.elevators,
                  floors_count: liter.floors,
                  no_liter_breakdown: true,
                  is_separate_liter: true,
                  is_total: false
              };
              await executeDbQuery(generateInsert(record));
          } else {
              // --- SCENARIO B: Group Contract ---
              
              // Step 1: Parent (Aggregator)
              const totalElevators = effectiveLiters.reduce((sum, l) => sum + Number(l.elevators || 0), 0);
              const totalFloors = effectiveLiters.reduce((sum, l) => sum + Number(l.floors || 0), 0);
              
              const parentRecord = {
                  ...baseData,
                  contract_id: mainContractId,
                  liter: '', // Empty for parent
                  elevators_count: totalElevators,
                  floors_count: totalFloors,
                  no_liter_breakdown: true,
                  is_separate_liter: false,
                  is_total: false
              };
              await executeDbQuery(generateInsert(parentRecord));

              // Step 2: Children (Liters)
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
                      is_separate_liter: true,
                      is_total: false
                  };
                  
                  // Clear financials for children (they are on parent)
                  FINANCIAL_KEYWORDS.forEach(kw => {
                      Object.keys(childRecord).forEach(key => {
                          if (key.includes(kw)) (childRecord as any)[key] = 0;
                      });
                  });

                  await executeDbQuery(generateInsert(childRecord));
              }
          }

          // 6. Save Transactions (Linked to MAIN Contract ID)
          for (const [type, txs] of Object.entries(transactionsMap)) {
              if (txs.length > 0) {
                  const values = txs.map(t => {
                      const val = t.value || 0;
                      const txt = (t.text || '').replace(/'/g, "''");
                      const dt = t.date || new Date().toISOString().split('T')[0];
                      return `(${mainContractId}, '${type}', ${val}, '${txt}', '${dt}')`;
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
