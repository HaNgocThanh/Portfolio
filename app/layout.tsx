import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "../styles/globals.css"
import PageLoader from "@/components/PageLoader"
import { profile } from "@/content/profile"
import { getSiteUrl } from "@/lib/site"

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-poppins" })
const title = profile.brand + " | Portfolio"

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  robots: process.env.VERCEL_ENV === "preview" ? { index: false, follow: false } : undefined,
  title: { default: title, template: "%s | " + profile.brand + " Portfolio" },
  description: profile.seoDescription,
  keywords: [profile.name, profile.brand, profile.role, "Portfolio"],
  authors: [{ name: profile.name }],
  creator: profile.name,
  openGraph: {
    type: "website", locale: profile.locale, url: "/", title,
    description: profile.seoDescription, siteName: profile.brand + " Portfolio",
    images: [{ url: profile.image, alt: title }],
  },
  twitter: { card: "summary_large_image", title, description: profile.seoDescription, images: [profile.image], creator: profile.twitterHandle || undefined },
  icons: { icon: profile.image, shortcut: profile.image, apple: profile.image },
  alternates: { canonical: "/" },
  verification: profile.googleVerification ? { google: profile.googleVerification } : undefined,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang={profile.language}><body className={poppins.className + " antialiased"}><PageLoader />{children}</body></html>
}

