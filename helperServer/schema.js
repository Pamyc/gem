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
    // Таблица для тестов (4 буквы, как просили)
    `CREATE TABLE IF NOT EXISTS test (
        id SERIAL PRIMARY KEY,
        text VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
];