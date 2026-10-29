import { profile } from "@/content/profile"

function origin(value: string) {
  const url = new URL(value)
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("Invalid site URL")
  return url.origin
}

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim()
  if (configured) return origin(configured)
  if (profile.siteUrl) return origin(profile.siteUrl)
  const generated = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  return generated ? origin("https://" + generated) : "http://localhost:3000"
}

export function getAllowedOrigins(requestOrigin: string) {
  const allowed = new Set([getSiteUrl()])
  if (process.env.VERCEL === "1") {
    for (const host of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]) {
      if (host) allowed.add(origin("https://" + host))
    }
  } else if (process.env.NODE_ENV !== "production") {
    allowed.add(origin(requestOrigin))
  }
  return allowed
}

