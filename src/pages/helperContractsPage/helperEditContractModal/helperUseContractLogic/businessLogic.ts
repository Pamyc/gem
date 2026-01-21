
import { executeDbQuery } from '../../../../utils/dbGatewayApi';

export const updateDictionaries = async (formData: Record<string, any>) => {
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

export const generateContractId = async (cityName: string): Promise<number> => {
  if (!cityName) {
      // Если город не указан, берем дефолтный диапазон
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
