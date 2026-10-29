export interface PortfolioProject {
  index: number
  imagePath: string
  title: string
  shortDescription: string
  createdAt: string
  features: string[]
  tech: string[]
  githubUrl: string
  liveDemoUrl: string
  isPrivateRepo: boolean
}

export const projects: PortfolioProject[] = [
  {
    index: 0,
    imagePath: "/images/jadibotwa.jpeg",
    title: "JadibotWA",
    shortDescription: "Architected a code-free WhatsApp automation platform featuring live bot logs via WebSockets for real-time data, status monitoring, and scalable REST APIs.",
    createdAt: "2025-05-10",
    features: ["Live Bot Logs via WebSockets", "High-performance Microservices", "Multi-device Session Management", "AI-powered Chat Workflows"],
    tech: ["Go (Fiber)", "PostgreSQL", "WhatsMeow", "Next.js", "TypeScript", "Tailwind CSS"],
    githubUrl: "https://github.com/RyHarJr",
    liveDemoUrl: "https://jadibotwa.xyz",
    isPrivateRepo: true,
  },
  {
    index: 1,
    imagePath: "/images/ryharpanel.jpeg",
    title: "RyHar Panel",
    shortDescription: "Built a modern landing page and management platform for a Pterodactyl hosting service, focused on fast, responsive, and conversion-driven user experience.",
    createdAt: "2025-08-05",
    features: ["Pterodactyl Integration", "Automated Transaction Processing", "Payment Gateway", "SEO Optimization"],
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Express.js", "Prisma ORM", "MySQL"],
    githubUrl: "https://github.com/RyHarJr",
    liveDemoUrl: "https://ryhar-panel.my.id",
    isPrivateRepo: true,
  },
  {
    index: 2,
    imagePath: "/images/portofolio.jpeg",
    title: "RyHar Portfolio",
    shortDescription: "Developed a personal portfolio website with a modern, responsive design focused on user experience to showcase profile, skills, and completed projects.",
    createdAt: "2026-07-20",
    features: ["Interactive Animations", "Responsive Design", "Modern UI/UX"],
    tech: ["Next.js", "Tailwind CSS", "Framer Motion"],
    githubUrl: "https://github.com/RyHarJr/portofoliov2",
    liveDemoUrl: "https://ryhar.my.id",
    isPrivateRepo: false,
  },
  {
    index: 3,
    imagePath: "/images/restapi.jpeg",
    title: "RyHar REST API",
    shortDescription: "Developed a scalable REST API with Node.js and Express.js, featuring JWT authentication, database integration, and comprehensive error handling.",
    createdAt: "2026-07-20",
    features: ["JWT Authentication", "Database Integration", "Comprehensive Error Handling"],
    tech: ["Node.js", "Express.js", "Prisma ORM", "PostgreSQL"],
    githubUrl: "https://github.com/RyHarJr",
    liveDemoUrl: "https://dash.ryhar.my.id",
    isPrivateRepo: true,
  },
]
