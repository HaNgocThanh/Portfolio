import type { RefObject } from "react"
import { profile } from "@/content/profile"
import ChatMarkdown from "./ChatMarkdown"
import type { ChatMessage } from "./types"

export default function ChatMessages({ chatMessages, isChatLoading, chatEndRef }: { chatMessages: ChatMessage[]; isChatLoading: boolean; chatEndRef: RefObject<HTMLDivElement | null> }) {
  return (
<div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth custom-scrollbar bg-thirdary/10 flex flex-col items-center">
            <div className="w-full max-w-4xl flex flex-col gap-4 pb-4">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${msg.sender === "user" ? "bg-text-primary text-background rounded-tr-sm" : "bg-background border border-text-secondary/10 text-text-primary rounded-tl-sm shadow-sm"}`}>
                  {msg.sender === "user" ? (
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="text-sm font-medium leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-headings:mb-2 prose-headings:mt-3 prose-a:text-text-primary prose-code:bg-text-secondary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs overflow-hidden">
                      <ChatMarkdown text={msg.text} />
                    </div>
                  )}
                  <span className={`text-[10px] uppercase font-bold tracking-wider mt-2 block ${msg.sender === "user" ? "text-background/70" : "text-text-secondary/70"}`}>
                    {msg.timestamp.toLocaleTimeString(profile.dateLocale, { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex w-full justify-start">
                <div className="max-w-[85%] bg-background border border-text-secondary/10 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex gap-1.5 items-center">
                  <div className="w-2 h-2 rounded-full bg-text-secondary/40 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-text-secondary/40 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-text-secondary/40 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
            </div>
          </div>
  )
}
