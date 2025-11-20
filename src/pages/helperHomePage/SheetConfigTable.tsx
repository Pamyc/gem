import React, { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ExternalLink, Table } from 'lucide-react';
import { useDataStore, SheetConfig } from '../../contexts/DataContext';

const columnHelper = createColumnHelper<SheetConfig>();

const SheetConfigTable: React.FC = () => {
  const { sheetConfigs } = useDataStore();

  const columns = useMemo(
    () => [
      columnHelper.accessor('sheetName', {
        header: 'Название листа',
        cell: (info) => {
          const sheetName = info.getValue();
          const spreadsheetId = info.row.original.spreadsheetId;
          const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
          
          return (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-indigo-600 dark:text-violet-400 hover:text-indigo-800 dark:hover:text-violet-300 font-medium flex items-center gap-1.5 hover:underline transition-colors"
            >
              {sheetName}
              <ExternalLink size={14} />
            </a>
          );
        },
      }),
      columnHelper.accessor('key', {
        header: 'Ключ (Key)',
        cell: (info) => <span className="font-mono text-xs bg-gray-100 dark:bg-white/10 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-white/5">{info.getValue()}</span>,
      }),
      columnHelper.accessor('range', {
        header: 'Диапазон',
        cell: (info) => <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{info.getValue()}</span>,
      }),
      columnHelper.accessor('headerRows', {
        header: 'Уровни заголовков',
        cell: (info) => <div className="text-center font-bold text-gray-700 dark:text-gray-300">{String(info.getValue())}</div>,
      }),
      columnHelper.accessor('spreadsheetId', {
        header: 'Spreadsheet ID',
        cell: (info) => (
          <span 
            className="text-xs font-mono text-gray-500 dark:text-gray-500 truncate max-w-[120px] block" 
            title={info.getValue()}
          >
            {info.getValue()}
          </span>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: sheetConfigs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!sheetConfigs || sheetConfigs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#151923] p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 transition-colors">
      <div className="flex items-center gap-3 mb-6 text-gray-800 dark:text-white">
        <div className="bg-blue-100 dark:bg-blue-500/20 p-2.5 rounded-xl text-blue-700 dark:text-blue-300">
          <Table size={22} />
        </div>
        <h3 className="font-bold text-xl tracking-tight">Конфигурация таблиц</h3>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-[#0b0f19]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th 
                    key={header.id} 
                    className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-white/10"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-[#151923] divide-y divide-gray-200 dark:divide-white/5">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SheetConfigTable;