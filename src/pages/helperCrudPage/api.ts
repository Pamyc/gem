
import { executeDbQuery } from '../../utils/dbGatewayApi';
import { DEFAULT_CONFIG, ColumnDef } from './types';

// Helper to get config with specific DB
const getConfig = (dbName: string) => ({ ...DEFAULT_CONFIG, database: dbName });

export const getDatabases = async () => {
  const sql = "SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname;";
  return await executeDbQuery(sql, DEFAULT_CONFIG);
};

export const getTables = async (dbName: string) => {
  const sql = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;";
  return await executeDbQuery(sql, getConfig(dbName));
};

export const getTableSchema = async (dbName: string, tableName: string) => {
  const sql = `
    SELECT column_name, data_type, is_nullable, column_default, ordinal_position 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = '${tableName}'
    ORDER BY ordinal_position;
  `;
  return await executeDbQuery(sql, getConfig(dbName));
};

export const getTableData = async (dbName: string, tableName: string, page: number, pageSize: number) => {
  const offset = (page - 1) * pageSize;
  const sql = `SELECT * FROM "${tableName}" LIMIT ${pageSize} OFFSET ${offset};`;
  return await executeDbQuery(sql, getConfig(dbName));
};

export const getTableCount = async (dbName: string, tableName: string) => {
  const sql = `SELECT COUNT(*) as count FROM "${tableName}";`;
  return await executeDbQuery(sql, getConfig(dbName));
};

export const createTable = async (dbName: string, tableName: string, columns: ColumnDef[]) => {
  const columnsSql = columns.map(col => {
    let def = `"${col.name}" ${col.type}`;
    if (col.isPrimaryKey) def += ' PRIMARY KEY';
    if (!col.isNullable && !col.isPrimaryKey) def += ' NOT NULL';
    return def;
  }).join(', ');

  const sql = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columnsSql});`;
  return await executeDbQuery(sql, getConfig(dbName));
};

export const dropTable = async (dbName: string, tableName: string) => {
  const sql = `DROP TABLE IF EXISTS "${tableName}";`;
  return await executeDbQuery(sql, getConfig(dbName));
};

export const addColumn = async (dbName: string, tableName: string, colName: string, colType: string) => {
  const sql = `ALTER TABLE "${tableName}" ADD COLUMN "${colName}" ${colType};`;
  return await executeDbQuery(sql, getConfig(dbName));
};

export const dropColumn = async (dbName: string, tableName: string, colName: string) => {
  const sql = `ALTER TABLE "${tableName}" DROP COLUMN "${colName}";`;
  return await executeDbQuery(sql, getConfig(dbName));
};

export const insertRow = async (dbName: string, tableName: string, data: Record<string, any>) => {
  const entries = Object.entries(data).filter(([_, v]) => v !== undefined && v !== '');
  if (entries.length === 0) throw new Error("Нет данных для добавления");

  const columns = entries.map(([k]) => `"${k}"`).join(', ');
  const values = entries.map(([_, v]) => `'${String(v).replace(/'/g, "''")}'`).join(', ');

  const sql = `INSERT INTO "${tableName}" (${columns}) VALUES (${values});`;
  return await executeDbQuery(sql, getConfig(dbName));
};

export const deleteRow = async (dbName: string, tableName: string, rowId: any) => {
  const sql = `DELETE FROM "${tableName}" WHERE id = '${rowId}';`;
  return await executeDbQuery(sql, getConfig(dbName));
};
