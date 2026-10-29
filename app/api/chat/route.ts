import { DatabaseConfigurationError } from "@/lib/turso-client.mjs"
import { buildSystemPrompt } from "@/lib/chat-prompt"
import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { saveConversation, getRecentHistory, getSessionVersion } from "@/lib/db"
import { randomUUID } from "node:crypto"
import { ChatRequestError, chatError, chatSession, guardChatRequest, readChatText, setChatCookie } from "@/lib/chat-security"

export const runtime = "nodejs"
export const maxDuration = 90

const SYSTEM_PROMPT = buildSystemPrompt()

export async function POST(req: NextRequest) {
  try {
    const denied = await guardChatRequest(req, "send")
    if (denied) return denied
    const trimmedText = await readChatText(req)
    const apiKey = process.env.ROUTER_APIKEY?.trim()
    const baseURL = process.env.ROUTER_BASE_URL?.trim()
    const model = process.env.ROUTER_MODEL?.trim()
    if (!apiKey || !baseURL || !model) return chatError(503, "Konfigurasi API AI tidak ditemukan.")

    const existingSession = chatSession(req)
    const sessionId = existingSession || randomUUID()
    const generation = await getSessionVersion(sessionId)
    const history = await getRecentHistory(sessionId, 10)
    const userId = randomUUID(), botId = randomUUID(), userCreatedAt = Date.now()
    const signal = AbortSignal.any([req.signal, AbortSignal.timeout(60_000)])
    const openai = new OpenAI({ apiKey, baseURL, timeout: 30_000, maxRetries: 0 })
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history, { role: "user", content: trimmedText }],
      temperature: 0.7, top_p: 0.7, max_tokens: 2048, stream: true,
    }, { signal })

    let cancelled = false
    const readable = new ReadableStream({
      async start(controller) {
        let botText = "", bytes = 0
        const encoder = new TextEncoder()
        try {
          for await (const chunk of completion) {
            if (cancelled) return
            if (signal.aborted) throw new Error("Chat request aborted")
            const content = chunk.choices?.[0]?.delta?.content || ""
            if (content) {
              const encoded = encoder.encode(content)
              bytes += encoded.byteLength
              if (bytes > 64 * 1024) throw new Error("AI response exceeded 64 KiB")
              botText += content
              controller.enqueue(encoded)
            }
          }
          if (cancelled) return
          if (signal.aborted || !botText.trim()) throw new Error("AI response incomplete or empty")
          await saveConversation(
            { id: userId, sessionId, sender: "user", text: trimmedText, createdAt: userCreatedAt },
            { id: botId, sessionId, sender: "bot", text: botText, createdAt: Math.max(Date.now(), userCreatedAt + 1) },
            generation,
          )
          controller.close()
        } catch (error) {
          completion.controller.abort()
          if (!cancelled) {
            console.error("Chat stream failed:", error instanceof Error ? error.name : "UnknownError")
            controller.error(new Error("Respons AI terputus."))
          }
        }
      },
      cancel() { cancelled = true; completion.controller.abort() },
    })
    const response = new NextResponse(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store, no-transform", "X-Content-Type-Options": "nosniff" },
    })
    setChatCookie(response, sessionId)
    return response
  } catch (error) {
    if (error instanceof DatabaseConfigurationError) return chatError(503, "Chat chưa được cấu hình database.")
    if (error instanceof ChatRequestError) return chatError(error.status, error.message)
    console.error("Chat API failed:", error instanceof Error ? error.name : "UnknownError")
    return chatError(500, "Gagal terhubung ke server AI.")
  }
}

