import { profile } from "@/content/profile"

export default function Footer() {
  return (
    <footer className="w-full border-t border-text-secondary/10 bg-background py-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <p className="text-sm font-medium text-text-secondary">&copy; {new Date().getFullYear()} {profile.copyrightName}. All rights reserved.</p>
          <p className="text-xs font-medium text-text-secondary/70 mt-1">Built with Next.js &amp; Tailwind CSS</p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-6">
          {profile.socials.filter(link => ["github", "linkedin", "instagram"].includes(link.key)).map(link =>
            <a key={link.key} href={link.href} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors text-xs font-bold uppercase tracking-widest">{link.name}</a>)}
        </div>
      </div>
    </footer>
  )
}

