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
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 hover:underline"
            >
              {sheetName}
              <ExternalLink size={14} />
            </a>
          );
        },
      }),
      columnHelper.accessor('key', {
        header: 'Ключ (Key)',
        cell: (info) => <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{info.getValue()}</span>,
      }),
      columnHelper.accessor('range', {
        header: 'Диапазон',
        cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
      }),
      columnHelper.accessor('headerRows', {
        header: 'Уровни заголовков',
        cell: (info) => <div className="text-center">{String(info.getValue())}</div>,
      }),
      columnHelper.accessor('spreadsheetId', {
        header: 'Spreadsheet ID',
        cell: (info) => (
          <span 
            className="text-xs truncate max-w-[150px] block" 
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
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-4 text-gray-800">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
          <Table size={20} />
        </div>
        <h3 className="font-bold text-lg">Конфигурация таблиц</h3>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th 
                    key={header.id} 
                    className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200"
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
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 text-sm whitespace-nowrap text-gray-700">
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