
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
          text: row.text || ''
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

export const fetchDictionaryOptions = async () => {
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
    return map;
  }
  return {};
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
