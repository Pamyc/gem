import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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
}

export interface SheetConfig {
  key: string;
  spreadsheetId: string;
  sheetName: string;
  range: string;
  headerRows: number;
}

// Конфигурация для разных листов Google Sheets вынесена в константу
export const SHEET_CONFIGS: SheetConfig[] = [
  {
    key: "clientGrowth",
    spreadsheetId: "1S5Lm6hsLavanrDiEVfDa099iAt5NpsqUTxvlnRoTpYM",
    sheetName: "ТЕСТ Сводная",
    range: "A1:AG500",
    headerRows: 3,
  },
  {
    key: "montag",
    spreadsheetId: "1S5Lm6hsLavanrDiEVfDa099iAt5NpsqUTxvlnRoTpYM",
    sheetName: "ТЕСТ Сводная (копия)",
    range: "A1:AG500",
    headerRows: 3,
  },
  {
    key: "all_pivot",
    spreadsheetId: "1CMXNyVYn2i7DRj2rdm4JiYVmO6-GYMwUZTqT3QOXHMs",
    sheetName: "Сводная (общая)",
    range: "A1:BB500",
    headerRows: 3,
  },
  {
    key: "ip_pivot",
    spreadsheetId: "1CMXNyVYn2i7DRj2rdm4JiYVmO6-GYMwUZTqT3QOXHMs",
    sheetName: "Сводная (по ИП)",
    range: "A1:AA500",
    headerRows: 2,
  },
]

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

      // Загружаем данные из Google Sheets
      const googleSheetsData = await loadGoogleSheetsData()

      setDataStore({
        googleSheets: googleSheetsData,
        sheetConfigs: SHEET_CONFIGS,
        isLoading: false,
        error: null,
      })

      console.log("[App] Все данные загружены:", {
        googleSheets: googleSheetsData,
      })
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

    // Загружаем все листы параллельно, используя SHEET_CONFIGS
    await Promise.all(
      SHEET_CONFIGS.map(async (config) => {
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