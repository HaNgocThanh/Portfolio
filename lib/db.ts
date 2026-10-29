import type { Client, Row } from "@libsql/client"
import { getTursoClient } from "./turso-client.mjs"
import { cleanupDatabase } from "./chat-schema.mjs"
import { getRetentionDays } from "./chat-retention.cjs"

export interface ChatMessageRecord {
  id: string
  session_id: string
  sender: "user" | "bot"
  text: string
  created_at: number
}
interface NewChatMessage {
  id: string
  sessionId: string
  sender: "user" | "bot"
  text: string
  createdAt: number
}
interface RateQuota { key: string; max: number }

export class StaleConversationError extends Error {
  constructor() { super("Conversation was cleared while this response was running."); this.name = "StaleConversationError" }
}
const cutoff = (now = Date.now()) => now - getRetentionDays() * 86400000
const message = (row: Row): ChatMessageRecord => ({
  id: String(row.id), session_id: String(row.session_id),
  sender: row.sender === "user" ? "user" : "bot", text: String(row.text), created_at: Number(row.created_at),
})
const insert = (row: NewChatMessage) => ({
  sql: "INSERT INTO messages (id, session_id, sender, text, created_at) VALUES (?, ?, ?, ?, ?)",
  args: [row.id, row.sessionId, row.sender, row.text, row.createdAt],
})

export function createChatStore(client: Client) {
  async function getSessionVersion(sessionId: string) {
    const result = await client.execute({
      sql: "INSERT INTO chat_sessions (id, generation, last_seen) VALUES (?, 0, ?) ON CONFLICT(id) DO UPDATE SET last_seen = excluded.last_seen RETURNING generation",
      args: [sessionId, Date.now()],
    })
    return Number(result.rows[0].generation)
  }

  async function saveConversation(user: NewChatMessage, bot: NewChatMessage, generation: number) {
    if (user.sessionId !== bot.sessionId || user.sender !== "user" || bot.sender !== "bot") throw new Error("Invalid message pair")
    const tx = await client.transaction("write")
    try {
      const result = await tx.execute({ sql: "SELECT generation FROM chat_sessions WHERE id = ?", args: [user.sessionId] })
      if (!result.rows.length || Number(result.rows[0].generation) !== generation) throw new StaleConversationError()
      await tx.batch([insert(user), insert(bot)])
      await tx.commit()
    } catch (error) {
      await tx.rollback().catch(() => {})
      throw error
    } finally { tx.close() }
  }

  async function getSessionMessages(sessionId: string): Promise<ChatMessageRecord[]> {
    const result = await client.execute({
      sql: "SELECT id,session_id,sender,text,created_at FROM messages WHERE session_id = ? AND created_at > ? ORDER BY created_at DESC, rowid DESC LIMIT 100",
      args: [sessionId, cutoff()],
    })
    return result.rows.map(message).reverse()
  }

  async function getRecentHistory(sessionId: string, limit = 10): Promise<{ role: "user" | "assistant"; content: string }[]> {
    const result = await client.execute({
      sql: "SELECT id,session_id,sender,text,created_at FROM messages WHERE session_id = ? AND created_at > ? ORDER BY created_at DESC, rowid DESC LIMIT ?",
      args: [sessionId, cutoff(), Math.min(10, Math.max(1, Math.trunc(limit)))],
    })
    return result.rows.map(message).reverse().map(row => ({
      role: row.sender === "user" ? "user" : "assistant", content: row.text.slice(0, 4000),
    }))
  }

  async function clearSessionMessages(sessionId: string) {
    // A generation marker also invalidates responses still streaming in other tabs.
    await client.batch([
      { sql: "DELETE FROM messages WHERE session_id = ?", args: [sessionId] },
      { sql: "INSERT INTO chat_sessions (id,generation,last_seen) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET generation = chat_sessions.generation + 1, last_seen = excluded.last_seen", args: [sessionId, Date.now()] },
    ], "write")
  }

  async function consumeRateLimits(quotas: RateQuota[], now = Date.now()) {
    if (!quotas.length) return { allowed: true, retryAfter: 0 }
    const tx = await client.transaction("write")
    try {
      const result = await tx.execute({
        sql: "SELECT key,count,reset_at FROM chat_rate_limits WHERE key IN (" + quotas.map(() => "?").join(",") + ")",
        args: quotas.map(quota => quota.key),
      })
      const records = new Map(result.rows.map(row => [String(row.key), { count: Number(row.count), resetAt: Number(row.reset_at) }]))
      const denied = quotas.flatMap(quota => {
        const record = records.get(quota.key)
        return record && record.resetAt > now && record.count >= quota.max ? [Math.max(1, Math.ceil((record.resetAt - now) / 1000))] : []
      })
      if (denied.length) {
        await tx.rollback()
        return { allowed: false, retryAfter: Math.max(...denied) }
      }
      await tx.batch(quotas.map(quota => {
        const record = records.get(quota.key)
        const active = record && record.resetAt > now
        return {
          sql: "INSERT INTO chat_rate_limits (key,count,reset_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET count = excluded.count, reset_at = excluded.reset_at",
          args: [quota.key, active ? record.count + 1 : 1, active ? record.resetAt : now + 60_000],
        }
      }))
      await tx.commit()
      return { allowed: true, retryAfter: 0 }
    } catch (error) {
      await tx.rollback().catch(() => {})
      throw error
    } finally { tx.close() }
  }

  return { getSessionVersion, saveConversation, getSessionMessages, getRecentHistory, clearSessionMessages, consumeRateLimits,
    cleanupExpiredData: (now = Date.now()) => cleanupDatabase(client, getRetentionDays(), now) }
}

let store: ReturnType<typeof createChatStore> | undefined
function getStore() { return store ??= createChatStore(getTursoClient()) }

export const getSessionVersion = (sessionId: string) => getStore().getSessionVersion(sessionId)
export const saveConversation = (user: NewChatMessage, bot: NewChatMessage, generation: number) => getStore().saveConversation(user, bot, generation)
export const getSessionMessages = (sessionId: string) => getStore().getSessionMessages(sessionId)
export const getRecentHistory = (sessionId: string, limit = 10) => getStore().getRecentHistory(sessionId, limit)
export const clearSessionMessages = (sessionId: string) => getStore().clearSessionMessages(sessionId)
export const consumeRateLimits = (quotas: RateQuota[], now = Date.now()) => getStore().consumeRateLimits(quotas, now)
export const cleanupExpiredData = (now = Date.now()) => getStore().cleanupExpiredData(now)

