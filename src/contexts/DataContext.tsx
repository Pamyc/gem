

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { executeDbQuery } from "../utils/dbGatewayApi"

// Типы данных для разных источников
export interface SheetDataWithHeaders {
  headers: string[][] // 3 уровня заголовков
  rows: any[][] // Сырые данные
}

export interface GoogleSheetsData {
  clientGrowth?: SheetDataWithHeaders
  montag?: SheetDataWithHeaders
  all_pivot?: SheetDataWithHeaders
  ip_pivot?: SheetDataWithHeaders
  database_clientGrowth?: SheetDataWithHeaders // Новый ключ для данных из БД
}

export interface SheetConfig {
  key: string;
  spreadsheetId: string; // Для БД это будет игнорироваться или использоваться как маркер
  sheetName: string;
  range: string;
  headerRows: number;
  sourceType?: 'google' | 'database'; // Тип источника
}

// Конфигурация для разных листов
export const SHEET_CONFIGS: SheetConfig[] = [
  {
    key: "clientGrowth",
    spreadsheetId: "1S5Lm6hsLavanrDiEVfDa099iAt5NpsqUTxvlnRoTpYM",
    sheetName: "ТЕСТ Сводная",
    range: "A1:AG500",
    headerRows: 3,
    sourceType: 'google'
  },
  {
    key: "database_clientGrowth",
    spreadsheetId: "DB_SOURCE", 
    sheetName: "База Данных (PostgreSQL)",
    range: "",
    headerRows: 1, // В БД у нас плоские заголовки
    sourceType: 'database'
  },
  {
    key: "montag",
    spreadsheetId: "1S5Lm6hsLavanrDiEVfDa099iAt5NpsqUTxvlnRoTpYM",
    sheetName: "ТЕСТ Сводная (копия)",
    range: "A1:AG500",
    headerRows: 3,
    sourceType: 'google'
  },
  {
    key: "all_pivot",
    spreadsheetId: "1CMXNyVYn2i7DRj2rdm4JiYVmO6-GYMwUZTqT3QOXHMs",
    sheetName: "Сводная (общая)",
    range: "A1:BB500",
    headerRows: 3,
    sourceType: 'google'
  },
  {
    key: "ip_pivot",
    spreadsheetId: "1CMXNyVYn2i7DRj2rdm4JiYVmO6-GYMwUZTqT3QOXHMs",
    sheetName: "Сводная (по ИП)",
    range: "A1:AA500",
    headerRows: 2,
    sourceType: 'google'
  },
]

