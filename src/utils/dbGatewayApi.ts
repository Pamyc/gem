
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

/**
 * Выполняет SQL запрос через API шлюз сервера.
 * Если передан config, сервер создаст временное подключение с этими данными.
 * Если config не передан, сервер использует свое дефолтное подключение (pool).
 */
export const executeDbQuery = async (sql: string, config?: DbConfig): Promise<DbGatewayResponse> => {
  try {
    const response = await fetch('/api/db-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
          sql,
          config 
      }),
    });
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.details || data.message || 'Unknown Server Error');
    }

    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Failed to fetch from DB Gateway');
  }
};
