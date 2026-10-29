"use client"
import { useState, useEffect, useRef } from "react"
import { assistantName } from "@/content/profile"
import { useChat } from "@/hooks/useChat"
import { useDialog } from "@/hooks/useDialog"
import ChatMessages from "./ChatMessages"
import ChatInput from "./ChatInput"

export default function ChatWidget() {
  const [isOpenChat, setIsOpenChat] = useState(false)
  const { chatInput, setChatInput, chatMessages, isChatLoading, isHistoryLoading, isClearingChat, chatError, isChatBusy, handleSendChat, handleClearChat } = useChat()
  const chatEndRef = useRef<HTMLDivElement>(null)
  const dialogRef = useDialog(isOpenChat, () => setIsOpenChat(false))
  useEffect(() => {
    if (isOpenChat) chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, isOpenChat])
  return <>
      {/* Floating Chatbot Button */}
      <div className="fixed bottom-6 right-6 lg:bottom-12 lg:right-12 z-40">
        <button aria-label="Open portfolio assistant" onClick={() => setIsOpenChat(true)} className="group bg-text-primary text-background p-4 md:p-5 rounded-full shadow-2xl hover:-translate-y-2 transition-all duration-300 flex items-center justify-center relative border-4 border-background hover:shadow-text-primary/20">
          <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
          <span className="absolute -top-2 -right-2 flex h-5 w-5 md:h-6 md:w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 md:h-6 md:w-6 bg-thirdary text-text-primary border border-text-secondary/20 text-[10px] md:text-xs font-bold items-center justify-center">AI</span>
          </span>
        </button>
      </div>

      {/* Chatbot Modal Overlay */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-0 transition-all duration-500 ${isOpenChat ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        {/* Backdrop */}
        <div className={`absolute inset-0 bg-background/90 backdrop-blur-xl transition-opacity duration-500 ${isOpenChat ? "opacity-100" : "opacity-0"}`} onClick={() => setIsOpenChat(false)}></div>

        {/* Modal content */}
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="chat-dialog-title" tabIndex={-1} className={`bg-background w-full h-[100dvh] shadow-2xl z-10 flex flex-col transition-all duration-500 transform ${isOpenChat ? "translate-y-0 scale-100 opacity-100" : "translate-y-12 scale-95 opacity-0"}`}>
          {/* Header */}
          <div className="flex justify-between items-center p-4 md:p-6 border-b border-text-secondary/10 bg-background relative z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-thirdary flex items-center justify-center text-text-primary font-black border border-text-secondary/10">AI</div>
              <div>
                <h3 id="chat-dialog-title" className="text-lg font-black text-text-primary tracking-tight leading-none">{assistantName}</h3>
                <span className="text-xs text-green-500 font-bold flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 block animate-pulse"></span> Online
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleClearChat}
                disabled={isChatBusy} 
                className="text-text-secondary hover:text-red-500 transition-colors p-2 bg-text-secondary/5 rounded-full"
                title="Hapus / Mulai Baru"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
              <button onClick={() => setIsOpenChat(false)} className="text-text-secondary hover:text-text-primary transition-colors p-2 bg-text-secondary/5 rounded-full" title="Tutup">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <ChatMessages chatMessages={chatMessages} isChatLoading={isChatLoading} chatEndRef={chatEndRef} />

          {chatError && <p role="alert" className="px-4 py-2 text-sm text-red-600 dark:text-red-400">{chatError}</p>}
          {isHistoryLoading && <p role="status" className="px-4 py-2 text-sm text-text-secondary">Memuat riwayat chat...</p>}
          {isClearingChat && <p role="status" className="px-4 py-2 text-sm text-text-secondary">Menghapus riwayat chat...</p>}
          <ChatInput value={chatInput} busy={isChatBusy} onChange={setChatInput} onSubmit={handleSendChat} />
        </div>
      </div>


  </>
}
