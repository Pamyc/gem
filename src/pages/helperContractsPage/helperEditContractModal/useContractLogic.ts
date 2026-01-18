
import { useState, useEffect, useMemo } from 'react';
import { executeDbQuery } from '../../../utils/dbGatewayApi';
import { DB_MAPPING } from '../../../contexts/DataContext';
import { EXCLUDED_FIELDS, FINANCIAL_KEYWORDS } from './constants';

export interface LiterItem {
  id?: number;
  name: string;
  elevators: number;
  floors: number;
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

  const isEditMode = !!(nodeData && nodeData.dbId);

  // Инициализация
  useEffect(() => {
      if (isOpen) {
          if (nodeData && nodeData.fullData) {
              const data = nodeData.fullData;
              setFormData({
                  ...data,
                  elevators_count: data.elevators_count ?? 0,
                  floors_count: data.floors_count ?? 0
              });

              const isAggregatorByFlag = data.no_liter_breakdown === true || String(data.no_liter_breakdown) === 'true';
              const isSeparate = data.is_separate_liter === true || String(data.is_separate_liter) === 'true';

              if (isAggregatorByFlag && !isSeparate && data.contract_id) {
                  fetchLitersForContract(data.contract_id);
              } else {
                  setLiters([{ 
                      id: data.id,
                      name: data.liter || 'Основной', 
                      elevators: data.elevators_count || 0, 
                      floors: data.floors_count || 0 
                  }]);
              }
          } else {
              setFormData({
                  elevators_count: 0,
                  floors_count: 0,
                  no_liter_breakdown: true, 
                  is_total: false
              }); 
              setLiters([{ name: 'Литер 1', elevators: 0, floors: 0 }]);
          }
      }
  }, [nodeData, isOpen]);

  const fetchLitersForContract = async (contractId: number) => {
      try {
          setLoading(true);
          const baseId = Math.floor(contractId);
          const sql = `
            SELECT id, liter, elevators_count, floors_count 
            FROM data_contracts 
            WHERE floor(contract_id) = ${baseId} 
              AND is_separate_liter = true 
            ORDER BY contract_id ASC
          `;
          const res = await executeDbQuery(sql);
          if (res.ok && res.data && res.data.length > 0) {
              setLiters(res.data.map((r: any) => ({
                  id: r.id,
                  name: r.liter,
                  elevators: Number(r.elevators_count) || 0,
                  floors: Number(r.floors_count) || 0
              })));
          } else {
              setLiters([]);
          }
      } catch (e) {
          console.error("Error fetching liters:", e);
      } finally {
          setLoading(false);
      }
  };

  // Пересчет итогов
  useEffect(() => {
      const totalElevators = liters.reduce((sum, l) => sum + (Number(l.elevators) || 0), 0);
      const totalFloors = liters.reduce((sum, l) => sum + (Number(l.floors) || 0), 0);
      const literNames = liters.map(l => l.name).filter(Boolean).join(', ');

      setFormData(prev => ({
          ...prev,
          elevators_count: totalElevators,
          floors_count: totalFloors,
          liter: literNames
      }));
  }, [liters]);

  // Загрузка опций из единого справочника app_dictionaries
  useEffect(() => {
      const fetchOptions = async () => {
          try {
              // Один запрос вместо множества
              const sql = `
                SELECT category, value 
                FROM app_dictionaries 
                WHERE is_active = true 
                  AND category IN ('city_base_index', 'jk', 'region', 'object_type', 'client', 'year')
                ORDER BY sort_order ASC, value ASC
              `;
              
              const res = await executeDbQuery(sql);
              
              const newOptions: Record<string, string[]> = {
                  city: [],
                  housing_complex: [],
                  region: [],
                  object_type: [],
                  client_name: [],
                  year: []
              };

              if (res.ok && res.data) {
                  res.data.forEach((r: any) => {
                      const val = r.value;
                      if (!val) return;

                      // Маппинг категорий справочника на поля формы
                      switch (r.category) {
                          case 'city_base_index':
                              newOptions.city.push(val);
                              break;
                          case 'jk':
                              newOptions.housing_complex.push(val);
                              break;
                          case 'region':
                              newOptions.region.push(val);
                              break;
                          case 'object_type':
                              newOptions.object_type.push(val);
                              break;
                          case 'client':
                              newOptions.client_name.push(val);
                              break;
                          case 'year':
                              newOptions.year.push(val);
                              break;
                      }
                  });
              }

              setOptionsMap(newOptions);
          } catch (e) {
              console.error("Failed to fetch autocomplete options", e);
          }
      };

      if (isOpen) fetchOptions();
  }, [isOpen]);

