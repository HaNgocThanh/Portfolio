export interface TechCategory {
  title: string
  description: string
  technologies: { name: string; icon: string }[]
}

export const techCategories: TechCategory[] = [
  {
    title: "Frontend",
    description: "Frameworks and libraries for building interactive user interfaces.",
    technologies: [
      { name: "React.js", icon: "/icons/react.svg" },
      { name: "Next.js", icon: "/icons/nextjs.svg" },
      { name: "Tailwind CSS", icon: "/icons/tailwindcss.svg" },
      { name: "HTML5", icon: "/icons/html.svg" },
      { name: "CSS3", icon: "/icons/css.svg" },
      { name: "Framer Motion", icon: "/icons/framermotion.svg" },
    ],
  },
  {
    title: "Backend",
    description: "Server-side technologies and frameworks.",
    technologies: [
      { name: "Node.js", icon: "/icons/nodejs.svg" },
      { name: "Express.js", icon: "/icons/express.svg" },
      { name: "Go (Golang)", icon: "/icons/go.svg" },
      { name: "Fiber", icon: "/icons/fiber.svg" },
      { name: "Laravel", icon: "/icons/laravel.svg" },
    ],
  },
  {
    title: "Databases & ORM",
    description: "Database management systems and Object-Relational Mappers.",
    technologies: [
      { name: "MySQL", icon: "/icons/mysql.svg" },
      { name: "PostgreSQL", icon: "/icons/postgresql.svg" },
      { name: "MongoDB", icon: "/icons/mongodb.svg" },
      { name: "Prisma ORM", icon: "/icons/prisma.svg" },
    ],
  },
  {
    title: "Tools & Infrastructure",
    description: "Development tools, version control, and deployment.",
    technologies: [
      { name: "Git", icon: "/icons/git.svg" },
      { name: "GitHub", icon: "/icons/github.svg" },
      { name: "Docker", icon: "/icons/docker.svg" },
      { name: "Linux", icon: "/icons/linux.svg" },
      { name: "Nginx", icon: "/icons/nginx.svg" },
      { name: "Postman", icon: "/icons/postman.svg" },
    ],
  },
]
