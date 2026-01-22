
import { executeDbQuery } from '../../../../utils/dbGatewayApi';
import { Transaction, LiterItem } from './types';

export const loadTransactionsFromDb = async (contractId: number) => {
  if (!contractId) return null;
  try {
    const baseId = Math.floor(contractId);
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
          text: row.text || '',
          subcategory: row.subcategory || '',
          createdBy: row.created_by || '',
          updatedBy: row.updated_by || '',
          createdAt: row.created_at || '',
          updatedAt: row.updated_at || ''
        });
      });
      
      // Calculate sums to update form data
      const updates: Record<string, number> = {};
      Object.keys(grouped).forEach(key => {
        updates[key] = grouped[key].reduce((sum, t) => sum + t.value, 0);
      });

      return { grouped, updates };
    }
  } catch (e) {
    console.error("Error loading transactions:", e);
  }
  return null;
};

export const loadLitersFromDb = async (contractId: number): Promise<LiterItem[]> => {
  if (!contractId) return [];
  try {
    const baseId = Math.floor(contractId);
    let sql = `SELECT id, liter, elevators_count, floors_count FROM data_contracts WHERE contract_id >= ${baseId} AND contract_id < ${baseId + 1} AND is_separate_liter = true`;
    sql += ` ORDER BY id ASC`;

    const res = await executeDbQuery(sql);
    
    if (res.ok && res.data && res.data.length > 0) {
      return res.data.map((row: any) => ({
        id: row.id,
        name: row.liter || 'Без названия',
        elevators: Number(row.elevators_count) || 0,
        floors: Number(row.floors_count) || 0
      }));
    }
  } catch (e) {
    console.error("Error loading liters:", e);
  }
  return [];
};

// Загрузка уникальных комбинаций данных для живых фильтров
export const fetchExistingContractData = async () => {
  // Выбираем только те поля, которые участвуют в автодополнении
  const sql = `
    SELECT DISTINCT 
      region, 
      city, 
      housing_complex, 
      client_name, 
      object_type 
    FROM data_contracts
    WHERE no_liter_breakdown = false
  `;
  
  const res = await executeDbQuery(sql);
  
  if (res.ok && res.data) {
    return res.data;
  }
  return [];
};

// Получение списка существующих подкатегорий для конкретного типа транзакции
export const fetchSubcategories = async (transactionType: string): Promise<string[]> => {
    if (!transactionType) return [];
    try {
        const sql = `SELECT DISTINCT subcategory FROM contract_transactions WHERE type = '${transactionType}' AND subcategory IS NOT NULL AND subcategory != '' ORDER BY subcategory ASC LIMIT 50`;
        const res = await executeDbQuery(sql);
        if (res.ok && res.data) {
            return res.data.map((r: any) => r.subcategory);
        }
    } catch (e) {
        console.error("Error fetching subcategories:", e);
    }
    return [];
};

export const fetchContractIdByDbId = async (dbId: number) => {
    try {
        const res = await executeDbQuery(`SELECT contract_id FROM data_contracts WHERE id = ${dbId}`);
        if (res.ok && res.data && res.data.length > 0) {
            return res.data[0].contract_id;
        }
    } catch (e) {
        console.error("Failed to fetch fresh contract_id", e);
    }
    return null;
};
