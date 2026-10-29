import { profile, getContactLinks } from "@/content/profile"
import FadeDown from "@/components/animations/FadeDown"
import SocialIcon from "@/components/SocialIcon"
import ChatWidget from "@/components/chat/ChatWidget"

export default function Contact() {
  const chatEnabled = Boolean(process.env.TURSO_DATABASE_URL?.trim() && process.env.TURSO_AUTH_TOKEN?.trim() && process.env.ROUTER_APIKEY?.trim() && process.env.ROUTER_BASE_URL?.trim() && process.env.ROUTER_MODEL?.trim())
  return (
    <section id="contacts" className="w-full max-w-7xl mx-auto py-24 md:py-32 cursor-default bg-background relative overflow-hidden border-t border-text-secondary/10">
      <FadeDown>
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16 md:mb-24 w-full text-left">
          <h2 className="text-sm font-bold tracking-[0.2em] text-text-secondary uppercase mb-4">Get In Touch</h2>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-text-primary tracking-tighter">Contact Me</h3>
        </div>
      </FadeDown>
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        <FadeDown delay={0.2}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {profile.map.embedUrl && <div className="bg-background border border-text-secondary/20 rounded-3xl overflow-hidden h-[400px] lg:h-auto min-h-[400px] shadow-xl relative group">
              <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-md px-4 py-2 rounded-xl border border-text-secondary/20 pointer-events-none">
                <p className="text-sm font-bold text-text-primary">{profile.map.title}</p>
                <p className="text-xs font-medium text-text-secondary">{profile.map.location}</p>
              </div>
              <iframe src={profile.map.embedUrl} title={"Location: " + profile.map.title} className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>}
            <div className="grid grid-cols-3 sm:flex sm:flex-col gap-4">
              {getContactLinks().map(link => <a key={link.key} href={link.href} aria-label={link.name} target="_blank" rel="noopener noreferrer"
                className="group bg-background border border-text-secondary/20 rounded-2xl p-4 sm:p-6 flex items-center justify-center sm:justify-between hover:border-text-primary hover:bg-text-secondary/5 transition-all duration-300 shadow-sm aspect-square sm:aspect-auto">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-text-secondary/10 flex items-center justify-center text-text-primary group-hover:scale-110 transition-transform"><SocialIcon name={link.key} className="w-6 h-6" /></div>
                  <div className="hidden sm:block"><h4 className="text-lg font-bold text-text-primary">{link.name}</h4><p className="text-sm font-medium text-text-secondary">{link.label}</p></div>
                </div>
                <span aria-hidden="true" className="hidden sm:block text-text-secondary">→</span>
              </a>)}
            </div>
          </div>
        </FadeDown>
      </div>
      {chatEnabled && <ChatWidget />}
    </section>
  )
}


