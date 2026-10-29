"use client"
import { useState } from "react"
import { AnimatePresence } from "motion/react"
import { projects } from "@/content/projects"
import { profile } from "@/content/profile"
import FadeDown from "@/components/animations/FadeDown"
import FadeUp from "@/components/animations/FadeUp"
import ProjectCard from "@/components/projects/ProjectCard"
import ProjectModal from "@/components/projects/ProjectModal"

export default function Project() {
  const [isOpen, setIsOpen] = useState<number | null>(null)
  const activeProject = projects.find(project => project.index === isOpen)
  const github = profile.socials.find(link => link.key === "github")
  return (
    <section id="projects" className="w-full max-w-7xl mx-auto py-24 md:py-32 cursor-default bg-background relative border-t border-text-secondary/10">
      <FadeDown>
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16 md:mb-24 w-full text-left">
          <h2 className="text-sm font-bold tracking-[0.2em] text-text-secondary uppercase mb-4">Portfolio</h2>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-text-primary tracking-tighter">Selected Works</h3>
        </div>
      </FadeDown>
      <div className="hidden lg:grid max-w-7xl mx-auto grid-cols-3 gap-8 px-6 md:px-12">
        {projects.map(project => <FadeUp key={project.index}><ProjectCard project={project} onOpen={setIsOpen} /></FadeUp>)}
      </div>
      <div className="lg:hidden w-full overflow-hidden relative py-4">
        <div className="flex w-max animate-infinite-scroll hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
          {[0, 1].map(copy => <div key={copy} className="flex gap-6 px-3">
            {projects.map(project => <div key={project.index} className="w-[85vw] sm:w-[400px] flex-shrink-0">
              <ProjectCard project={project} onOpen={setIsOpen} />
            </div>)}
          </div>)}
        </div>
      </div>
      {github && <FadeUp><div className="mt-16 flex justify-center w-full px-6">
        <a href={github.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-background border border-text-secondary/20 text-text-primary hover:border-text-primary hover:bg-text-primary hover:text-background rounded-xl font-bold tracking-widest text-sm uppercase transition-all duration-300">View More Project</a>
      </div></FadeUp>}
      <AnimatePresence>
        {activeProject && <ProjectModal key={activeProject.index} project={activeProject} onClose={() => setIsOpen(null)} />}
      </AnimatePresence>
    </section>
  )
}

