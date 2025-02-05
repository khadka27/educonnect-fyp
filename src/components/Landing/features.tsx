import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"

const features = [
  {
    title: "Collaborative Learning",
    description: "Connect with peers and form study groups to tackle challenging subjects together.",
    icon: "👥",
  },
  {
    title: "Expert Mentorship",
    description: "Get guidance from industry professionals and experienced educators.",
    icon: "🎓",
  },
  {
    title: "Resource Sharing",
    description: "Access and share a vast library of educational materials and study resources.",
    icon: "📚",
  },
  {
    title: "Interactive Workshops",
    description: "Participate in live online workshops and webinars on various topics.",
    icon: "🖥️",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 px-6">
      <h2 className="text-3xl font-bold text-center mb-12">Why Choose EduConnect?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">{feature.icon}</span>
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

