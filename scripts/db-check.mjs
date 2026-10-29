import dotenv from "dotenv"
import { getTursoClient } from "../lib/turso-client.mjs"

dotenv.config({ path: [".env.local", ".env"], quiet: true })
let client
try {
  client = getTursoClient()
  const result = await client.execute("SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('messages','chat_rate_limits','chat_sessions')")
  if (result.rows.length !== 3) throw new Error("Missing schema")
  console.log("Turso connection and all three application tables verified.")
} catch (error) {
  console.error(error?.name === "DatabaseConfigurationError" ? error.message : "Database check failed. Run npm run db:setup and check connectivity.")
  process.exitCode = 1
} finally { client?.close() }

