/* eslint-disable react/no-unescaped-entities */
import { Card, CardContent, CardFooter } from "src/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar"

const testimonials = [
  {
    quote:
      "EduConnect has revolutionized my learning experience. The collaborative features and expert mentorship have helped me achieve my academic goals.",
    author: "Sarah J.",
    role: "Computer Science Student",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    quote:
      "As an educator, I've found EduConnect to be an invaluable platform for connecting with students and sharing knowledge beyond the classroom.",
    author: "Dr. Michael R.",
    role: "Professor of Biology",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    quote:
      "The resource sharing on EduConnect is unparalleled. I've discovered study materials that have significantly improved my understanding of complex topics.",
    author: "Alex T.",
    role: "Engineering Graduate",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 px-6 bg-muted">
      <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="bg-background">
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
            </CardContent>
            <CardFooter>
              <Avatar className="mr-4">
                <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                <AvatarFallback>{testimonial.author[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}

