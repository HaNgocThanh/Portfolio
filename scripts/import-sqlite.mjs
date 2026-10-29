import fs from "node:fs"
import path from "node:path"
import { DatabaseSync } from "node:sqlite"
import dotenv from "dotenv"
import { getTursoClient } from "../lib/turso-client.mjs"
import { initializeDatabase } from "../lib/chat-schema.mjs"
import retention from "../lib/chat-retention.cjs"

dotenv.config({ path: [".env.local", ".env"], quiet: true })
const args = process.argv.slice(2)
const sourceIndex = args.indexOf("--source")
const source = sourceIndex >= 0 ? args[sourceIndex + 1] : undefined
if (!source || !args.includes("--confirm-upload")) {
  console.error("Usage: npm run db:import -- --source <old-chat.db> --confirm-upload")
  console.error("This explicitly uploads unexpired chat messages to your configured Turso database. The source file stays unchanged.")
  process.exitCode = 1
} else {
  let old, client
  try {
    const file = path.resolve(source)
    if (!fs.existsSync(file)) throw new Error("Source missing")
    old = new DatabaseSync(file, { readOnly: true })
    const rows = old.prepare("SELECT id,session_id,sender,text,created_at FROM messages WHERE created_at > ? ORDER BY created_at").all(Date.now() - retention.getRetentionDays() * 86400000)
    client = getTursoClient()
    await initializeDatabase(client)
    let imported = 0
    for (let offset = 0; offset < rows.length; offset += 100) {
      const results = await client.batch(rows.slice(offset, offset + 100).map(row => ({
        sql: "INSERT OR IGNORE INTO messages (id,session_id,sender,text,created_at) VALUES (?,?,?,?,?)",
        args: [String(row.id), String(row.session_id), String(row.sender), String(row.text), Number(row.created_at)],
      })), "write")
      imported += results.reduce((sum, result) => sum + result.rowsAffected, 0)
    }
    console.log("Imported " + imported + " unexpired messages. Existing IDs and the local source were preserved.")
  } catch (error) {
    console.error(error?.name === "DatabaseConfigurationError" ? error.message : "Import failed. Check the source, schema, token permissions and connectivity. No message contents were printed.")
    process.exitCode = 1
  } finally { old?.close(); client?.close() }
}

