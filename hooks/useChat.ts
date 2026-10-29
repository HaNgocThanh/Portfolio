"use client"
import { useState, useEffect, useRef, type FormEvent } from "react"
import { chatWelcome } from "@/content/profile"
import type { ChatMessage } from "@/components/chat/types"

async function readChatError(response: Response, fallback: string): Promise<string> {
  try {
    const data: unknown = await response.json()
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") return data.message
  } catch {
    // Non-JSON responses still get a readable fallback.
  }
  return response.status === 429 ? "Terlalu banyak permintaan. Silakan tunggu sebelum mencoba lagi." : fallback
}

export function useChat() {
  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [isClearingChat, setIsClearingChat] = useState(false)
  const [chatError, setChatError] = useState("")
  const operationRef = useRef<"loading" | "sending" | "clearing" | null>("loading")
  const requestRef = useRef<AbortController | null>(null)
  const isChatBusy = isChatLoading || isHistoryLoading || isClearingChat

  const setInitialWelcomeMessage = () => {
    setChatMessages([{
      id: "welcome-msg",
      sender: "bot",
      text: chatWelcome,
      timestamp: new Date(),
    }])
  }

  useEffect(() => {
    const controller = new AbortController()
    operationRef.current = "loading"
    const loadChatHistory = async () => {
      try {
        const response = await fetch("/api/chat/messages", { signal: controller.signal, cache: "no-store" })
        if (!response.ok) throw new Error("Gagal memuat riwayat chat. Muat ulang halaman untuk mencoba lagi.")
        const data = await response.json()
        if (!data.success || !Array.isArray(data.messages)) throw new Error("Format riwayat chat tidak valid.")
        if (controller.signal.aborted) return
        if (data.messages.length) {
          setChatMessages(data.messages.map((msg: Omit<ChatMessage, "timestamp"> & { timestamp: string }) => ({
            ...msg, timestamp: new Date(msg.timestamp),
          })))
        } else {
          setInitialWelcomeMessage()
        }
      } catch (error) {
        if (controller.signal.aborted) return
        setInitialWelcomeMessage()
        setChatError(error instanceof Error ? error.message : "Gagal memuat riwayat chat.")
      } finally {
        if (!controller.signal.aborted) {
          operationRef.current = null
          setIsHistoryLoading(false)
        }
      }
    }
    void loadChatHistory()
    return () => {
      controller.abort()
      requestRef.current?.abort()
    }
  }, [])

  const handleClearChat = async () => {
    if (operationRef.current) return
    operationRef.current = "clearing"
    setIsClearingChat(true)
    setChatError("")
    const controller = new AbortController()
    requestRef.current = controller
    try {
      const response = await fetch("/api/chat/messages", { method: "DELETE", signal: controller.signal })
      if (!response.ok) throw new Error(await readChatError(response, "Gagal menghapus riwayat chat."))
      const data = await response.json()
      if (!data.success) throw new Error("Gagal menghapus riwayat chat.")
      if (!controller.signal.aborted) setInitialWelcomeMessage()
    } catch (error) {
      if (!controller.signal.aborted) setChatError(error instanceof Error ? error.message : "Gagal menghapus riwayat chat.")
    } finally {
      if (!controller.signal.aborted) {
        operationRef.current = null
        requestRef.current = null
        setIsClearingChat(false)
      }
    }
  }

  const handleSendChat = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const userText = chatInput.trim()
    if (!userText || operationRef.current) return
    operationRef.current = "sending"
    setIsChatLoading(true)
    setChatError("")
    const controller = new AbortController()
    requestRef.current = controller
    const botMsgId = crypto.randomUUID()
    let botText = ""
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
    setChatMessages(prev => [...prev, { id: crypto.randomUUID(), sender: "user", text: userText, timestamp: new Date() }])
    setChatInput("")
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText }),
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(await readChatError(response, "Gagal terhubung ke server AI."))
      if (!response.body) throw new Error("Server AI tidak mengirim respons.")
      reader = response.body.getReader()
      const decoder = new TextDecoder()
      setChatMessages(prev => [...prev, { id: botMsgId, sender: "bot", text: "", timestamp: new Date() }])
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        botText += decoder.decode(value, { stream: true })
        const currentText = botText
        setChatMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, text: currentText } : msg))
      }
      botText += decoder.decode()
      if (!botText.trim()) throw new Error("Server AI mengirim respons kosong. Silakan coba lagi.")
      const finalText = botText
      setChatMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, text: finalText } : msg))
    } catch (error) {
      if (!controller.signal.aborted) {
        setChatMessages(prev => prev.filter(msg => msg.id !== botMsgId || msg.text.trim()))
        const message = error instanceof Error ? error.message : "Gagal terhubung ke server AI."
        setChatError(botText.trim() ? "Respons terputus. Jawaban belum lengkap dan percakapan ini belum tersimpan. Silakan coba lagi." : message)
        setChatInput(userText)
      }
    } finally {
      reader?.releaseLock()
      if (!controller.signal.aborted) {
        operationRef.current = null
        requestRef.current = null
        setIsChatLoading(false)
      }
    }
  }

  return { chatInput, setChatInput, chatMessages, isChatLoading, isHistoryLoading, isClearingChat, chatError, isChatBusy, handleSendChat, handleClearChat }
}
