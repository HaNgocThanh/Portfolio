import { getSiteUrl } from "@/lib/site"
import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl()

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    // Add additional routes here if you add more pages in the future
  ]
}
