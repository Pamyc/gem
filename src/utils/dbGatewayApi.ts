
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


/**
 * Выполняет SQL запрос через Google Apps Script Proxy.
 * GAS пересылает запрос на https://pamyc-gem-4cd1.twc1.net/api/db-test
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

    // 2. Формирование тела запроса для GAS Proxy -> Node Server
    // Node server (server.js) ожидает { sql: string, config: object } в body
    const payload = {
        sql: sql,
        config: pgConfig
    };

    // 3. Отправка запроса на Google Apps Script
    // Используем 'text/plain' чтобы избежать CORS preflight OPTIONS запроса к Google (лайфхак для GAS)
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    const jsonResponse = await response.json();

    // 4. Проверка на ошибки (от GAS или от конечного сервера)
    if (jsonResponse.ok === false || jsonResponse.error) {
        throw new Error(jsonResponse.error || 'Proxy Error');
    }

    // 5. Возвращаем ответ как есть (структура уже совпадает с тем, что отдает server.js)
    return jsonResponse;

  } catch (err: any) {
    console.error("GAS Proxy Error:", err);
    throw new Error(err.message || 'Failed to fetch via GAS Proxy');
  }
};
