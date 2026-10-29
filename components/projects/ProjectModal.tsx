"use client"
import { motion } from "motion/react"
import { useDialog } from "@/hooks/useDialog"
import type { PortfolioProject } from "@/content/projects"

export default function ProjectModal({ project, onClose }: { project: PortfolioProject; onClose: () => void }) {
  const dialogRef = useDialog(true, onClose)
  return (
<div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              {/* Backdrop */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={() => onClose()} />

              {/* Modal Container */}
              <motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="project-dialog-title" tabIndex={-1} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="bg-background border border-text-secondary/20 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative z-10">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-text-secondary/10">
                  <h4 id="project-dialog-title" className="text-2xl font-black text-text-primary tracking-tight">{project.title}</h4>
                  <button aria-label="Close project details" className="text-text-secondary hover:text-text-primary transition-colors p-2 bg-text-secondary/5 rounded-full" onClick={() => onClose()}>
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 md:p-8 overflow-y-auto flex-grow custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10 pb-8 border-b border-text-secondary/10">
                    <div>
                      <span className="text-xs font-bold tracking-widest text-text-secondary uppercase block mb-3">Created</span>
                      <span className="text-sm font-bold bg-thirdary text-text-primary px-3 py-1.5 rounded-lg border border-text-secondary/10">{project.createdAt}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold tracking-widest text-text-secondary uppercase block mb-3">Technologies</span>
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((tech, i) => (
                          <span key={i} className="text-xs font-bold bg-thirdary text-text-primary px-3 py-1.5 rounded-lg border border-text-secondary/10 uppercase tracking-wider">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold tracking-widest text-text-secondary uppercase block mb-5">Key Features</span>
                    <ul className="space-y-4">
                      {project.features.map((feature, i) => (
                        <li key={i} className="flex items-center bg-thirdary/50 p-4 rounded-xl border border-text-secondary/5">
                          <span className="text-text-primary mr-3 font-black">&rarr;</span>
                          <span className="text-sm font-bold text-text-primary uppercase tracking-wide">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-text-secondary/10 flex flex-col sm:flex-row gap-4 bg-background">
                  <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center font-bold text-sm tracking-widest uppercase bg-text-primary text-background py-4 rounded-xl hover:-translate-y-1 transition-transform duration-300">
                    Live Demo
                  </a>
                  {project.isPrivateRepo ? (
                    <button disabled className="flex-1 flex justify-center items-center gap-2 text-center font-bold text-sm tracking-widest uppercase border-2 border-text-secondary/20 text-text-secondary opacity-50 cursor-not-allowed py-4 rounded-xl">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Source Code
                    </button>
                  ) : (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center items-center gap-2 text-center font-bold text-sm tracking-widest uppercase border-2 border-text-secondary/20 text-text-primary hover:border-text-primary hover:-translate-y-1 transition-all duration-300 py-4 rounded-xl">
                      Source Code
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
  )
}
