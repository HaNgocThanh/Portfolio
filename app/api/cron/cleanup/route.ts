import { NextRequest, NextResponse } from "next/server"
import { createHash, timingSafeEqual } from "node:crypto"
import { cleanupExpiredData } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || secret.length < 32) return NextResponse.json({ success: false }, { status: 503, headers: { "Cache-Control": "no-store" } })
  const digest = (text: string) => createHash("sha256").update(text).digest()
  if (!timingSafeEqual(digest(req.headers.get("authorization") || ""), digest("Bearer " + secret))) {
    return NextResponse.json({ success: false }, { status: 401, headers: { "Cache-Control": "no-store" } })
  }
  try {
    const deleted = await cleanupExpiredData()
    return NextResponse.json({ success: true, deleted }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json({ success: false }, { status: 500, headers: { "Cache-Control": "no-store" } })
  }
}

