

import { useState, useEffect } from 'react';
import { DB_MAPPING } from '../../../../contexts/DataContext';
import { EXCLUDED_FIELDS, FINANCIAL_KEYWORDS } from '../constants';
import { LiterItem, Transaction, UseContractLogicProps } from './types';
import { loadTransactionsFromDb, loadLitersFromDb, fetchDictionaryOptions, fetchContractIdByDbId } from './dataService';
import { executeSave } from './saveService';

export * from './types';

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
          fetchDictionaryOptions().then(map => setOptionsMap(map));
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
          
          // Recalculate Totals
          // Sum up components: equip + frame + install + add
          const components = ['equip', 'frame', 'install', 'add'];
          
          // Helper to get value (checking if it's the current field being updated or from existing data)
          const getVal = (key: string) => key === fieldKey ? newSum : (Number(nextData[key]) || 0);

          nextData.income_total_plan = components.reduce((sum, c) => sum + getVal(`income_${c}_plan`), 0);
          nextData.income_total_fact = components.reduce((sum, c) => sum + getVal(`income_${c}_fact`), 0);
          nextData.expense_total_plan = components.reduce((sum, c) => sum + getVal(`expense_${c}_plan`), 0);
          nextData.expense_total_fact = components.reduce((sum, c) => sum + getVal(`expense_${c}_fact`), 0);
          
          // Recalculate Gross Profit
          nextData.gross_profit = nextData.income_total_fact - nextData.expense_total_fact;
          
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
          await executeSave({
              formData,
              liters,
              transactionsMap,
              isEditMode
          });
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