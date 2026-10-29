import dotenv from "dotenv"
import { getTursoClient } from "../lib/turso-client.mjs"
import { initializeDatabase } from "../lib/chat-schema.mjs"

dotenv.config({ path: [".env.local", ".env"], quiet: true })
let client
try {
  client = getTursoClient()
  await initializeDatabase(client)
  console.log("Turso schema initialized successfully (existing rows preserved).")
} catch (error) {
  console.error(error?.name === "DatabaseConfigurationError" ? error.message : "Database setup failed. Check URL, token permissions and network access.")
  process.exitCode = 1
} finally { client?.close() }

