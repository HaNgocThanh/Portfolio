import { createClient } from "@libsql/client/web"

export class DatabaseConfigurationError extends Error {
  constructor(message) { super(message); this.name = "DatabaseConfigurationError" }
}

export function getTursoConfig(env = process.env) {
  const source = env.TURSO_DATABASE_URL?.trim()
  const authToken = env.TURSO_AUTH_TOKEN?.trim()
  if (!source || !authToken) throw new DatabaseConfigurationError("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.")
  let url
  try { url = new URL(source) } catch { throw new DatabaseConfigurationError("Invalid TURSO_DATABASE_URL.") }
  if (!["https:", "libsql:"].includes(url.protocol) || !url.hostname || url.username || url.password || url.hash || url.search) {
    throw new DatabaseConfigurationError("Use a remote libsql:// or https:// database URL without credentials in the URL.")
  }
  // Force HTTP; never create an embedded replica or a local SQLite file.
  const remote = new URL(url.toString().replace(/^libsql:/, "https:"))
  return { url: remote.toString(), authToken }
}

let client
export function getTursoClient() {
  if (!client) {
    client = createClient({
      ...getTursoConfig(),
      fetch: (input, options = {}) => fetch(input, {
        ...options,
        signal: AbortSignal.any([...(options.signal ? [options.signal] : []), AbortSignal.timeout(8000)]),
      }),
    })
  }
  return client
}

