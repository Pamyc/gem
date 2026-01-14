
export interface DbConfig {
  host?: string;
  port?: string | number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
}

export interface DbGatewayResponse {
  status: 'success' | 'error';
  message: string;
  executedSql?: string;
  duration?: string;
  result?: any;
  details?: string;
}

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzCjczxYLar98d1mjJfEKHt2BbDcqLWgra6AUPkEe_AZ_mVUVKqk7F5sdzxCLVHWqQk/exec';
const INTERNAL_DOMAIN = 'pamyc-gem-4cd1.twc1.net';

export const isInternalNetwork = (): boolean => {
  try {
    return window.location.hostname === INTERNAL_DOMAIN;
  } catch (e) {
    return false;
  }
};

/**
 * Выполняет SQL запрос.
 * Если мы на целевом домене, запрос идет напрямую на /api/db-test.
 * Если нет (локально или другой домен), запрос идет через Google Apps Script Proxy.
 */
export const executeDbQuery = async (sql: string, config?: DbConfig): Promise<any> => {
  try {
    // 1. Маппинг конфигурации под формат Node.js сервера (pg)
    // GAS просто перешлет этот объект
    const pgConfig = config ? {
        host: config.host,
        port: config.port,
        database: config.database, // Node.js (pg) ждет 'database', не 'dbName'
        user: config.user,         // Node.js (pg) ждет 'user'
        password: config.password,
        ssl: config.ssl
    } : {};

    // 2. Формирование тела запроса
    // Node server (server.js) ожидает { sql: string, config: object } в body
    const payload = {
        sql: sql,
        config: pgConfig
    };

    // 3. Выбор транспорта (Прямой или GAS)
    const isInternal = isInternalNetwork();
    const url = isInternal ? '/api/db-test' : GAS_URL;
    
    const fetchOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(payload)
    };

    // Если запрос прямой (Express), нужен заголовок JSON.
    // Если запрос на GAS, заголовки не ставим, чтобы избежать CORS Preflight (OPTIONS).
    if (isInternal) {
        fetchOptions.headers = { 'Content-Type': 'application/json' };
    }

    const response = await fetch(url, fetchOptions);
    
    const jsonResponse = await response.json();

    // 4. Проверка на ошибки (от GAS или от конечного сервера)
    if (jsonResponse.ok === false || jsonResponse.error) {
        throw new Error(jsonResponse.error || 'Request Error');
    }

    // 5. Возвращаем ответ как есть
    return jsonResponse;

  } catch (err: any) {
    console.error("DB Query Error:", err);
    throw new Error(err.message || 'Failed to fetch');
  }
};
