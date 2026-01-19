

export const DB_SCHEMA = [
    `CREATE TABLE IF NOT EXISTS telegram_pipelines (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL, keywords TEXT, watched_chats TEXT[] DEFAULT '{}', blacklist TEXT[] DEFAULT '{}', stages JSONB DEFAULT '[]', message_exceptions INTEGER[] DEFAULT '{}', created_at TIMESTAMP DEFAULT NOW());`,
    `ALTER TABLE telegram_pipelines ADD COLUMN IF NOT EXISTS exclude_keywords TEXT;`,
    `ALTER TABLE telegram_pipelines ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;`,
    `CREATE TABLE IF NOT EXISTS telegram_message_exceptions (id SERIAL PRIMARY KEY, pipeline_id VARCHAR(255) NOT NULL, message_id INTEGER NOT NULL, created_at TIMESTAMP DEFAULT NOW(), UNIQUE(pipeline_id, message_id));`,
    `CREATE TABLE IF NOT EXISTS telegram_channels (id VARCHAR(255) PRIMARY KEY, title VARCHAR(255), username VARCHAR(255), members INTEGER DEFAULT 0, description TEXT, photo TEXT, assigned_pipeline_ids TEXT[] DEFAULT '{}', is_blacklisted BOOLEAN DEFAULT FALSE, last_updated BIGINT, total_messages INTEGER DEFAULT 0, last_message_id INTEGER DEFAULT 0);`,
    `ALTER TABLE telegram_channels ADD COLUMN IF NOT EXISTS access_hash VARCHAR(255);`,
    `CREATE TABLE IF NOT EXISTS telegram_leads (id VARCHAR(255) PRIMARY KEY, pipeline_id VARCHAR(255), sender_id VARCHAR(255), sender_name VARCHAR(255), sender_username VARCHAR(255), sender_phone VARCHAR(50), chat_title VARCHAR(255), stage_id VARCHAR(50), messages JSONB DEFAULT '[]', unread_count INTEGER DEFAULT 0, last_action_type VARCHAR(50), last_updated BIGINT, notes TEXT);`,
    `CREATE TABLE IF NOT EXISTS search_tasks (id VARCHAR(255) PRIMARY KEY, type VARCHAR(50), query TEXT, interval_minutes INTEGER, target_pipeline_id VARCHAR(255), target_chats TEXT[] DEFAULT '{}', fetch_limit INTEGER DEFAULT 50, fetch_period_days INTEGER DEFAULT 0, last_run BIGINT, status VARCHAR(20) DEFAULT 'active', created_at BIGINT);`,
    `CREATE TABLE IF NOT EXISTS search_task_logs (id VARCHAR(255) PRIMARY KEY, task_id VARCHAR(255), query TEXT, timestamp BIGINT, found_total INTEGER, added_new INTEGER, pipeline_name VARCHAR(255));`,
    `ALTER TABLE search_task_logs ADD COLUMN IF NOT EXISTS checked_groups INTEGER DEFAULT 0;`,
    `ALTER TABLE search_task_logs ADD COLUMN IF NOT EXISTS checked_messages INTEGER DEFAULT 0;`,
    `ALTER TABLE search_task_logs ADD COLUMN IF NOT EXISTS successful_groups JSONB DEFAULT '[]';`,
    `ALTER TABLE search_task_logs ADD COLUMN IF NOT EXISTS processing_stats JSONB DEFAULT '{}';`,
    `CREATE TABLE IF NOT EXISTS telegram_config (key VARCHAR(50) PRIMARY KEY, value TEXT);`,
    
    // --- ОСНОВНЫЕ ТАБЛИЦЫ CCM DASHBOARD ---

    // 1. data_contracts
    `CREATE TABLE IF NOT EXISTS data_contracts (
        id SERIAL PRIMARY KEY,
        city VARCHAR(255),
        housing_complex VARCHAR(255),
        liter VARCHAR(255),
        is_handed_over BOOLEAN,
        region VARCHAR(255),
        is_total BOOLEAN,
        no_liter_breakdown BOOLEAN,
        is_separate_liter BOOLEAN,
        object_type VARCHAR(255),
        client_name VARCHAR(255),
        year INTEGER,
        elevators_count INTEGER,
        floors_count INTEGER,
        income_total_plan NUMERIC(15,2),
        income_total_fact NUMERIC(15,2),
        income_equip_plan NUMERIC(15,2),
        income_equip_fact NUMERIC(15,2),
        income_frame_plan NUMERIC(15,2),
        income_frame_fact NUMERIC(15,2),
        income_install_plan NUMERIC(15,2),
        income_install_fact NUMERIC(15,2),
        expense_total_plan NUMERIC(15,2),
        expense_total_fact NUMERIC(15,2),
        expense_equip_plan NUMERIC(15,2),
        expense_equip_fact NUMERIC(15,2),
        expense_frame_plan NUMERIC(15,2),
        expense_frame_fact NUMERIC(15,2),
        expense_install_plan NUMERIC(15,2),
        expense_install_fact NUMERIC(15,2),
        expense_fot_fact NUMERIC(15,2),
        gross_profit NUMERIC(15,2),
        contract_id NUMERIC,
        created_at TIMESTAMP DEFAULT NOW(),
        rentability_calculated NUMERIC(5,2) GENERATED ALWAYS AS (CASE WHEN ((no_liter_breakdown = true) AND (income_total_fact > 0)) THEN ((gross_profit / income_total_fact) * 100) END) STORED,
        profit_per_lift_calculated NUMERIC(15,2) GENERATED ALWAYS AS (CASE WHEN (elevators_count > 0) THEN (gross_profit / elevators_count) END) STORED
    );`,

    // 2. meta_dictionary
    `CREATE TABLE IF NOT EXISTS meta_dictionary (
        id SERIAL PRIMARY KEY,
        db_column VARCHAR(255),
        sheet_header TEXT,
        ui_label VARCHAR(255),
        data_type VARCHAR(255)
    );`,

    // 3. ui_settings
    `CREATE TABLE IF NOT EXISTS ui_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE,
        setting_value TEXT
    );`,

    // 4. contract_transactions (ADDED for financial details)
    `CREATE TABLE IF NOT EXISTS contract_transactions (
        id SERIAL PRIMARY KEY,
        contract_id NUMERIC NOT NULL,
        type VARCHAR(255) NOT NULL,
        value NUMERIC(15,2) DEFAULT 0,
        text TEXT,
        date DATE,
        created_at TIMESTAMP DEFAULT NOW()
    );`,
    
    `CREATE INDEX IF NOT EXISTS idx_contract_transactions_contract_id ON contract_transactions(contract_id);`,

    // --- ЗАПОЛНЕНИЕ meta_dictionary (SEED) ---
    `INSERT INTO meta_dictionary (id, db_column, sheet_header, ui_label, data_type) VALUES
    (1, 'city', 'Город', 'Город', 'text'),
    (2, 'housing_complex', 'ЖК', 'ЖК', 'text'),
    (3, 'liter', 'Литер', 'Литер', 'text'),
    (4, 'is_handed_over', 'Сдан да/нет', 'Сдан', 'boolean'),
    (5, 'region', 'Регион', 'Регион', 'text'),
    (6, 'is_total', 'Итого (Да/Нет)', 'Это итог', 'boolean'),
    (7, 'no_liter_breakdown', 'Без разбивки на литеры (Да/Нет)', 'Без разбивки', 'boolean'),
    (8, 'is_separate_liter', 'Отдельный литер (Да/Нет)', 'Отдельный литер', 'boolean'),
    (9, 'object_type', 'Тип объекта', 'Тип объекта', 'text'),
    (10, 'client_name', 'Клиент', 'Клиент', 'text'),
    (11, 'year', 'Год', 'Год', 'number'),
    (12, 'elevators_count', 'Кол-во лифтов', 'Лифтов (шт)', 'number'),
    (13, 'floors_count', 'Кол-во этажей', 'Этажей (шт)', 'number'),
    (14, 'income_total_plan', 'Доходы + Итого + План', 'Доходы Итого (План)', 'number'),
    (15, 'income_total_fact', 'Доходы + Итого + Факт', 'Доходы Итого (Факт)', 'number'),
    (16, 'income_equip_plan', 'Доходы + Лифтовое оборудование + План', 'Доходы Оборудование (План)', 'number'),
    (17, 'income_equip_fact', 'Доходы + Лифтовое оборудование + Факт', 'Доходы Оборудование (Факт)', 'number'),
    (18, 'income_frame_plan', 'Доходы + Обрамление + План', 'Доходы Обрамление (План)', 'number'),
    (19, 'income_frame_fact', 'Доходы + Обрамление + Факт', 'Доходы Обрамление (Факт)', 'number'),
    (20, 'income_install_plan', 'Доходы + Монтаж ЛО + План', 'Доходы Монтаж (План)', 'number'),
    (21, 'income_install_fact', 'Доходы + Монтаж ЛО + Факт', 'Доходы Монтаж (Факт)', 'number'),
    (22, 'expense_total_plan', 'Расходы + Итого + План', 'Расходы Итого (План)', 'number'),
    (23, 'expense_total_fact', 'Расходы + Итого + Факт', 'Расходы Итого (Факт)', 'number'),
    (24, 'expense_equip_plan', 'Расходы + Лифтовое оборудование + План', 'Расходы Оборудование (План)', 'number'),
    (25, 'expense_equip_fact', 'Расходы + Лифтовое оборудование + Факт', 'Расходы Оборудование (Факт)', 'number'),
    (26, 'expense_frame_plan', 'Расходы + Обрамление + План', 'Расходы Обрамление (План)', 'number'),
    (27, 'expense_frame_fact', 'Расходы + Обрамление + Факт', 'Расходы Обрамление (Факт)', 'number'),
    (28, 'expense_install_plan', 'Расходы + Монтаж ЛО + План', 'Расходы Монтаж (План)', 'number'),
    (29, 'expense_install_fact', 'Расходы + Монтаж ЛО + Факт', 'Расходы Монтаж (Факт)', 'number'),
    (30, 'expense_fot_fact', 'Расходы + Факт (ФОТ и другое) + Факт (ФОТ и другое)', 'Расходы ФОТ', 'number'),
    (31, 'gross_profit', 'Валовая', 'Валовая прибыль', 'number'),
    (32, 'profit_per_lift_calculated', 'Прибыль с 1 лифта', 'Прибыль с лифта', 'number'),
    (33, 'rentability_calculated', 'Рентабельность', 'Рентабельность (%)', 'number')
    ON CONFLICT (id) DO UPDATE SET 
        db_column = EXCLUDED.db_column, 
        sheet_header = EXCLUDED.sheet_header, 
        ui_label = EXCLUDED.ui_label, 
        data_type = EXCLUDED.data_type;`,

    // Таблица для тестов (4 буквы)
    `CREATE TABLE IF NOT EXISTS test (
        id SERIAL PRIMARY KEY,
        text VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
];
