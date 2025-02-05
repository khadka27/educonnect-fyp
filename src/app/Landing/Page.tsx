import { Header } from "src/components/Landing/header"
import { Hero } from "src/components/Landing/hero"
import { Features } from "src/components/Landing/features"
import { Testimonials } from "src/components/Landing/testimonials"
import { Pricing } from "src/components/Landing/pricing"
import { Footer } from "src/components/Landing/footer"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}

