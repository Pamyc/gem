
import { useState, useEffect, useCallback } from 'react';
import * as API from './api';
import { DEFAULT_CONFIG, ColumnDef, ExistingColumn } from './types';

export const useCrudLogic = () => {
  // --- Global State ---
  const [databases, setDatabases] = useState<string[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedDb, setSelectedDb] = useState<string>(DEFAULT_CONFIG.database || 'default_db');
  const [activeTable, setActiveTable] = useState<string | null>(null);
  
  const [loadingDb, setLoadingDb] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Active Table State ---
  const [tableSchema, setTableSchema] = useState<ExistingColumn[]>([]);
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingSchema, setLoadingSchema] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Accordions State
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);
  const [isDataOpen, setIsDataOpen] = useState(true);

  // Action Loading State
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddRowModalOpen, setIsAddRowModalOpen] = useState(false);

  // --- DATA FETCHING WRAPPERS ---

  const fetchDatabases = useCallback(async () => {
    setLoadingDb(true);
    setError(null);
    try {
      const res = await API.getDatabases();
      if (res.ok && res.data) {
        setDatabases(res.data.map((row: any) => row.datname));
      } else {
        throw new Error(res.error || "Failed to fetch databases");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingDb(false);
    }
  }, []);

  const fetchTables = useCallback(async (dbName: string) => {
    setLoadingTables(true);
    setTables([]); 
    setActiveTable(null);
    setError(null);
    try {
      // 1. Fetch Actual Tables
      const res = await API.getTables(dbName);
      
      // 2. Fetch Saved Order
      const savedOrder = await API.getTableOrder(dbName);

      if (res.ok && res.data) {
        const fetchedTables = res.data.map((row: any) => row.table_name);
        
        // 3. Sort logic
        let finalTables: string[] = [];
        if (savedOrder && savedOrder.length > 0) {
            // First, add tables that are in savedOrder AND in fetchedTables
            finalTables = savedOrder.filter((t: string) => fetchedTables.includes(t));
            // Then append any new tables that weren't in savedOrder
            const newTables = fetchedTables.filter((t: string) => !finalTables.includes(t));
            finalTables = [...finalTables, ...newTables];
        } else {
            finalTables = fetchedTables;
        }

        setTables(finalTables);
        if (finalTables.length > 0) setActiveTable(finalTables[0]);
      } else {
        if (res.error) setError(`Ошибка доступа к БД '${dbName}': ${res.error}`);
      }
    } catch (err: any) {
      setError(`Ошибка подключения к '${dbName}': ${err.message}`);
    } finally {
      setLoadingTables(false);
    }
  }, []);

  const fetchTableSchema = useCallback(async (tableName: string) => {
    setLoadingSchema(true);
    setTableSchema([]);
    try {
      const res = await API.getTableSchema(selectedDb, tableName);
      if (res.ok && res.data) {
        setTableSchema(res.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingSchema(false);
    }
  }, [selectedDb]);

  const fetchTableData = useCallback(async (tableName: string, p: number, size: number) => {
    setLoadingData(true);
    setTableRows([]);
    try {
      // 1. Get Rows
      const dataRes = await API.getTableData(selectedDb, tableName, p, size);
      if (dataRes.ok) {
        setTableRows(dataRes.data || []);
      } else {
        throw new Error(dataRes.error);
      }

      // 2. Get Count
      const countRes = await API.getTableCount(selectedDb, tableName);
      if (countRes.ok && countRes.data && countRes.data[0]) {
        setTotalRows(parseInt(countRes.data[0].count));
      }
    } catch (err: any) {
      setError(`Ошибка загрузки данных: ${err.message}`);
    } finally {
      setLoadingData(false);
    }
  }, [selectedDb]);

  // --- ACTIONS ---

  const handleTableReorder = async (newOrder: string[]) => {
      setTables(newOrder); // Optimistic update
      try {
          await API.saveTableOrder(selectedDb, newOrder);
      } catch (err) {
          console.error("Failed to save table order", err);
      }
  };

  const handleCreateTable = async (tableName: string, columns: ColumnDef[]) => {
    if (!tableName) return;
    setActionLoading(true);
    try {
      const res = await API.createTable(selectedDb, tableName, columns);
      if (res.ok) {
        setIsCreateModalOpen(false);
        fetchTables(selectedDb);
      } else {
        alert("Ошибка: " + res.error);
      }
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTable = async () => {
    if (!activeTable || !confirm(`Удалить таблицу "${activeTable}"? Это действие необратимо.`)) return;
    setActionLoading(true);
    try {
      await API.dropTable(selectedDb, activeTable);
      fetchTables(selectedDb);
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddColumn = async (name: string, type: string) => {
    if (!activeTable || !name) return;
    setActionLoading(true);
    try {
      await API.addColumn(selectedDb, activeTable, name, type);
      fetchTableSchema(activeTable);
      fetchTableData(activeTable, page, pageSize);
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenameColumn = async (oldName: string, newName: string) => {
    if (!activeTable || !newName || oldName === newName) return;
    setActionLoading(true);
    try {
      await API.renameColumn(selectedDb, activeTable, oldName, newName);
      await fetchTableSchema(activeTable);
      // Data might depend on column names if we filter, but basic select * is fine
      await fetchTableData(activeTable, page, pageSize);
    } catch (err: any) {
      alert("Ошибка переименования: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteColumn = async (colName: string) => {
    if (!activeTable || !confirm(`Удалить колонку "${colName}"?`)) return;
    setActionLoading(true);
    try {
      await API.dropColumn(selectedDb, activeTable, colName);
      fetchTableSchema(activeTable);
      fetchTableData(activeTable, page, pageSize);
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleInsertRow = async (data: Record<string, any>) => {
    if (!activeTable) return;
    setActionLoading(true);
    try {
      const res = await API.insertRow(selectedDb, activeTable, data);
      if (res.ok) {
        setIsAddRowModalOpen(false);
        fetchTableData(activeTable, page, pageSize);
      } else {
        alert("Ошибка вставки: " + res.error);
      }
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCell = async (rowId: any, colName: string, value: string) => {
    if (!activeTable) return;
    // Optimistic update could be done here, but for simplicity we await
    try {
      const res = await API.updateCell(selectedDb, activeTable, rowId, colName, value);
      if (res.ok) {
        // Refresh data silently (or update local state)
        fetchTableData(activeTable, page, pageSize);
      } else {
        alert("Ошибка обновления: " + res.error);
      }
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    }
  };

  const handleDeleteRow = async (rowId: any, pkName: string = 'id') => {
    if (!activeTable || !rowId || !confirm(`Удалить строку? (${pkName} = ${rowId})`)) return;
    setActionLoading(true);
    try {
      const res = await API.deleteRow(selectedDb, activeTable, rowId, pkName);
      if (res.ok) {
        fetchTableData(activeTable, page, pageSize);
        setTotalRows(prev => Math.max(0, prev - 1));
      } else {
        alert("Ошибка удаления: " + res.error);
      }
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // --- EFFECTS ---

  useEffect(() => {
    fetchDatabases();
  }, [fetchDatabases]);

  useEffect(() => {
    if (selectedDb) fetchTables(selectedDb);
  }, [selectedDb, fetchTables]);

  useEffect(() => {
    if (activeTable) {
      setPage(1);
      fetchTableSchema(activeTable);
      fetchTableData(activeTable, 1, pageSize);
    }
  }, [activeTable, fetchTableSchema, fetchTableData, pageSize]);

  // Handle page change (distinct from table change)
  useEffect(() => {
    if (activeTable && !loadingSchema) { 
        fetchTableData(activeTable, page, pageSize);
    }
  }, [page, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    databases, tables, selectedDb, activeTable,
    loadingDb, loadingTables, error,
    tableSchema, tableRows, totalRows, loadingData, loadingSchema,
    page, pageSize,
    isSchemaOpen, isDataOpen,
    actionLoading,
    isCreateModalOpen, isAddRowModalOpen,

    // Setters (for UI direct control)
    setSelectedDb, setActiveTable, setPage, setPageSize,
    setIsSchemaOpen, setIsDataOpen,
    setIsCreateModalOpen, setIsAddRowModalOpen,

    // Handlers (Actions)
    refreshDatabases: fetchDatabases,
    handleCreateTable,
    handleDeleteTable,
    handleAddColumn,
    handleRenameColumn,
    handleDeleteColumn,
    handleInsertRow,
    handleUpdateCell,
    handleDeleteRow,
    handleTableReorder
  };
};
