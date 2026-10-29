export const schema = [
  "CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, sender TEXT NOT NULL CHECK(sender IN ('user','bot')), text TEXT NOT NULL, created_at INTEGER NOT NULL)",
  "CREATE INDEX IF NOT EXISTS idx_messages_session_id_created ON messages(session_id, created_at)",
  "CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at)",
  "CREATE TABLE IF NOT EXISTS chat_rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL)",
  "CREATE INDEX IF NOT EXISTS idx_chat_rate_reset ON chat_rate_limits(reset_at)",
  "CREATE TABLE IF NOT EXISTS chat_sessions (id TEXT PRIMARY KEY, generation INTEGER NOT NULL DEFAULT 0, last_seen INTEGER NOT NULL)",
  "CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_seen ON chat_sessions(last_seen)",
]

/** @param {import('@libsql/client').Client} client */
export async function initializeDatabase(client) {
  await client.batch(schema, "write")
}

/** @param {import('@libsql/client').Client} client */
export async function cleanupDatabase(client, retentionDays, now = Date.now()) {
  const cutoff = now - retentionDays * 86400000
  const result = await client.batch([
    { sql: "DELETE FROM messages WHERE created_at <= ?", args: [cutoff] },
    { sql: "DELETE FROM chat_rate_limits WHERE reset_at <= ?", args: [now] },
    { sql: "DELETE FROM chat_sessions WHERE last_seen <= ?", args: [cutoff] },
  ], "write")
  return { messages: result[0].rowsAffected, limits: result[1].rowsAffected, sessions: result[2].rowsAffected }
}

