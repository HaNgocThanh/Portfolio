import { existsSync } from "node:fs"
import path from "node:path"
import { profile } from "@/content/profile"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Hero from "./hero"
import About from "./about"
import Experience from "./experience"
import TechStack from "./tech-stack"
import Project from "./project"
import Contact from "./contact"

export default function Home() {
  const cvAvailable = Boolean(profile.cv && existsSync(path.join(process.cwd(), "public", profile.cv)))
  return (
    <>
      <header className="cursor-default sticky top-0 z-50">
        <Header />
      </header>
      <main>
      <Hero cvAvailable={cvAvailable} />
      <About />
      <Experience />
      <TechStack />
      <Project />
      <Contact />
      </main>
      <Footer />
    </>
  )
}
