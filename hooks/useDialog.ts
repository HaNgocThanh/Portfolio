"use client"
import { useEffect, useRef } from "react"

export function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])
  useEffect(() => {
    if (!open || !ref.current) return
    const dialog = ref.current
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]'))
    const initialFocus = focusable()[0] || dialog
    initialFocus.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); return }
      if (event.key !== "Tab") return
      const elements = focusable()
      const first = elements[0], last = elements[elements.length - 1]
      if (!first) { event.preventDefault(); dialog.focus(); return }
      if (!dialog.contains(document.activeElement) || (event.shiftKey && (document.activeElement === first || document.activeElement === dialog))) {
        event.preventDefault(); (event.shiftKey ? last : first).focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus()
      }
    }
    document.addEventListener("keydown", keydown)
    return () => {
      document.removeEventListener("keydown", keydown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [open])
  return ref
}

