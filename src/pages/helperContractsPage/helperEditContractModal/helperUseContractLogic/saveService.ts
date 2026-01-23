
import { executeDbQuery } from '../../../../utils/dbGatewayApi';
import { FINANCIAL_KEYWORDS } from '../constants';
import { LiterItem, Transaction } from './types';
import { generateContractId } from './businessLogic';

interface ExecuteSaveParams {
    formData: Record<string, any>;
    liters: LiterItem[];
    transactionsMap: Record<string, Transaction[]>;
    isEditMode: boolean;
    username?: string; // Author
}

export const executeSave = async ({ formData, liters, transactionsMap, isEditMode, username }: ExecuteSaveParams) => {
    const author = username || 'Unknown';
    let baseContractId = 0;

    // 1. Получаем ID (асинхронно, до начала транзакции)
    if (isEditMode && formData.contract_id) {
        // Редактирование: оставляем старый ID
        baseContractId = Math.floor(formData.contract_id);
    } else {
        // Создание: генерируем новый ID на основе города
        baseContractId = await generateContractId(formData.city);
    }

    const parentContractId = baseContractId + 0.999;
    const transactionLinkId = baseContractId;
    const effectiveLiters = liters.length === 0 ? [{name: 'Литер 1', elevators: 0, floors: 0}] : liters;

    // --- БУФЕР SQL КОМАНД ---
    const sqlBatch: string[] = [];
    
    // Открываем транзакцию
    sqlBatch.push('BEGIN;');

    // 2. Удаление старых данных (только при редактировании)
    if (isEditMode) {
        // Удаляем диапазон ID текущего договора
        sqlBatch.push(`DELETE FROM data_contracts WHERE contract_id >= ${baseContractId} AND contract_id < ${baseContractId + 1};`);
        sqlBatch.push(`DELETE FROM contract_transactions WHERE contract_id >= ${baseContractId} AND contract_id < ${baseContractId + 1};`);
    }

    // Хелпер: Генерация строки INSERT SQL
    const generateInsertSql = (data: Record<string, any>) => {
        const safeData = { ...data };
        // Очистка мета-полей
        delete safeData.id;
        delete safeData.is_total;
        delete safeData.expense_fot_fact;
        delete safeData.updated_at;
        
        // Calculated / Generated fields
        delete safeData.rentability_calculated;
        delete safeData.profit_per_lift_calculated;
        
        // Trigger managed fields (must NOT be inserted manually)
        delete safeData.gross_profit;
        delete safeData.income_total_plan;
        delete safeData.income_total_fact;
        delete safeData.expense_total_plan;
        delete safeData.expense_total_fact;
        
        // Поля аудита
        safeData.updated_by = author;
        if (!isEditMode) {
            safeData.created_by = author;
        } else {
            if (!safeData.created_by) safeData.created_by = author;
        }
        
        const keys = Object.keys(safeData);
        const cols = keys.map(k => `"${k}"`).join(', ');
        const vals = keys.map(k => {
            const val = safeData[k];

            if (val === 'Да') return 'true';
            if (val === 'Нет') return 'false';

            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (val === undefined || val === null) return 'NULL';
            if (typeof val === 'boolean') return val ? 'true' : 'false';
            return val;
        }).join(', ');
        
        return `INSERT INTO data_contracts (${cols}) VALUES (${vals});`;
    };

    // Подготовка базовых данных
    const baseData = { ...formData };

    // 3. Вставка РОДИТЕЛЬСКОЙ записи (X.999)
    const totalElevators = effectiveLiters.reduce((sum, l) => sum + Number(l.elevators || 0), 0);
    const totalFloors = effectiveLiters.reduce((sum, l) => sum + Number(l.floors || 0), 0);
    
    const parentRecord = {
        ...baseData,
        contract_id: parentContractId,
        elevators_count: totalElevators,
        floors_count: totalFloors,
        no_liter_breakdown: true,
        is_separate_liter: false
    };

    sqlBatch.push(generateInsertSql(parentRecord));

    // 4. Вставка ДОЧЕРНИХ записей (литеров)
    for (let i = 0; i < effectiveLiters.length; i++) {
        const liter = effectiveLiters[i];
        const childId = baseContractId + (i + 1) / 1000;
        
        const childRecord = {
            ...baseData,
            contract_id: childId,
            liter: liter.name,
            elevators_count: liter.elevators,
            floors_count: liter.floors,
            no_liter_breakdown: false,
            is_separate_liter: true
        };
        
        // Очищаем финансы у детей (храним только в родителе)
        FINANCIAL_KEYWORDS.forEach(kw => {
            Object.keys(childRecord).forEach(key => {
                if (key.includes(kw)) (childRecord as any)[key] = 0;
            });
        });
        
        // Remove calculated fields explicitly from children data object before generation 
        // (though generateInsertSql handles it, better safe for logic flow)
        delete (childRecord as any).gross_profit;

        sqlBatch.push(generateInsertSql(childRecord));
    }

    // 5. Вставка ТРАНЗАКЦИЙ
    for (const [type, txs] of Object.entries(transactionsMap)) {
        if (txs.length > 0) {
            const values = txs.map(t => {
                const val = t.value || 0;
                const txt = (t.text || '').replace(/'/g, "''");
                const subcat = (t.subcategory || '').replace(/'/g, "''");
                const dt = t.date || new Date().toISOString().split('T')[0];
                const txAuthor = t.createdBy || author;
                const createdAt = t.createdAt || new Date().toISOString();
                // Используем сохраненный updatedAt или текущее время если его нет
                const updatedAt = t.updatedAt || new Date().toISOString();
                
                return `(${transactionLinkId}, '${type}', ${val}, '${txt}', '${subcat}', '${dt}', '${txAuthor}', '${author}', '${createdAt}', '${updatedAt}')`;
            }).join(', ');
            
            const insertSql = `INSERT INTO contract_transactions (contract_id, type, value, text, subcategory, date, created_by, updated_by, created_at, updated_at) VALUES ${values};`;
            sqlBatch.push(insertSql);
        }
    }

    // Фиксация транзакции
    sqlBatch.push('COMMIT;');

    // 6. Выполнение единого пакетного запроса
    // Объединяем команды через перевод строки (pg драйвер обработает их последовательно в одной сессии)
    const finalSql = sqlBatch.join('\n');
    
    // console.log("Executing Transaction Batch:", finalSql); // For debug
    await executeDbQuery(finalSql);
};