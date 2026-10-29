"use client"
import { profile } from "@/content/profile"
import SocialIcon from "@/components/SocialIcon"
import Image from "next/image"
import { useEffect, useState } from "react"
import FadeRight from "@/components/animations/FadeRight"
import FadeLeft from "@/components/animations/FadeLeft"

const texts = profile.roles.length ? profile.roles : [profile.role]

export default function Hero({ cvAvailable = false }: { cvAvailable?: boolean }) {
  const [index, setIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)



  const handleScroll = (id: string) => {
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  useEffect(() => {
    const currentIndex = index % texts.length

    const timeout = setTimeout(
      () => {
        const currentText = texts[currentIndex]

        if (!deleting && subIndex < currentText.length) {
          setSubIndex(subIndex + 1)
        } else if (deleting && subIndex > 0) {
          setSubIndex(subIndex - 1)
        } else if (!deleting && subIndex === currentText.length) {
          setDeleting(true)
        } else if (deleting && subIndex === 0) {
          setDeleting(false)
          setIndex((currentIndex + 1) % texts.length)
        }
      },
      deleting ? 75 : 150,
    )

    return () => clearTimeout(timeout)
  }, [subIndex, deleting, index])

  return (
    <>
      <section id="home" className="w-full max-w-7xl mx-auto cursor-default grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center px-6 md:px-12 py-24 md:py-32 overflow-hidden">
        <FadeLeft>
          <div className="flex flex-col gap-2">
            <div>
              <h1 className="text-text-primary text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-tight">
                Hi, I&apos;m
                <span className="text-transparent bg-clip-text bg-linear-to-r from-text-primary to-text-secondary"> {profile.shortName}</span>
              </h1>
            </div>

            <div className="relative">
              <span className={`text-text-primary text-xl md:text-2xl lg:text-3xl font-bold tracking-tight`}>{`${texts[index].substring(0, subIndex)}`}</span>
              <span className="animate-cursor text-text-secondary text-2xl lg:text-3xl font-light">|</span>
            </div>

            <div className="max-w-xl mt-4">
              <p className="text-text-secondary text-base md:text-lg leading-relaxed font-medium">{profile.intro}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button onClick={() => handleScroll("projects")} className="cursor-pointer text-sm md:text-base font-bold bg-text-primary text-background px-8 py-4 rounded-xl flex flex-row items-center justify-center gap-3 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.1)] transition-all duration-300 ease-out">
                Explore Work
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4" />
                </svg>
              </button>
              {cvAvailable && <a href={profile.cv} download className="cursor-pointer text-sm md:text-base font-bold border-2 border-text-secondary/20 hover:border-text-primary text-text-primary px-8 py-4 rounded-xl flex flex-row items-center justify-center gap-3 hover:-translate-y-1.5 hover:scale-[1.02] hover:bg-thirdary/40 transition-all duration-300 ease-out bg-background/50 backdrop-blur-sm shadow-[0_4px_10px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_10px_rgba(255,255,255,0.02)]">
                Download CV
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2m-8 1V4m0 12-4-4m4 4 4-4" />
                </svg>
              </a>}
            </div>

            <div className="mt-12 pt-8 border-t border-text-secondary/10">
              <span className="text-xs uppercase tracking-widest font-bold text-text-secondary mb-4 block">Connect</span>
              <div className="flex flex-row gap-4">
                {profile.socials.filter(link => ["instagram", "github", "linkedin"].includes(link.key)).map((item, index) => (
                  <a aria-label={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className="p-3 border border-text-secondary/20 rounded-xl hover:border-text-primary hover:bg-text-primary hover:text-background text-text-primary transition-all duration-300" key={index}>
                    <SocialIcon name={item.key} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </FadeLeft>

        <FadeRight>
          <div className="flex flex-col items-center justify-center relative mt-12 md:mt-0">
            {/* Subtle aesthetic backdrop instead of neon glow */}
            <div className="absolute inset-0 bg-linear-to-tr from-thirdary to-background rounded-full scale-110 opacity-50 blur-2xl"></div>

            <div className="relative z-10 p-2 bg-background border border-text-secondary/10 rounded-full shadow-2xl group">
              <Image src={profile.image} alt={profile.name} width={400} height={400} className="rounded-full object-cover aspect-square floating grayscale hover:grayscale-0 group-hover:grayscale-0 transition-all duration-700 cursor-pointer" priority />
            </div>

            {/* Quick Stats redesigned as floating minimal badges */}
            <div className="absolute -bottom-10 md:-bottom-12 -left-4 md:-left-12 z-20 flex flex-col gap-3">
              {profile.highlights.map((message, index) => (
                <div className={`floating flex items-center gap-3 bg-background/90 backdrop-blur-md border border-text-secondary/10 p-3 pr-5 rounded-2xl shadow-xl hover:-translate-y-1 transition-transform duration-300 animate-in fade-in slide-in-from-bottom-5`} style={{ animationDelay: `${index * 150}ms` }} key={index}>
                  <div className="bg-text-primary text-background p-2 rounded-xl">{quickStatsList[index % quickStatsList.length].icon}</div>
                  <span className="text-xs md:text-sm font-semibold text-text-primary whitespace-nowrap">{message}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeRight>
      </section>
    </>
  )
}

const quickStatsList = [
  {
    icon: (
      <svg className="w-5 md:w-6 text-text-background" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    icon: (
      <svg className="w-5 md:w-6 text-text-background" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 8-4 4 4 4m8 0 4-4-4-4m-2-3-4 14" />
      </svg>
    ),
  },
  {
    icon: (
      <svg className="w-5 md:w-6 text-text-background" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5M5 12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2M5 12h14m-7 4v3m-4 0h8" />
      </svg>
    ),
  },
]


