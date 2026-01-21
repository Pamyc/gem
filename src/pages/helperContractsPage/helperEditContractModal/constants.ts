
// Список полей, которые не нужно показывать в форме
export const EXCLUDED_FIELDS = [
    'id', 
    'contract_id', 
    'created_at', 
    'updated_at', 
    'profit_per_lift_calculated', 
    'rentability_calculated',
    'no_liter_breakdown',
    'is_separate_liter'
];

// Поля, которые считаются финансовыми (для правой колонки)
export const FINANCIAL_KEYWORDS = ['income', 'expense', 'profit', 'rentability', 'gross'];

// Опции валют
export const CURRENCIES = [
    { label: '₽', value: '₽' },
    { label: '$', value: '$' },
    { label: '€', value: '€' },
];

// Форматирование числа с пробелами (1 000 000)
export const formatMoney = (value: any) => {
    if (value === null || value === undefined || value === '') return '';
    // Удаляем все нецифровые символы кроме точки и минуса
    const cleanVal = String(value).replace(/[^\d.-]/g, '');
    if (!cleanVal || isNaN(Number(cleanVal))) return cleanVal;
    
    // Форматируем
    return new Intl.NumberFormat('ru-RU').format(Number(cleanVal));
};

// Очистка строки обратно в число для стейта
export const cleanMoneyInput = (value: string) => {
    // Удаляем пробелы (non-breaking spaces тоже могут быть)
    const cleaned = value.replace(/\s/g, '').replace(/,/g, '.');
    return cleaned;
};
