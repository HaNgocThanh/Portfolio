"use client"
import Image from "next/image"
import GlareHover from "@/components/GlareHover"
import type { PortfolioProject } from "@/content/projects"

export default function ProjectCard({ project, onOpen }: { project: PortfolioProject; onOpen: (index: number) => void }) {
  return (
<GlareHover className="group flex flex-col h-full bg-background border border-text-secondary/20 hover:border-text-primary/50 rounded-xl overflow-hidden transition-all duration-500 shadow-sm hover:shadow-2xl">
                <div className="relative overflow-hidden aspect-[16/10] bg-text-secondary/5 border-b border-text-secondary/10">
                  <Image src={project.imagePath} alt={project.title} fill sizes="(min-width: 1024px) 33vw, 85vw" className="object-cover transition-all duration-700 group-hover:scale-105" />

                  {/* Tech Stack Overlay */}
                  <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-[-10px] group-hover:translate-y-0">
                    {project.tech.slice(0, 3).map((tech, i) => (
                      <span key={i} className="text-[10px] font-bold bg-background/90 text-text-primary px-2 py-1 rounded backdrop-blur-md border border-text-secondary/20 uppercase tracking-widest shadow-sm">
                        {tech}
                      </span>
                    ))}
                    {project.tech.length > 3 && <span className="text-[10px] font-bold bg-background/90 text-text-primary px-2 py-1 rounded backdrop-blur-md border border-text-secondary/20 uppercase tracking-widest shadow-sm">+{project.tech.length - 3}</span>}
                  </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col flex-grow relative">
                  {/* Numbering */}
                  <div className="absolute top-0 right-6 -translate-y-1/2 bg-background border border-text-secondary/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-text-secondary shadow-sm">{String(project.index + 1).padStart(2, "0")}</div>

                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-2xl font-black text-text-primary tracking-tight leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-text-primary group-hover:to-text-secondary transition-all duration-500">{project.title}</h4>
                  </div>

                  <p className="text-sm text-text-secondary font-medium leading-relaxed mb-8 flex-grow line-clamp-3">{project.shortDescription}</p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-text-secondary/10">
                    <button className="text-xs font-bold tracking-[0.2em] uppercase text-text-primary flex items-center gap-3 group/btn" onClick={() => onOpen(project.index)}>
                      View Details
                      <span className="w-8 h-[2px] bg-text-primary group-hover/btn:w-12 transition-all duration-300"></span>
                    </button>

                    <a aria-label={"Open " + project.title + " demo"} href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="p-2 border border-text-secondary/20 rounded-full text-text-secondary hover:text-background hover:bg-text-primary hover:border-text-primary transition-all duration-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </GlareHover>
  )
}
