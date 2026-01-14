
import { DbConfig } from '../../utils/dbGatewayApi';

// Конфигурация подключения по умолчанию
export const DEFAULT_CONFIG: DbConfig = {
  host: '192.168.0.4',
  port: '5432',
  database: 'default_db',
  user: 'gen_user',
  password: '@gemdb@gemdb'
};

export const PAGE_SIZES = [20, 50, 100, 500];

// Интерфейсы
export interface ColumnDef {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isNullable: boolean;
}

export interface ExistingColumn {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  ordinal_position: number;
}
