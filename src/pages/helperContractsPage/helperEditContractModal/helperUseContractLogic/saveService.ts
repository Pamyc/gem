
import { executeDbQuery } from '../../../../utils/dbGatewayApi';
import { FINANCIAL_KEYWORDS } from '../constants';
import { LiterItem, Transaction } from './types';
import { generateContractId } from './businessLogic';

interface ExecuteSaveParams {
    formData: Record<string, any>;
    liters: LiterItem[];
    transactionsMap: Record<string, Transaction[]>;
    isEditMode: boolean;
}

export const executeSave = async ({ formData, liters, transactionsMap, isEditMode }: ExecuteSaveParams) => {
    // 0. Справочники больше не обновляем (только индексы городов внутри generateContractId при необходимости)

    let baseContractId = 0;

    if (isEditMode && formData.contract_id) {
        // Редактирование: оставляем старый ID
        baseContractId = Math.floor(formData.contract_id);
    } else {
        // Создание: генерируем новый ID на основе города
        baseContractId = await generateContractId(formData.city);
    }

    // 1. Parent Contract ID is now X.999 (e.g. 8001.999)
    const parentContractId = baseContractId + 0.999;
    
    // 2. Transaction Link ID is Integer X (e.g. 8001) - so they group nicely
    const transactionLinkId = baseContractId;

    const effectiveLiters = liters.length === 0 ? [{name: 'Литер 1', elevators: 0, floors: 0}] : liters;

    // 3. Clean Old Data (Full Wipe of the range X to X+1)
    if (isEditMode) {
        // Only delete if editing existing ID range. 
        const deleteContractsSql = `DELETE FROM data_contracts WHERE contract_id >= ${baseContractId} AND contract_id < ${baseContractId + 1}`;
        await executeDbQuery(deleteContractsSql);
        
        const deleteTransactionsSql = `DELETE FROM contract_transactions WHERE contract_id >= ${baseContractId} AND contract_id < ${baseContractId + 1}`;
        await executeDbQuery(deleteTransactionsSql);
    }

    // Helper: Generate INSERT SQL
    const generateInsert = (data: Record<string, any>) => {
        const safeData = { ...data };
        // Cleanup generated/meta fields
        delete safeData.id;
        delete safeData.created_at;
        delete safeData.updated_at;
        delete safeData.rentability_calculated;
        delete safeData.profit_per_lift_calculated;
        delete safeData.gross_profit; // It will be recalculated in baseData if needed or passed explicitly
        
        const keys = Object.keys(safeData);
        const cols = keys.map(k => `"${k}"`).join(', ');
        const vals = keys.map(k => {
            const val = safeData[k];
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (val === undefined || val === null) return 'NULL';
            if (typeof val === 'boolean') return val ? 'true' : 'false';
            return val;
        }).join(', ');
        return `INSERT INTO data_contracts (${cols}) VALUES (${vals})`;
    };

    // Prepare Base Data
    const baseData = { ...formData };
    
    // Gross Profit Calculation
    if (baseData.income_total_fact !== undefined && baseData.expense_total_fact !== undefined) {
        baseData.gross_profit = Number(baseData.income_total_fact) - Number(baseData.expense_total_fact);
    }

    // --- INSERT PARENT RECORD (8001.999) ---
    const totalElevators = effectiveLiters.reduce((sum, l) => sum + Number(l.elevators || 0), 0);
    const totalFloors = effectiveLiters.reduce((sum, l) => sum + Number(l.floors || 0), 0);
    
    const parentRecord = {
        ...baseData,
        contract_id: parentContractId, // .999
        liter: '', // Empty for parent aggregation row
        elevators_count: totalElevators,
        floors_count: totalFloors,
        no_liter_breakdown: true, // Это агрегированная запись
        is_separate_liter: false,
        is_total: false
    };
    
    // Explicitly add gross_profit to parent record for DB insertion
    if (baseData.gross_profit !== undefined) {
        (parentRecord as any).gross_profit = baseData.gross_profit;
    }

    await executeDbQuery(generateInsert(parentRecord));

    // --- INSERT CHILD RECORDS (8001.001, 8001.002 ...) ---
    for (let i = 0; i < effectiveLiters.length; i++) {
        const liter = effectiveLiters[i];
        // ID format: X.001, X.002 ...
        const childId = baseContractId + (i + 1) / 1000;
        
        const childRecord = {
            ...baseData,
            contract_id: childId,
            liter: liter.name,
            elevators_count: liter.elevators,
            floors_count: liter.floors,
            no_liter_breakdown: false,
            is_separate_liter: true, // Это отдельный литер
            is_total: false
        };
        
        // Clear financials for children (kept only on parent)
        FINANCIAL_KEYWORDS.forEach(kw => {
            Object.keys(childRecord).forEach(key => {
                if (key.includes(kw)) (childRecord as any)[key] = 0;
            });
        });
        
        // Remove calculated fields from object before generating insert
        delete (childRecord as any).gross_profit;

        await executeDbQuery(generateInsert(childRecord));
    }

    // 4. Save Transactions (Linked to Integer ID = 8001)
    for (const [type, txs] of Object.entries(transactionsMap)) {
        if (txs.length > 0) {
            const values = txs.map(t => {
                const val = t.value || 0;
                const txt = (t.text || '').replace(/'/g, "''");
                const subcat = (t.subcategory || '').replace(/'/g, "''"); // Safe subcategory
                const dt = t.date || new Date().toISOString().split('T')[0];
                return `(${transactionLinkId}, '${type}', ${val}, '${txt}', '${subcat}', '${dt}')`;
            }).join(', ');
            
            // Updated SQL to include subcategory
            const insertSql = `INSERT INTO contract_transactions (contract_id, type, value, text, subcategory, date) VALUES ${values}`;
            await executeDbQuery(insertSql);
        }
    }
};
