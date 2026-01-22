
import { useState, useEffect, useCallback } from 'react';
import { DB_MAPPING } from '../../../../contexts/DataContext';
import { EXCLUDED_FIELDS, FINANCIAL_KEYWORDS } from '../constants';
import { LiterItem, Transaction, UseContractLogicProps } from './types';
import { loadTransactionsFromDb, loadLitersFromDb, fetchExistingContractData, fetchContractIdByDbId } from './dataService';
import { executeSave } from './saveService';

export * from './types';

export const useContractLogic = ({ isOpen, nodeData, onSuccess, onClose, user }: UseContractLogicProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [liters, setLiters] = useState<LiterItem[]>([
      { name: 'Литер 1', elevators: 0, floors: 0 }
  ]);
  const [fieldCurrencies, setFieldCurrencies] = useState<Record<string, string>>({});
  const [previewSql, setPreviewSql] = useState<string>('');
  
  // Состояние для отображения ошибок валидации
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Состояние "Грязная форма"
  const [isDirty, setIsDirty] = useState(false);

  // "Сырые" данные всех контрактов для построения динамических фильтров
  const [contractRows, setContractRows] = useState<any[]>([]);

  // Хранилище транзакций
  const [transactionsMap, setTransactionsMap] = useState<Record<string, Transaction[]>>({});

  const isEditMode = !!(nodeData && nodeData.dbId);

  // Инициализация
  useEffect(() => {
      if (isOpen) {
          setTransactionsMap({}); // Сброс
          setShowValidationErrors(false); // Сброс ошибок
          setIsDirty(false); // Сброс флага изменений

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
                      cid = await fetchContractIdByDbId(data.id);
                      if (cid) {
                          setFormData(prev => ({ ...prev, contract_id: cid }));
                      }
                  }

                  if (cid) {
                      const txData = await loadTransactionsFromDb(cid);
                      if (txData) {
                          setTransactionsMap(txData.grouped);
                          setFormData(prev => ({ ...prev, ...txData.updates }));
                      }
                      
                      const litersData = await loadLitersFromDb(cid);
                      if (litersData.length > 0) setLiters(litersData);
                      else setLiters([]);
                  } else {
                      setLiters([]);
                  }
              } else {
                  // Новый договор (Режим создания)
                  setFormData({
                      city: '',
                      housing_complex: '',
                      is_handed_over: false,
                      contract_id: 0, 
                      year: new Date().getFullYear(),
                      elevators_count: 0,
                      floors_count: 0
                  });
                  setLiters([{ name: 'Литер 1', elevators: 0, floors: 0 }]);
              }
          };

          initData();
          
          // Загрузка "живых" данных для фильтров вместо словарей
          fetchExistingContractData().then(rows => setContractRows(rows));
      }
  }, [isOpen, nodeData]);

  // Защита от закрытия вкладки при несохраненных данных
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Стандартное требование браузеров
      }
    };

    if (isOpen) {
        window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, isOpen]);

  const handleChange = (key: string, value: any) => {
      setFormData(prev => ({ ...prev, [key]: value }));
      setIsDirty(true);
  };

  // --- Логика умной фильтрации (Cascading) ---
  // Поля, которые участвуют в зависимостях
  const dependencyFields = ['region', 'city', 'housing_complex', 'client_name', 'object_type'];

  const getFilteredOptions = useCallback((targetField: string): string[] => {
      if (!contractRows.length || !dependencyFields.includes(targetField)) return [];

      // --- НОВОЕ: Исключение для Клиента и Типа объекта ---
      // Если запрашиваем список для этих полей, игнорируем фильтры (показываем всё, что есть в базе)
      if (targetField === 'client_name' || targetField === 'object_type') {
          const allValues = new Set<string>();
          contractRows.forEach(row => {
              const val = row[targetField];
              if (val && typeof val === 'string' && val.trim() !== '') {
                  allValues.add(val.trim());
              }
          });
          return Array.from(allValues).sort();
      }
      // -----------------------------------------------------
      
      // Фильтруем строки, совпадающие с текущим выбором в форме (кроме самого целевого поля)
      const matches = contractRows.filter(row => {
          for (const key of dependencyFields) {
              // Пропускаем само поле, для которого ищем опции (чтобы не сузить выбор до самого себя)
              if (key === targetField) continue;
              
              const formValue = formData[key];
              const rowValue = row[key];

              // Если в форме значение выбрано, оно должно совпадать со строкой в данных
              if (formValue && typeof formValue === 'string' && formValue.trim() !== '') {
                  // Сравниваем мягко (trim)
                  if (!rowValue || String(rowValue).trim() !== String(formValue).trim()) {
                      return false;
                  }
              }
          }
          return true;
      });

      // Извлекаем уникальные значения для целевого поля
      const uniqueValues = new Set<string>();
      matches.forEach(row => {
          const val = row[targetField];
          if (val && typeof val === 'string' && val.trim() !== '') {
              uniqueValues.add(val.trim());
          }
      });

      return Array.from(uniqueValues).sort();
  }, [contractRows, formData]);

  const handleTransactionChange = (fieldKey: string, newTransactions: Transaction[]) => {
      setIsDirty(true);
      setTransactionsMap(prev => ({
          ...prev,
          [fieldKey]: newTransactions
      }));
      
      const newSum = newTransactions.reduce((acc, t) => acc + (Number(t.value) || 0), 0);
      
      setFormData(prev => {
          const nextData = { ...prev, [fieldKey]: newSum };
          
          // Recalculate Totals
          const components = ['equip', 'frame', 'install', 'add'];
          
          const getVal = (key: string) => key === fieldKey ? newSum : (Number(nextData[key]) || 0);

          nextData.income_total_plan = components.reduce((sum, c) => sum + getVal(`income_${c}_plan`), 0);
          nextData.income_total_fact = components.reduce((sum, c) => sum + getVal(`income_${c}_fact`), 0);
          nextData.expense_total_plan = components.reduce((sum, c) => sum + getVal(`expense_${c}_plan`), 0);
          nextData.expense_total_fact = components.reduce((sum, c) => sum + getVal(`expense_${c}_fact`), 0);
          
          nextData.gross_profit = nextData.income_total_fact - nextData.expense_total_fact;
          
          return nextData;
      });
  };

  const handleCurrencyChange = (key: string, value: string) => {
      setFieldCurrencies(prev => ({ ...prev, [key]: value }));
      setIsDirty(true);
  };

  const addLiter = () => {
      setLiters([...liters, { name: `Литер ${liters.length + 1}`, elevators: 0, floors: 0 }]);
      setIsDirty(true);
  };
  const removeLiter = (idx: number) => {
      setLiters(liters.filter((_, i) => i !== idx));
      setIsDirty(true);
  };
  const updateLiter = (idx: number, field: keyof LiterItem, value: any) => {
      const newLiters = [...liters];
      newLiters[idx] = { ...newLiters[idx], [field]: value };
      setLiters(newLiters);
      setIsDirty(true);
      
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
      setShowValidationErrors(true);

      // --- ВАЛИДАЦИЯ ОБЯЗАТЕЛЬНЫХ ПОЛЕЙ ---
      const requiredFields = [
          { key: 'region', label: 'Регион' },
          { key: 'city', label: 'Город' },
          { key: 'housing_complex', label: 'ЖК' },
          { key: 'liter', label: 'Литер' },
          { key: 'object_type', label: 'Тип объекта' },
          { key: 'client_name', label: 'Клиент' },
          { key: 'year', label: 'Год' }
      ];

      const missing = requiredFields.filter(f => !formData[f.key] || String(formData[f.key]).trim() === '');
      
      if (missing.length > 0) {
          alert(`Пожалуйста, заполните обязательные поля:\n- ${missing.map(f => f.label).join('\n- ')}`);
          return;
      }

      if (!liters || liters.length === 0 || liters.some(l => !l.name.trim())) {
          alert('Добавьте хотя бы один литер с названием.');
          return;
      }
      // -------------------------------------
      
      setLoading(true);
      try {
          await executeSave({
              formData,
              liters,
              transactionsMap,
              isEditMode,
              username: user?.username || user?.name || 'Unknown'
          });
          
          setIsDirty(false); // Сбрасываем флаг перед закрытием
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
      'is_separate_liter',
      'created_by', 'updated_by', 'created_at', 'updated_at' // Exclude from general input generation
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
    optionsMap: {}, 
    getFilteredOptions, 
    generalFields,
    isEditMode,
    previewSql,
    transactionsMap,
    showValidationErrors, 
    isDirty, // Экспортируем флаг
    handleChange,
    handleTransactionChange,
    handleCurrencyChange,
    addLiter,
    removeLiter,
    updateLiter,
    handleSave
  };
};
