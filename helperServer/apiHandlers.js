import { Api } from "telegram";
import { createClient } from './telegramClient.js';
import { processAndSaveLead } from './leadProcessor.js';
import { sendBotNotification } from './botNotifier.js';
import { DB_SCHEMA } from './schema.js';

const safeParse = (val) => {
    if (typeof val === 'string') {
        try { return JSON.parse(val); } catch (e) { return []; }
    }
    return val || [];
};

const safeParseObj = (val) => {
    if (typeof val === 'string') {
        try { return JSON.parse(val); } catch (e) { return {}; }
    }
    return val || {};
};

// Хелпер для получения конфига из БД
async function getDbCredentials(dbClient) {
    const res = await dbClient.query("SELECT key, value FROM telegram_config WHERE key IN ('apiId', 'apiHash', 'sessionString')");
    const config = {};
    res.rows.forEach(r => config[r.key] = r.value);
    
    if (!config.apiId || !config.apiHash || !config.sessionString) {
        throw new Error("API ключи не настроены на сервере");
    }
    return config;
}

export function setupHandlers(app, pool) {
  // Тестовый запрос данных канала
  app.post('/api/telegram/test-channel', async (req, res) => {
    const { channelTag } = req.body;
    let client;
    let dbClient;
    try {
      dbClient = await pool.connect();
      const { apiId, apiHash, sessionString } = await getDbCredentials(dbClient);
      
      client = await createClient(apiId, apiHash, sessionString);
      
      // 1. Получаем базовую информацию о канале
      const entity = await client.getEntity(channelTag);
      
      // 2. Получаем детальную информацию (участники и т.д.)
      const fullInfo = await client.invoke(new Api.channels.GetFullChannel({ 
        channel: entity 
      }));

      // 3. Получаем последние 2 сообщения
      const messages = await client.getMessages(entity, { limit: 2 });

      res.json({
        ok: true,
        channelInfo: {
            id: entity.id.toString(),
            title: entity.title,
            username: entity.username,
            participantsCount: fullInfo.fullChat.participantsCount,
            about: fullInfo.fullChat.about
        },
        messages: messages.map(m => ({
            id: m.id,
            date: m.date,
            message: m.message,
            views: m.views
        }))
      });
    } catch (err) {
      console.error('[Test Channel Error]', err.message);
      res.status(500).json({ ok: false, description: err.message });
    } finally {
      if (client) await client.disconnect();
      if (dbClient) dbClient.release();
    }
  });

  // Global Search
  app.post('/api/search-telegram', async (req, res) => {
    const { query } = req.body;
    let client;
    let dbClient;
    try {
      dbClient = await pool.connect();
      const { apiId, apiHash, sessionString } = await getDbCredentials(dbClient);

      client = await createClient(apiId, apiHash, sessionString);
      const result = await client.invoke(new Api.contacts.Search({ q: query, limit: 100 }));
      const results = result.chats.map(chat => ({
        id: chat.id.toString(),
        title: chat.title || 'Private Group',
        username: chat.username || '',
        members: chat.participantsCount || 0,
        description: chat.about || ''
      }));
      res.json({ ok: true, results });
    } catch (err) { res.status(500).json({ ok: false, description: err.message }); }
    finally { 
        if (client) await client.disconnect(); 
        if (dbClient) dbClient.release();
    }
  });

  // --- KEY MANAGER ENDPOINTS ---
  app.get('/api/telegram/channels/missing-hash', async (req, res) => {
      const client = await pool.connect();
      try {
          const result = await client.query(`SELECT id, title, username FROM telegram_channels WHERE access_hash IS NULL OR access_hash = '' LIMIT 1000`);
          res.json({ ok: true, channels: result.rows });
      } catch (err) { res.status(500).json({ ok: false, description: err.message }); }
      finally { client.release(); }
  });

  app.post('/api/telegram/resolve-one', async (req, res) => {
      const { channelId, username } = req.body;
      let client; let dbClient;
      try {
          dbClient = await pool.connect();
          const { apiId, apiHash, sessionString } = await getDbCredentials(dbClient);

          const searchKey = username ? username : Number(channelId);
          if (!searchKey) throw new Error("Нет данных для поиска");
          
          client = await createClient(apiId, apiHash, sessionString);
          const entity = await client.getEntity(searchKey);
          if (entity) {
              const accessHash = entity.accessHash ? entity.accessHash.toString() : null;
              const title = entity.title || 'Unknown';
              if (accessHash) {
                  await dbClient.query(`UPDATE telegram_channels SET access_hash = $1, title = $2, last_updated = $3 WHERE id = $4`, [accessHash, title, Date.now(), channelId]);
                  res.json({ ok: true, accessHash, title });
              } else throw new Error("Не удалось получить access_hash");
          } else throw new Error("Сущность не найдена");
      } catch (err) {
          const msg = err.message || 'Unknown error';
          let waitSeconds = 0;
          if (msg.includes('FLOOD_WAIT')) {
              const match = msg.match(/FLOOD_WAIT_(\d+)/);
              if (match) waitSeconds = parseInt(match[1]);
          }
          res.status(400).json({ ok: false, description: msg, waitSeconds });
      } finally { if (client) await client.disconnect(); if (dbClient) dbClient.release(); }
  });

  // --- REFRESH CHANNELS ENDPOINT ---
  app.post('/api/telegram/channels/refresh', async (req, res) => {
    const { channelId } = req.body;
    let dbClient; let tgClient;
    try {
        dbClient = await pool.connect();
        const config = await getDbCredentials(dbClient);
        
        tgClient = await createClient(config.apiId, config.apiHash, config.sessionString);
        let channelsToUpdate = [];
        if (channelId) {
            const result = await dbClient.query("SELECT * FROM telegram_channels WHERE id = $1", [channelId]);
            if (result.rows.length > 0) channelsToUpdate = result.rows;
        } else {
            const result = await dbClient.query("SELECT * FROM telegram_channels WHERE is_blacklisted = false");
            channelsToUpdate = result.rows;
        }
        let updatedCount = 0;
        for (const ch of channelsToUpdate) {
            try {
                let identifier = ch.username || ch.id;
                if (!ch.username && ch.access_hash) {
                    identifier = new Api.InputPeerChannel({ channelId: BigInt(ch.id), accessHash: BigInt(ch.access_hash) });
                }
                
                const entity = await tgClient.getEntity(identifier);
                const fullInfo = await tgClient.invoke(new Api.channels.GetFullChannel({ channel: entity }));
                
                const fullChat = fullInfo.fullChat;
                const chats = fullInfo.chats[0];

                const members = fullChat.participantsCount || ch.members || 0;
                const description = fullChat.about || ch.description || '';
                const title = chats.title || ch.title;
                const username = chats.username || ch.username;
                const accessHash = chats.accessHash ? chats.accessHash.toString() : ch.access_hash;

                const totalMessages = fullChat.readInboxMaxId || ch.total_messages || 0;

                await dbClient.query(`UPDATE telegram_channels SET members = $1, description = $2, title = $3, username = $4, access_hash = $5, last_updated = $6, total_messages = $7 WHERE id = $8`, 
                [members, description, title, username, accessHash, Date.now(), totalMessages, ch.id]);
                
                updatedCount++;
                if (!channelId) await new Promise(r => setTimeout(r, 1000));
            } catch (e) {
                console.error(`Error refreshing channel ${ch.id}:`, e.message);
                if (e.message.includes('FLOOD_WAIT')) break;
            }
        }
        res.json({ ok: true, updated: updatedCount });
    } catch (err) { res.status(500).json({ ok: false, description: err.message }); }
    finally { if (tgClient) await tgClient.disconnect(); if (dbClient) dbClient.release(); }
  });

  app.post('/api/debug/telegram/diagnose', async (req, res) => {
    const { pipelineId } = req.body;
    let dbClient; let client;
    try {
      dbClient = await pool.connect();
      const { apiId, apiHash, sessionString } = await getDbCredentials(dbClient);

      const pRes = await dbClient.query("SELECT id, name, watched_chats FROM telegram_pipelines WHERE id = $1", [pipelineId]);
      if (pRes.rows.length === 0) throw new Error("Воронка не найдена");
      const pipeline = pRes.rows[0];
      let targets = pipeline.watched_chats || [];
      if (targets.length === 0) {
          const cRes = await dbClient.query("SELECT username, id FROM telegram_channels WHERE $1 = ANY(assigned_pipeline_ids)", [pipelineId]);
          targets = cRes.rows.map(c => c.username || c.id);
      }
      if (targets.length === 0) return res.json({ ok: true, logs: [] });
      
      client = await createClient(apiId, apiHash, sessionString);
      const logs = [];
      for (const target of targets.slice(0, 5)) {
          const logItem = { id: `log_${Date.now()}`, channelName: target, status: 'idle', rawResponse: {} };
          try {
              const entity = await client.getEntity(target);
              const messages = await client.getMessages(entity, { limit: 1 });
              logItem.status = 'success'; logItem.channelName = entity.title || target;
              logItem.rawResponse = { id: entity.id.toString(), title: entity.title, hash: entity.accessHash ? String(entity.accessHash) : null, count: messages.length };
          } catch (e) { logItem.status = 'error'; logItem.errorMessage = e.message; }
          logs.push(logItem);
      }
      res.json({ ok: true, logs });
    } catch (err) { res.status(500).json({ ok: false, description: err.message }); }
    finally { if (client) await client.disconnect(); if (dbClient) dbClient.release(); }
  });

  app.post('/api/scan-chats', async (req, res) => {
    const { chatUsernames, keywords, pipelineId, pipelineName } = req.body;
    let dbClient; let client;
    try {
      dbClient = await pool.connect();
      const { apiId, apiHash, sessionString } = await getDbCredentials(dbClient);
      
      client = await createClient(apiId, apiHash, sessionString);
      const keywordsList = keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
      const pRes = await dbClient.query("SELECT id, name, stages, blacklist, exclude_keywords FROM telegram_pipelines WHERE id = $1", [pipelineId]);
      const pData = pRes.rows[0] || { id: pipelineId, name: pipelineName, stages: [], blacklist: [], exclude_keywords: '' };
      const excludeKeywords = (pData.exclude_keywords || '').split(';').map(k => k.trim().toLowerCase()).filter(k => k);
      const exceptionsRes = await dbClient.query('SELECT message_id FROM telegram_message_exceptions WHERE pipeline_id = $1', [pipelineId]);
      const exceptions = exceptionsRes.rows.map(r => r.message_id);
      let addedTotal = 0; let notificationsCount = 0;
      for (const username of chatUsernames) {
        try {
          const entity = await client.getEntity(username);
          const messages = await client.getMessages(entity, { limit: 50 });
          
          // Обновляем метку времени канала при успешном получении ответа (даже если 0 сообщений)
          await dbClient.query("UPDATE telegram_channels SET last_updated = $1 WHERE id = $2", [Date.now(), entity.id.toString()]);

          for (const msg of messages) {
             const chatInfo = { username: String(username).includes('@') ? username : '', id: entity.id.toString(), title: entity.title || username };
             const wasAdded = await processAndSaveLead(dbClient, pipelineId, pData.name, safeParse(pData.stages), msg, chatInfo, keywordsList, exceptions, pData.blacklist || [], 'Ручной поиск', notificationsCount >= 50, excludeKeywords);
             if (wasAdded) { addedTotal++; notificationsCount++; }
          }
        } catch (e) { console.error('Scan Error', e.message); }
      }
      if (addedTotal > 50) await sendLimitSummary(dbClient, addedTotal, pData.name);
      res.json({ ok: true, addedCount: addedTotal });
    } catch (err) { res.status(500).json({ ok: false, description: err.message }); }
    finally { if (client) await client.disconnect(); if (dbClient) dbClient.release(); }
  });

  app.post('/api/telegram/init-db', async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const query of DB_SCHEMA) await client.query(query);
      await client.query('COMMIT'); res.json({ ok: true });
    } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ ok: false, description: err.message }); }
    finally { client.release(); }
  });

  app.get('/api/system/db-status', async (req, res) => {
    const client = await pool.connect();
    try {
        const tablesRes = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
        const tables = [];
        for (const row of tablesRes.rows) {
            const tableName = row.table_name;
            const columnsRes = await client.query(`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = $1`, [tableName]);
            const countRes = await client.query(`SELECT count(*) as c FROM ${tableName}`);
            tables.push({ name: tableName, columns: columnsRes.rows, rowCount: parseInt(countRes.rows[0].c) });
        }
        res.json({ ok: true, tables });
    } catch (e) { res.status(500).json({ ok: false, description: e.message }); }
    finally { client.release(); }
  });

  app.get('/api/telegram/data', async (req, res) => {
    const client = await pool.connect();
    try {
      const pipelines = await client.query('SELECT * FROM telegram_pipelines ORDER BY order_index ASC, created_at ASC');
      const channels = await client.query('SELECT * FROM telegram_channels');
      const leads = await client.query('SELECT * FROM telegram_leads');
      const tasks = await client.query('SELECT * FROM search_tasks');
      const logs = await client.query('SELECT * FROM search_task_logs ORDER BY timestamp DESC LIMIT 100');
      res.json({ 
        ok: true, 
        pipelines: pipelines.rows.map(r => ({ id: r.id, name: r.name, keywords: r.keywords, excludeKeywords: r.exclude_keywords || '', watchedChats: r.watched_chats, blacklist: r.blacklist, stages: safeParse(r.stages), messageExceptions: r.message_exceptions || [], orderIndex: r.order_index || 0 })),
        channels: channels.rows.map(r => ({ id: r.id, title: r.title, username: r.username, members: r.members, description: r.description, photo: r.photo, assignedPipelineIds: r.assigned_pipeline_ids, isBlacklisted: r.is_blacklisted, lastUpdated: Number(r.last_updated) || 0, totalMessages: r.total_messages || 0, lastMessageId: r.last_message_id || 0, accessHash: r.access_hash })),
        leads: leads.rows.map(r => ({ id: r.id, pipelineId: r.pipeline_id, senderId: r.sender_id, senderName: r.sender_name, senderUsername: r.sender_username, senderPhone: r.sender_phone, chatTitle: r.chat_title, stageId: r.stage_id, messages: safeParse(r.messages), unreadCount: r.unread_count, lastActionType: r.last_action_type, lastUpdated: Number(r.last_updated) || 0 })),
        tasks: tasks.rows.map(r => ({ 
          id: r.id, 
          type: r.type, 
          query: r.query, 
          intervalMinutes: r.interval_minutes, 
          targetPipelineId: r.target_pipeline_id, 
          targetChats: r.target_chats || [], 
          fetchLimit: r.fetch_limit || 50, 
          fetchPeriodDays: r.fetch_period_days || 0, 
          lastRun: Number(r.last_run) || 0, 
          status: r.status, 
          createdAt: Number(r.created_at) || 0 
        })),
        history: logs.rows.map(r => ({ 
          id: r.id, 
          taskId: r.task_id, 
          query: r.query, 
          timestamp: Number(r.timestamp) || 0, 
          foundTotal: r.found_total, 
          addedNew: r.added_new, 
          pipelineName: r.pipeline_name, 
          checkedGroups: r.checked_groups || 0, 
          checkedMessages: r.checked_messages || 0, 
          successfulGroups: safeParse(r.successful_groups), 
          processingStats: safeParseObj(r.processing_stats) 
        }))
      });
    } catch (err) { res.status(500).json({ ok: false, description: err.message }); }
    finally { client.release(); }
  });

  app.post('/api/telegram/pipelines', async (req, res) => {
    const { pipelines } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let idx = 0;
      for (const p of pipelines) {
        await client.query(`INSERT INTO telegram_pipelines (id, name, keywords, exclude_keywords, watched_chats, blacklist, stages, message_exceptions, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, keywords = EXCLUDED.keywords, exclude_keywords = EXCLUDED.exclude_keywords, watched_chats = EXCLUDED.watched_chats, blacklist = EXCLUDED.blacklist, stages = EXCLUDED.stages, message_exceptions = EXCLUDED.message_exceptions, order_index = EXCLUDED.order_index`, [p.id, p.name, p.keywords || '', p.excludeKeywords || '', p.watchedChats || [], p.blacklist || [], JSON.stringify(p.stages || []), p.messageExceptions || [], idx]);
        idx++;
      }
      await client.query('COMMIT'); res.json({ ok: true });
    } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ ok: false, description: e.message }); }
    finally { client.release(); }
  });

  app.post('/api/telegram/leads', async (req, res) => {
    const { leads } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const l of leads) {
        await client.query(`INSERT INTO telegram_leads (id, pipeline_id, sender_id, sender_name, sender_username, sender_phone, chat_title, stage_id, messages, unread_count, last_action_type, last_updated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (id) DO UPDATE SET pipeline_id = EXCLUDED.pipeline_id, stage_id = EXCLUDED.stage_id, messages = EXCLUDED.messages, unread_count = EXCLUDED.unread_count, last_action_type = EXCLUDED.last_action_type, last_updated = EXCLUDED.last_updated`, [l.id, l.pipelineId, l.senderId, l.senderName || 'Unknown', l.senderUsername || '', l.senderPhone || '', l.chatTitle || '', l.stageId || 'leads', JSON.stringify(l.messages || []), l.unreadCount || 0, l.lastActionType || 'new_lead', l.lastUpdated || Date.now()]);
      }
      await client.query('COMMIT'); res.json({ ok: true });
    } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ ok: false, description: e.message }); }
    finally { client.release(); }
  });

  app.post('/api/telegram/channels', async (req, res) => {
    const { channels } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const c of channels) {
        await client.query(`INSERT INTO telegram_channels (id, title, username, members, description, photo, assigned_pipeline_ids, is_blacklisted, last_updated, total_messages, last_message_id, access_hash) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, username = EXCLUDED.username, members = EXCLUDED.members, assigned_pipeline_ids = EXCLUDED.assigned_pipeline_ids, is_blacklisted = EXCLUDED.is_blacklisted, last_updated = EXCLUDED.last_updated, total_messages = EXCLUDED.total_messages, last_message_id = EXCLUDED.last_message_id, access_hash = EXCLUDED.access_hash`, [c.id, c.title || 'Untitled', c.username || '', c.members || 0, c.description || '', c.photo || '', c.assignedPipelineIds || [], c.isBlacklisted || false, c.lastUpdated || Date.now(), c.totalMessages || 0, c.lastMessageId || 0, c.accessHash]);
      }
      await client.query('COMMIT'); res.json({ ok: true });
    } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ ok: false, description: e.message }); }
    finally { client.release(); }
  });

  app.post('/api/telegram/config', async (req, res) => {
    const { apiId, apiHash, sessionString, botToken, botChatId } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Обновляем только если значения не замаскированы
      if (apiId !== undefined && !apiId.includes('**')) await client.query('INSERT INTO telegram_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', ['apiId', apiId]);
      if (apiHash !== undefined && !apiHash.includes('**')) await client.query('INSERT INTO telegram_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', ['apiHash', apiHash]);
      if (sessionString !== undefined && !sessionString.includes('**')) await client.query('INSERT INTO telegram_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', ['sessionString', sessionString]);
      
      if (botToken !== undefined && !botToken.includes('**')) await client.query('INSERT INTO telegram_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', ['botToken', botToken]);
      if (botChatId !== undefined) await client.query('INSERT INTO telegram_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', ['botChatId', botChatId]);
      await client.query('COMMIT'); res.json({ ok: true });
    } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ ok: false, description: e.message }); }
    finally { client.release(); }
  });

  app.get('/api/telegram/config', async (req, res) => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT key, value FROM telegram_config');
      const config = {}; 
      result.rows.forEach(row => config[row.key] = row.value);
      
      // Маскируем чувствительные данные перед отправкой
      if (config.apiHash && config.apiHash.length > 5) {
          config.apiHash = config.apiHash.substring(0, 4) + '******';
      }
      if (config.sessionString) {
          config.sessionString = '**************************';
      }
      if (config.botToken && config.botToken.length > 10) {
          config.botToken = config.botToken.substring(0, 8) + '******';
      }
      
      res.json({ ok: true, config });
    } catch (err) { res.status(500).json({ ok: false, description: err.message }); }
    finally { client.release(); }
  });

  app.delete('/api/telegram/leads/:id', async (req, res) => {
    const client = await pool.connect();
    try { await client.query('DELETE FROM telegram_leads WHERE id = $1', [req.params.id]); res.json({ ok: true }); }
    catch (e) { res.status(500).json({ ok: false, description: e.message }); }
    finally { client.release(); }
  });

  app.post('/api/telegram/tasks', async (req, res) => {
    const { tasks } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const ids = tasks.map(t => t.id);
      if (ids.length > 0) await client.query('DELETE FROM search_tasks WHERE id != ALL($1)', [ids]);
      else await client.query('DELETE FROM search_tasks');
      for (const t of tasks) {
        await client.query(`INSERT INTO search_tasks (id, type, query, interval_minutes, target_pipeline_id, target_chats, fetch_limit, fetch_period_days, last_run, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO UPDATE SET query = EXCLUDED.query, interval_minutes = EXCLUDED.interval_minutes, target_pipeline_id = EXCLUDED.target_pipeline_id, fetch_limit = EXCLUDED.fetch_limit, fetch_period_days = EXCLUDED.fetch_period_days, status = EXCLUDED.status, last_run = EXCLUDED.last_run`, [t.id, t.type, t.query, t.intervalMinutes, t.targetPipelineId, t.targetChats || [], t.fetchLimit || 50, t.fetchPeriodDays || 0, t.lastRun || 0, t.status, t.createdAt]);
      }
      await client.query('COMMIT'); res.json({ ok: true });
    } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ ok: false, description: e.message }); }
    finally { client.release(); }
  });
}