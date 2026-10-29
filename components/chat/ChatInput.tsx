import type { FormEventHandler } from "react"

interface Props {
  value: string
  busy: boolean
  onChange: (value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

export default function ChatInput({ value, busy, onChange, onSubmit }: Props) {
  return (
    <div className="p-4 border-t border-text-secondary/10 bg-background flex justify-center">
      <form onSubmit={onSubmit} className="flex gap-2 w-full max-w-4xl">
        <input type="text" value={value} onChange={event => onChange(event.target.value)} maxLength={1000}
          aria-label="Chat message" placeholder="Ask me anything..." disabled={busy}
          className="flex-1 bg-thirdary/30 border border-text-secondary/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-primary text-text-primary font-medium transition-colors" />
        <button type="submit" aria-label="Send message" disabled={!value.trim() || busy}
          className="bg-text-primary text-background p-3 rounded-xl hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </form>
    </div>
  )
}