// Маппинг полей БД -> Заголовки таблицы (для совместимости с графиками)
// Экспортируем, чтобы использовать в формах редактирования
export const DB_MAPPING = [
  // --- Служебные (ID обязательно для редактирования) ---
  { db: 'id', header: 'id', type: 'number' },

  // --- Основные данные ---
  { db: 'region', header: 'Регион', type: 'string' },
  { db: 'city', header: 'Город', type: 'string' },
  { db: 'housing_complex', header: 'ЖК', type: 'string' },
  { db: 'liter', header: 'Литер', type: 'string' },
  { db: 'is_handed_over', header: 'Сдан да/нет', type: 'boolean' },
  { db: 'object_type', header: 'Тип объекта', type: 'string' },
  { db: 'client_name', header: 'Клиент', type: 'string' },
  { db: 'year', header: 'Год', type: 'number' },
  { db: 'elevators_count', header: 'Кол-во лифтов', type: 'number' },
  { db: 'floors_count', header: 'Кол-во этажей', type: 'number' },
  
  // --- Флаги ---
  { db: 'is_total', header: 'Итого (Да/Нет)', type: 'boolean' },
  { db: 'no_liter_breakdown', header: 'Без разбивки на литеры (Да/Нет)', type: 'boolean' },
  { db: 'is_separate_liter', header: 'Отдельный литер (Да/Нет)', type: 'boolean' },

  // --- Финансы (Общие) ---
  { db: 'income_total_plan', header: 'Доходы Итого (План)', type: 'number' },
  { db: 'income_total_fact', header: 'Доходы Итого (Факт)', type: 'number' },
  { db: 'expense_total_plan', header: 'Расходы Итого (План)', type: 'number' },
  { db: 'expense_total_fact', header: 'Расходы Итого (Факт)', type: 'number' },
  { db: 'gross_profit', header: 'Валовая', type: 'number' },
  
  // --- Финансы (Детализация) ---
  { db: 'income_equip_plan', header: 'Дох. Оборуд. (План)', type: 'number' },
  { db: 'income_equip_fact', header: 'Дох. Оборуд. (Факт)', type: 'number' },
  { db: 'expense_equip_plan', header: 'Расх. Оборуд. (План)', type: 'number' },
  { db: 'expense_equip_fact', header: 'Расх. Оборуд. (Факт)', type: 'number' },
  
  { db: 'income_frame_plan', header: 'Дох. Обрамл. (План)', type: 'number' },
  { db: 'income_frame_fact', header: 'Дох. Обрамл. (Факт)', type: 'number' },
  { db: 'expense_frame_plan', header: 'Расх. Обрамл. (План)', type: 'number' },
  { db: 'expense_frame_fact', header: 'Расх. Обрамл. (Факт)', type: 'number' },
  
  { db: 'income_install_plan', header: 'Дох. Монтаж (План)', type: 'number' },
  { db: 'income_install_fact', header: 'Дох. Монтаж (Факт)', type: 'number' },
  { db: 'expense_install_plan', header: 'Расх. Монтаж (План)', type: 'number' },
  { db: 'expense_install_fact', header: 'Расх. Монтаж (Факт)', type: 'number' },
  
  // New Additional fields (Replacing FOT usage)
  { db: 'income_add_plan', header: 'Доходы Доп. (План)', type: 'number' },
  { db: 'income_add_fact', header: 'Доходы Доп. (Факт)', type: 'number' },
  { db: 'expense_add_plan', header: 'Расходы Доп. (План)', type: 'number' },
  { db: 'expense_add_fact', header: 'Расходы Доп. (Факт)', type: 'number' },

  { db: 'expense_fot_fact', header: 'Расходы ФОТ', type: 'number' },

  // --- Расчетные (обычно read-only, но пусть будут в маппинге) ---
  { db: 'profit_per_lift_calculated', header: 'Прибыль с 1 лифта', type: 'number' },
  { db: 'rentability_calculated', header: 'Рентабельность', type: 'number' },

  // --- Служебные 2 ---
  { db: 'contract_id', header: 'contract_id', type: 'number' },

  // --- Аудит ---
  { db: 'created_by', header: 'Создал', type: 'string' },
  { db: 'updated_by', header: 'Обновил', type: 'string' },
  { db: 'created_at', header: 'Дата создания', type: 'string' },
  { db: 'updated_at', header: 'Дата обновления', type: 'string' },
];

export interface DataStore {
  googleSheets: GoogleSheetsData
  sheetConfigs: SheetConfig[]
  isLoading: boolean
  error: string | null
}

