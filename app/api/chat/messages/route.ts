import { DatabaseConfigurationError } from "@/lib/turso-client.mjs"
import { NextRequest, NextResponse } from "next/server"
import { getSessionMessages, clearSessionMessages } from "@/lib/db"
import { randomUUID } from "node:crypto"
import { CHAT_COOKIE, chatError, chatSession, guardChatRequest, setChatCookie } from "@/lib/chat-security"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  try {
    const denied = await guardChatRequest(req, "read")
    if (denied) return denied
    const existingSession = chatSession(req)
    const sessionId = existingSession || randomUUID()
    const messages = (await getSessionMessages(sessionId)).map(r => ({
      id: r.id, sender: r.sender, text: r.text, timestamp: new Date(r.created_at).toISOString(),
    }))
    const response = NextResponse.json({ success: true, messages }, { headers: { "Cache-Control": "no-store" } })
    setChatCookie(response, sessionId)
    return response
  } catch (error) {
    if (error instanceof DatabaseConfigurationError) return chatError(503, "Chat chưa được cấu hình database.")
    return chatError(500, "Gagal memuat pesan dari database.")
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const denied = await guardChatRequest(req, "delete")
    if (denied) return denied
    const sessionId = chatSession(req)
    if (req.cookies.get(CHAT_COOKIE) && !sessionId) return chatError(400, "Session chat tidak valid. Muat ulang halaman.")
    if (sessionId) await clearSessionMessages(sessionId)
    return NextResponse.json({ success: true, message: "Riwayat chat berhasil dihapus." }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    if (error instanceof DatabaseConfigurationError) return chatError(503, "Chat chưa được cấu hình database.")
    return chatError(500, "Gagal menghapus riwayat chat.")
  }
}

