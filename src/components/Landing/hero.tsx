import { Button } from "src/components/ui/button"

export function Hero() {
  return (
    <section className="py-20 px-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
        Connect, Learn, and Grow with EduConnect
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        Join the ultimate educational social network. Collaborate with peers, access expert knowledge, and accelerate
        your learning journey.
      </p>
      <Button size="lg" className="mr-4">
        Get Started
      </Button>
      <Button size="lg" variant="outline">
        Learn More
      </Button>
    </section>
  )
}