interface DataContextType extends DataStore {
  refreshData: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dataStore, setDataStore] = useState<DataStore>({
    googleSheets: {},
    sheetConfigs: SHEET_CONFIGS,
    isLoading: true,
    error: null,
  })

  // Загрузка данных при монтировании
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setDataStore((prev) => ({ ...prev, isLoading: true, error: null }))

      // Параллельная загрузка из Google Sheets и БД
      const [googleSheetsData, dbData] = await Promise.all([
        loadGoogleSheetsData(),
        loadDatabaseData()
      ]);

      // Объединяем результаты
      const allData = { ...googleSheetsData, ...dbData };

      setDataStore({
        googleSheets: allData,
        sheetConfigs: SHEET_CONFIGS,
        isLoading: false,
        error: null,
      })

      console.log("[App] Все данные загружены:", { allData })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ошибка загрузки данных"
      setDataStore((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      console.error("[App] Ошибка загрузки данных:", err)
    }
  }

  const loadGoogleSheetsData = async (): Promise<GoogleSheetsData> => {
    const results: GoogleSheetsData = {}

    await Promise.all(
      SHEET_CONFIGS.filter(c => c.sourceType !== 'database').map(async (config) => {
        try {
          const data = await fetchGoogleSheet(
            config.spreadsheetId,
            config.sheetName,
            config.range,
            config.headerRows || 3,
          )
          results[config.key as keyof GoogleSheetsData] = data
        } catch (err) {
          console.error(`[App] Ошибка загрузки ${config.key}:`, err)
        }
      }),
    )

    return results
  }

  const loadDatabaseData = async (): Promise<GoogleSheetsData> => {
    const results: GoogleSheetsData = {};
    
    // Находим конфиги для БД
    const dbConfigs = SHEET_CONFIGS.filter(c => c.sourceType === 'database');
    
    for (const config of dbConfigs) {
        if (config.key === 'database_clientGrowth') {
            try {
                // Запрашиваем данные из БД
                const sql = "SELECT * FROM data_contracts ORDER BY id ASC LIMIT 5000";
                const response = await executeDbQuery(sql);
                
                if (response.ok && Array.isArray(response.data)) {
                    // 1. Формируем заголовки (Header Row)
                    const headers = [DB_MAPPING.map(m => m.header)];
                    
                    // 2. Преобразуем строки объектов в массивы значений
                    const rows = response.data.map((row: any) => {
                        return DB_MAPPING.map(mapping => {
                            const val = row[mapping.db];
                            
                            // Форматирование значений под стиль Google Sheets
                            if (mapping.type === 'boolean') {
                                return val ? 'Да' : 'Нет';
                            }
                            if (mapping.type === 'number') {
                                // Превращаем null/undefined в 0 или оставляем как есть
                                return val !== null && val !== undefined ? Number(val) : 0;
                            }
                            // String
                            return val !== null && val !== undefined ? String(val) : '';
                        });
                    });

                    results[config.key as keyof GoogleSheetsData] = {
                        headers: headers,
                        rows: rows
                    };
                }
            } catch (err) {
                console.error(`[App] Ошибка загрузки БД для ${config.key}:`, err);
            }
        }
    }
    return results;
  }

  const refreshData = async () => {
    await loadAllData()
  }

  return <DataContext.Provider value={{ ...dataStore, refreshData }}>{children}</DataContext.Provider>
}

// Хук для использования данных из корзины
export function useDataStore() {
  const context = useContext(DataContext)
  if (context === undefined) {
    console.warn("[App] useDataStore вызван вне DataProvider")
    return {
      googleSheets: {},
      sheetConfigs: [],
      isLoading: true,
      error: null,
      refreshData: async () => {},
    }
  }
  return context
}

// Утилита для загрузки данных из Google Sheets
async function fetchGoogleSheet(
  spreadsheetId: string,
  sheetName: string,
  range: string,
  headerRows = 3,
): Promise<SheetDataWithHeaders> {
  // Определяем диапазоны для заголовков и данных
  const rangeMatch = range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/)
  if (!rangeMatch) {
    throw new Error(`Неверный формат диапазона: ${range}`)
  }

  const [, startCol, startRow, endCol, endRow] = rangeMatch
  const headerRange = `${startCol}${startRow}:${endCol}${Number.parseInt(startRow) + headerRows - 1}`
  const dataRange = `${startCol}${Number.parseInt(startRow) + headerRows}:${endCol}${endRow}`

  // Загружаем заголовки
  const headersData = await fetchSheetRange(spreadsheetId, sheetName, headerRange)

  // Загружаем данные
  const rowsData = await fetchSheetRange(spreadsheetId, sheetName, dataRange)

  return { headers: headersData, rows: rowsData }
}

// Вспомогательная функция для загрузки диапазона
async function fetchSheetRange(spreadsheetId: string, sheetName: string, range: string): Promise<any[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
    sheetName,
  )}&range=${range}&headers=0`

  const response = await fetch(url)
  const text = await response.text()

  // Извлекаем JSON из JSONP ответа
  let jsonString: string | null = null

  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);?$/)
  if (match) {
    jsonString = match[1]
  } else {
    const startIndex = text.indexOf("{")
    const endIndex = text.lastIndexOf("}")
    if (startIndex !== -1 && endIndex !== -1) {
      jsonString = text.substring(startIndex, endIndex + 1)
    }
  }

  if (!jsonString) {
    throw new Error("Не удалось извлечь JSON из ответа Google Sheets")
  }

  const jsonData = JSON.parse(jsonString)

  if (!jsonData.table || !jsonData.table.rows) {
    // Бывает, что таблица пустая или диапазон пустой, возвращаем пустой массив
    return []
  }

  const rows = jsonData.table.rows as Array<{ c: Array<{ v?: any; f?: any } | null> }>

  return rows.map((row) => row.c?.map((cell) => cell?.v ?? cell?.f ?? "") || [])
}
