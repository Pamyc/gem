
import { useMemo } from 'react';
import { useDataStore, DB_MAPPING } from '../../../contexts/DataContext';
import { getMergedHeaders } from '../../../utils/chartUtils';
import { CityNode, LiterNode } from './types';

export const useContractsData = () => {
  const { googleSheets, sheetConfigs, isLoading } = useDataStore();

  const data = useMemo<CityNode[]>(() => {
    const sheetKey = 'database_clientGrowth';
    const sheetData = googleSheets[sheetKey];

    if (!sheetData || !sheetData.headers || !sheetData.rows || sheetData.rows.length === 0) {
      return [];
    }

    const config = sheetConfigs.find(c => c.key === sheetKey);
    const headerRowsCount = config?.headerRows || 1;
    const headers = getMergedHeaders(sheetData.headers, headerRowsCount);

    // Indices for critical structure
    const idxId = headers.indexOf('id');
    const idxCity = headers.indexOf('Город');
    const idxJK = headers.indexOf('ЖК');
    const idxLiter = headers.indexOf('Литер');
    const idxElevators = headers.indexOf('Кол-во лифтов');
    const idxFloors = headers.indexOf('Кол-во этажей');
    const idxNoBreakdown = headers.indexOf('Без разбивки на литеры (Да/Нет)');
    const idxSeparateLiter = headers.indexOf('Отдельный литер (Да/Нет)');
    const idxTotal = headers.indexOf('Итого (Да/Нет)');
    const idxContractId = headers.indexOf('contract_id');

    if (idxCity === -1 || idxJK === -1) return [];

    const getNum = (row: any[], idx: number) => {
        if (idx === -1) return 0;
        return parseFloat(String(row[idx]).replace(',', '.')) || 0;
    };

    const cityMap = new Map<string, CityNode>();

    sheetData.rows.forEach((row) => {
        if (idxTotal !== -1 && String(row[idxTotal]).toLowerCase() === 'да') return;

        const city = String(row[idxCity]).trim();
        const jk = String(row[idxJK]).trim();
        const literRaw = idxLiter !== -1 ? String(row[idxLiter]).trim() : '';
        const elevators = getNum(row, idxElevators);
        const floors = getNum(row, idxFloors);
        const id = getNum(row, idxId);
        const contractId = getNum(row, idxContractId);
        
        const isNoBreakdown = idxNoBreakdown !== -1 && String(row[idxNoBreakdown]).toLowerCase() === 'да';
        const isSeparateLiter = idxSeparateLiter !== -1 && String(row[idxSeparateLiter]).toLowerCase() === 'да';
        
        const literName = literRaw || (isNoBreakdown ? 'Общий итог (без разбивки)' : 'Без литера');

        if (!city || !jk) return;

        const isContract = isNoBreakdown;
        const isLiterCount = isSeparateLiter;

        const fullRowData: Record<string, any> = {};
        DB_MAPPING.forEach(mapItem => {
            const idx = headers.indexOf(mapItem.header);
            if (idx !== -1) {
                fullRowData[mapItem.db] = row[idx];
            }
        });
        fullRowData['id'] = id;

        // 1. City Level
        if (!cityMap.has(city)) {
            cityMap.set(city, {
                name: city,
                totalElevators: 0,
                totalFloors: 0,
                totalContracts: 0,
                totalLiters: 0,
                jks: []
            });
        }
        const cityNode = cityMap.get(city)!;
        
        // Sum only separate liters to avoid double counting with aggregates
        if (isSeparateLiter) {
            cityNode.totalElevators += elevators;
            cityNode.totalFloors += floors;
        }
        
        if (isContract) cityNode.totalContracts += 1;
        if (isLiterCount) cityNode.totalLiters += 1;

        // 2. JK Level
        let jkNode = cityNode.jks.find(j => j.name === jk);
        if (!jkNode) {
            jkNode = {
                name: jk,
                totalElevators: 0,
                totalFloors: 0,
                totalContracts: 0,
                totalLiters: 0,
                liters: []
            };
            cityNode.jks.push(jkNode);
        }
        
        // Sum only separate liters
        if (isSeparateLiter) {
            jkNode.totalElevators += elevators;
            jkNode.totalFloors += floors;
        }
        
        if (isContract) jkNode.totalContracts += 1;
        if (isLiterCount) jkNode.totalLiters += 1;

        // 3. Liter Level (Row for List View)
        jkNode.liters.push({
            id,
            name: literName,
            elevators,
            floors,
            isAggregate: isNoBreakdown,
            contractId,
            children: [],
            fullData: fullRowData 
        });
    });

    // 4. Post-processing: Grouping by Contract ID within JKs
    cityMap.forEach(cityNode => {
        cityNode.jks.forEach(jkNode => {
            const rawLiters = jkNode.liters;
            const groupedLiters: LiterNode[] = [];
            const contractGroups = new Map<number, { parent: LiterNode | null, children: LiterNode[] }>();

            rawLiters.forEach(liter => {
                if (liter.contractId > 0) {
                    const groupId = Math.floor(liter.contractId);
                    if (!contractGroups.has(groupId)) {
                        contractGroups.set(groupId, { parent: null, children: [] });
                    }
                    const group = contractGroups.get(groupId)!;
                    
                    const decimalPart = Math.round((liter.contractId - groupId) * 1000);
                    
                    if (decimalPart === 999) {
                        group.parent = liter;
                    } else {
                        group.children.push(liter);
                    }
                } else {
                    groupedLiters.push(liter);
                }
            });

            contractGroups.forEach((group) => {
                if (group.parent) {
                    group.parent.children = group.children.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
                    groupedLiters.push(group.parent);
                } else {
                    group.children.forEach(child => groupedLiters.push(child));
                }
            });

            groupedLiters.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
            
            jkNode.liters = groupedLiters;
        });
    });

    const result = Array.from(cityMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    
    result.forEach(city => {
        city.jks.sort((a, b) => a.name.localeCompare(b.name));
    });

    return result;
  }, [googleSheets, sheetConfigs]);

  return { data, isLoading };
};