  const { generalFields, financialFields } = useMemo(() => {
      const general = [];
      const financial = [];
      const hiddenFields = ['liter', 'elevators_count', 'floors_count', 'contract_id']; 

      for (const field of DB_MAPPING) {
          if (EXCLUDED_FIELDS.includes(field.db)) continue;
          if (hiddenFields.includes(field.db)) continue;

          const isFinancial = FINANCIAL_KEYWORDS.some(kw => field.db.includes(kw));
          if (isFinancial) {
              financial.push(field);
          } else {
              general.push(field);
          }
      }
      return { generalFields: general, financialFields: financial };
  }, []);

  const handleChange = (key: string, value: any) => {
      setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCurrencyChange = (fieldKey: string, symbol: string) => {
      setFieldCurrencies(prev => ({ ...prev, [fieldKey]: symbol }));
  };

  const addLiter = () => {
      const nextNum = liters.length + 1;
      setLiters([...liters, { name: `Литер ${nextNum}`, elevators: 0, floors: 0 }]);
  };

  const removeLiter = (index: number) => {
      setLiters(liters.filter((_, i) => i !== index));
  };

  const updateLiter = (index: number, field: keyof LiterItem, value: any) => {
      const newLiters = [...liters];
      newLiters[index] = { ...newLiters[index], [field]: value };
      setLiters(newLiters);
  };

  // --- SQL Generation Helpers ---
  const toSql = (val: any, type: string) => {
      if (val === undefined || val === null || val === '') return 'NULL';
      if (type === 'string') return `'${String(val).replace(/'/g, "''")}'`;
      if (type === 'boolean') return val === true || String(val).toLowerCase() === 'да' ? 'true' : 'false';
      if (type === 'number') return String(val).replace(/\s/g, '').replace(/,/g, '.');
      return `'${val}'`;
  };

  const buildInsert = (data: any) => {
      const cols: string[] = [];
      const vals: string[] = [];
      DB_MAPPING.forEach(f => {
          if (f.db === 'id' || f.db === 'created_at') return;
          if (data[f.db] !== undefined) {
              cols.push(f.db);
              vals.push(toSql(data[f.db], f.type));
          }
      });
      return `INSERT INTO data_contracts (${cols.join(', ')}) VALUES (${vals.join(', ')})`;
  };

  // --- Preview SQL Generation (Effect) ---
  useEffect(() => {
      if (!isOpen) return;

      const generatePreview = () => {
          let baseId = 0;
          let idPlaceholder = false;
          if (isEditMode && formData.contract_id) {
              baseId = Math.floor(formData.contract_id);
          } else {
              idPlaceholder = true;
              baseId = 999999; // Dummy ID for preview
          }

          const queries: string[] = [];
          if (idPlaceholder) queries.push('-- Contract ID will be generated upon save based on City');

          const isSingleLiter = liters.length === 1;
          const commonFields = { ...formData };
          commonFields.contract_id = baseId + 0.999;
          commonFields.is_total = false;
          commonFields.no_liter_breakdown = true; 
          commonFields.is_separate_liter = isSingleLiter;

          if (isEditMode && formData.id) {
              queries.push(`-- Deleting siblings for full update`);
              queries.push(`DELETE FROM data_contracts WHERE floor(contract_id) = ${baseId} AND id != ${formData.id}`);
              
              const updates: string[] = [];
              DB_MAPPING.forEach(f => {
                  if (EXCLUDED_FIELDS.includes(f.db)) return;
                  if (f.db === 'contract_id') return;
                  if (commonFields[f.db] !== undefined) {
                      updates.push(`${f.db} = ${toSql(commonFields[f.db], f.type)}`);
                  }
              });
              updates.push(`contract_id = ${baseId}.999`);
              updates.push(`no_liter_breakdown = true`);
              updates.push(`is_separate_liter = ${isSingleLiter}`);
              
              queries.push(`UPDATE data_contracts SET ${updates.join(', ')} WHERE id = ${formData.id}`);
          } else {
              queries.push(`${buildInsert(commonFields)}`);
          }

          if (!isSingleLiter) {
              liters.forEach((liter, idx) => {
                  const literData = { ...commonFields };
                  delete literData.id;
                  
                  literData.contract_id = baseId + ((idx + 1) * 0.001);
                  literData.liter = liter.name;
                  literData.elevators_count = liter.elevators;
                  literData.floors_count = liter.floors;
                  
                  literData.no_liter_breakdown = false;
                  literData.is_separate_liter = true;
                  literData.is_total = false;

                  FINANCIAL_KEYWORDS.forEach(kw => {
                      Object.keys(literData).forEach(key => {
                          if (key.includes(kw)) literData[key] = 0;
                      });
                  });

                  queries.push(`${buildInsert(literData)}`);
              });
          }
          setPreviewSql(queries.join(';\n') + ';');
      };

      generatePreview();
  }, [formData, liters, isEditMode, isOpen]);

  const handleSave = async () => {
      setLoading(true);
      try {
          // --- 1. АВТО-ДОБАВЛЕНИЕ НОВЫХ ЗНАЧЕНИЙ В СПРАВОЧНИКИ ---
          // Проверяем и добавляем: JK, Region, ObjectType, Client, Year
          const dictMappings = [
              { category: 'jk', value: formData.housing_complex },
              { category: 'region', value: formData.region },
              { category: 'object_type', value: formData.object_type },
              { category: 'client', value: formData.client_name },
              { category: 'year', value: formData.year }
          ];

          for (const mapping of dictMappings) {
              const val = mapping.value ? String(mapping.value).trim() : '';
              if (!val) continue;

              const safeVal = val.replace(/'/g, "''");

              // Проверяем, существует ли уже такое значение
              const checkRes = await executeDbQuery(`
                  SELECT id FROM app_dictionaries 
                  WHERE category = '${mapping.category}' 
                  AND value = '${safeVal}'
              `);

              if (checkRes.ok && (!checkRes.data || checkRes.data.length === 0)) {
                  // Если нет - добавляем
                  await executeDbQuery(`
                      INSERT INTO app_dictionaries (category, value, is_active, sort_order, code)
                      VALUES ('${mapping.category}', '${safeVal}', true, 0, 0)
                  `);
                  console.log(`Auto-added to dictionary: [${mapping.category}] ${val}`);
              }
          }

          // --- 2. ЛОГИКА ГЕНЕРАЦИИ ID ДОГОВОРА (ГОРОД) ---
          let baseId = 0;
          if (isEditMode && formData.contract_id) {
              baseId = Math.floor(formData.contract_id);
          }
          
          if (!baseId || baseId === 0) {
              const city = String(formData.city || '').trim();
              if (!city) throw new Error("Не указан город для генерации номера договора.");

              // Ищем существующий код города в app_dictionaries
              const cityRes = await executeDbQuery(`
                  SELECT code 
                  FROM app_dictionaries 
                  WHERE category = 'city_base_index' 
                    AND value = '${city.replace(/'/g, "''")}'
              `);
              
              let cityStartId = 0;

              if (cityRes.ok && cityRes.data && cityRes.data.length > 0) {
                  cityStartId = parseInt(cityRes.data[0].code);
              } else {
                  // Генерируем новый код для нового города
                  const maxSeriesRes = await executeDbQuery(`
                      SELECT MAX(code) as max_id 
                      FROM app_dictionaries 
                      WHERE category = 'city_base_index'
                  `);
                  
                  let maxId = 0;
                  if (maxSeriesRes.ok && maxSeriesRes.data && maxSeriesRes.data[0] && maxSeriesRes.data[0].max_id) {
                      maxId = parseInt(maxSeriesRes.data[0].max_id);
                  }
                  
                  // Базовый старт 1001, шаг 1000
                  cityStartId = maxId > 0 ? maxId + 1000 : 1001;
                  
                  // Сохраняем новый город в справочник
                  await executeDbQuery(`
                      INSERT INTO app_dictionaries (category, value, code) 
                      VALUES ('city_base_index', '${city.replace(/'/g, "''")}', ${cityStartId})
                  `);
              }

              // Ищем свободный contract_id в диапазоне города
              const nextSeriesStart = cityStartId + 1000;
              const maxContractRes = await executeDbQuery(`
                  SELECT MAX(FLOOR(contract_id)) as max_c 
                  FROM data_contracts 
                  WHERE contract_id >= ${cityStartId} AND contract_id < ${nextSeriesStart}
              `);

              let lastContractId = 0;
              if (maxContractRes.ok && maxContractRes.data && maxContractRes.data[0] && maxContractRes.data[0].max_c) {
                  lastContractId = parseInt(maxContractRes.data[0].max_c);
              }

              baseId = lastContractId > 0 ? lastContractId + 1 : cityStartId;
          }

          // --- 3. ПОДГОТОВКА ДАННЫХ ДОГОВОРА ---
          const isSingleLiter = liters.length === 1;
          const commonFields = { ...formData };
          commonFields.contract_id = baseId + 0.999;
          commonFields.is_total = false;
          commonFields.no_liter_breakdown = true; 
          commonFields.is_separate_liter = isSingleLiter;

          const queries: string[] = [];

          if (isEditMode && formData.id) {
              queries.push(`DELETE FROM data_contracts WHERE floor(contract_id) = ${baseId} AND id != ${formData.id}`);
          }

          if (isEditMode && formData.id) {
              const updates: string[] = [];
              DB_MAPPING.forEach(f => {
                  if (EXCLUDED_FIELDS.includes(f.db)) return;
                  if (f.db === 'contract_id') return;
                  if (commonFields[f.db] !== undefined) {
                      updates.push(`${f.db} = ${toSql(commonFields[f.db], f.type)}`);
                  }
              });
              updates.push(`contract_id = ${baseId}.999`);
              updates.push(`no_liter_breakdown = true`);
              updates.push(`is_separate_liter = ${isSingleLiter}`);
              
              queries.push(`UPDATE data_contracts SET ${updates.join(', ')} WHERE id = ${formData.id}`);
          } else {
              queries.push(`${buildInsert(commonFields)}`);
          }

          if (!isSingleLiter) {
              liters.forEach((liter, idx) => {
                  const literData = { ...commonFields };
                  delete literData.id;
                  
                  literData.contract_id = baseId + ((idx + 1) * 0.001);
                  literData.liter = liter.name;
                  literData.elevators_count = liter.elevators;
                  literData.floors_count = liter.floors;
                  
                  literData.no_liter_breakdown = false;
                  literData.is_separate_liter = true;
                  literData.is_total = false;

                  FINANCIAL_KEYWORDS.forEach(kw => {
                      Object.keys(literData).forEach(key => {
                          if (key.includes(kw)) literData[key] = 0;
                      });
                  });

                  queries.push(`${buildInsert(literData)}`);
              });
          }

          // --- 4. ВЫПОЛНЕНИЕ ЗАПРОСОВ ---
          for (const query of queries) {
              await executeDbQuery(query);
          }

          onSuccess();
          onClose();
      } catch (e: any) {
          alert("Ошибка сохранения: " + e.message);
      } finally {
          setLoading(false);
      }
  };

  return {
    formData,
    loading,
    liters,
    fieldCurrencies,
    optionsMap,
    generalFields,
    financialFields,
    isEditMode,
    previewSql,
    handleChange,
    handleCurrencyChange,
    addLiter,
    removeLiter,
    updateLiter,
    handleSave
  };
};
