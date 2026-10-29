export interface ExperienceItem {
  id: number
  company: string
  role: string
  date: string
  description: string
  skills: string[]
}

export const experiences: ExperienceItem[] = [
  {
    id: 1,
    company: "PT ANDRITZ Indonesia",
    role: "IT Internship",
    date: "Jul 2026 - present",
    description: "Developed and implemented internal business solutions and automated digital workflows using Microsoft Power Apps and Microsoft Power Automate. Integrated SharePoint as a central data repository to streamline organizational processes and improve operational productivity.",
    skills: ["MS Power Apps", "MS Power Automate", "SharePoint"],
  },
  {
    id: 2,
    company: "Freelance",
    role: "Full Stack Web Developer",
    date: "2025 - present",
    description: "Engineered and deployed custom responsive web applications for multiple clients using modern full-stack frameworks. Led technical discovery sessions to translate business requirements into functional architecture, and implemented end-to-end development practices optimizing performance and scalability across Linux servers.",
    skills: ["Next.js", "Express.js", "Laravel", "React"],
  },
  {
    id: 3,
    company: "Litbang IT (HIMSI)",
    role: "IT & Web Developer",
    date: "2026 - present",
    description: "Served as an operator for the CTRL-Z event, ensuring smooth technical execution. Developed a web-based application for the organization using React.",
    skills: ["React.js", "Technical Operations"],
  },
  {
    id: 4,
    company: "MDPTV",
    role: "Photography, Videography & Web Developer",
    date: "2024 - present",
    description: "Operated professional camera equipment for campus broadcasting and media production. Developed a custom web platform for MDPTV using React.js for the frontend, alongside Bun and Prisma ORM for the backend.",
    skills: ["React.js", "Bun", "Prisma ORM", "Broadcasting"],
  },
  {
    id: 5,
    company: "Procom (Programming Community)",
    role: "Member",
    date: "2024 - 2026",
    description: "Completed Coaching program covering ReactJS and RESTful APIs, culminating in a Next.js web application as the final project.",
    skills: ["ReactJS", "RESTful APIs", "Next.js"],
  },
  {
    id: 6,
    company: "Radio Republik Indonesia",
    role: "Intern",
    date: "Feb 2024 - May 2024",
    description: "Maintained digital broadcasting infrastructure and IT operation systems to ensure uninterrupted media production. Resolved technical hardware and network troubleshooting tasks to minimize system downtime during live broadcasts.",
    skills: ["IT Operations", "Network Troubleshooting", "Hardware Maintenance"],
  },
]
