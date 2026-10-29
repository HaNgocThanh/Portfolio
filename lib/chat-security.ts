import { getAllowedOrigins } from "@/lib/site"
import { NextRequest, NextResponse } from "next/server"
import { createHash, randomUUID } from "node:crypto"
import { isIP } from "node:net"
import { consumeRateLimits } from "@/lib/db"
import { getRetentionDays } from "@/lib/chat-retention.cjs"

export const CHAT_COOKIE = "ryhar_chat_session"
export const MAX_TEXT_LENGTH = 1000
const MAX_BODY_BYTES = 16 * 1024
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export class ChatRequestError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

export function chatError(status: number, message: string, headers: Record<string, string> = {}) {
  return NextResponse.json({ success: false, message }, {
    status, headers: { "Cache-Control": "no-store", ...headers },
  })
}

export function chatSession(req: NextRequest) {
  const value = req.cookies.get(CHAT_COOKIE)?.value
  return value && UUID.test(value) ? value.toLowerCase() : null
}

export function setChatCookie(response: NextResponse, sessionId: string = randomUUID()) {
  response.cookies.set({
    name: CHAT_COOKIE, value: sessionId, path: "/", httpOnly: true,
    sameSite: "lax", secure: process.env.NODE_ENV === "production",
    maxAge: getRetentionDays() * 24 * 60 * 60,
  })
}

function trustedClient(req: NextRequest) {
  // Only enable behind a proxy that overwrites this header and blocks direct access.
  if (process.env.VERCEL !== "1" && process.env.CHAT_TRUST_PROXY !== "true") return "shared-client"
  const ip = req.headers.get("x-real-ip")?.trim()
  return ip && isIP(ip) ? ip.toLowerCase() : "shared-client"
}

export async function guardChatRequest(req: NextRequest, action: "send" | "read" | "delete") {
  let allowed: Set<string>
  try { allowed = getAllowedOrigins(req.nextUrl.origin) } catch {
    return chatError(503, "Cấu hình URL website không hợp lệ.")
  }
  const origin = req.headers.get("origin")
  const referer = req.headers.get("referer")
  const site = req.headers.get("sec-fetch-site")
  try {
    if (site === "cross-site" || (origin && !allowed.has(new URL(origin).origin)) ||
      (referer && !allowed.has(new URL(referer).origin)) ||
      (action !== "read" && !origin && !referer)) {
      return chatError(403, "Akses tidak diizinkan.")
    }
  } catch {
    return chatError(403, "Akses tidak diizinkan.")
  }

  const limit = action === "read" ? 60 : 10
  const hash = (value: string) => createHash("sha256").update(value).digest("hex")
  const quotas = [
    { key: `${action}:global`, max: action === "read" ? 300 : 60 },
    { key: `${action}:client:${hash(trustedClient(req))}`, max: limit },
  ]
  const session = chatSession(req)
  if (session) quotas.push({ key: `${action}:session:${hash(session)}`, max: limit })
  const result = await consumeRateLimits(quotas)
  if (!result.allowed) {
    return chatError(429, "Terlalu banyak permintaan. Silakan tunggu sebelum mencoba lagi.", {
      "Retry-After": String(result.retryAfter),
    })
  }
  return null
}

export async function readChatText(req: NextRequest): Promise<string> {
  if (req.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json" ||
    (req.headers.has("content-encoding") && req.headers.get("content-encoding") !== "identity")) {
    throw new ChatRequestError(415, "Gunakan Content-Type application/json tanpa kompresi.")
  }
  const length = req.headers.get("content-length")
  if (length && (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES)) {
    throw new ChatRequestError(413, "Ukuran request terlalu besar (maksimal 16 KiB).")
  }
  if (!req.body) throw new ChatRequestError(400, "Body JSON diperlukan.")
  const reader = req.body.getReader()
  const decoder = new TextDecoder("utf-8", { fatal: true })
  let timedOut = false
  const timer = setTimeout(() => { timedOut = true; void reader.cancel().catch(() => {}) }, 5000)
  let raw = "", bytes = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (timedOut) throw new ChatRequestError(408, "Waktu membaca request habis.")
      if (done) break
      bytes += value.byteLength
      if (bytes > MAX_BODY_BYTES) {
        void reader.cancel().catch(() => {})
        throw new ChatRequestError(413, "Ukuran request terlalu besar (maksimal 16 KiB).")
      }
      raw += decoder.decode(value, { stream: true })
    }
    raw += decoder.decode()
    const body: unknown = JSON.parse(raw)
    if (!body || typeof body !== "object" || Array.isArray(body) ||
      Object.keys(body).length !== 1 || !("text" in body) || typeof body.text !== "string") {
      throw new ChatRequestError(400, "Request harus berisi satu field text berupa string.")
    }
    const text = body.text.trim()
    if (!text || text.length > MAX_TEXT_LENGTH) {
      throw new ChatRequestError(400, `Pesan harus berisi 1 sampai ${MAX_TEXT_LENGTH} karakter.`)
    }
    return text
  } catch (error) {
    if (error instanceof ChatRequestError) throw error
    throw new ChatRequestError(400, "Format JSON atau UTF-8 tidak valid.")
  } finally {
    clearTimeout(timer)
    reader.releaseLock()
  }
}
