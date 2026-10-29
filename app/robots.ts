import { getSiteUrl } from "@/lib/site"
import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl()

  return {
    rules: {
      userAgent: "*",
      allow: process.env.VERCEL_ENV === "preview" ? undefined : "/",
      disallow: process.env.VERCEL_ENV === "preview" ? "/" : "/private/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
