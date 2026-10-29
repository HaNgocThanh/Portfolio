import dotenv from "dotenv"
import { getTursoClient } from "../lib/turso-client.mjs"
import { cleanupDatabase } from "../lib/chat-schema.mjs"
import retention from "../lib/chat-retention.cjs"

dotenv.config({ path: [".env.local", ".env"], quiet: true })
let client
try {
  client = getTursoClient()
  const result = await cleanupDatabase(client, retention.getRetentionDays())
  console.log("Expired records deleted: " + JSON.stringify(result))
} catch (error) {
  console.error(error?.name === "DatabaseConfigurationError" ? error.message : "Cleanup failed. Check database setup, permissions and connectivity.")
  process.exitCode = 1
} finally { client?.close() }

