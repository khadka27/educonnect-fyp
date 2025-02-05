import { Button } from "src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "src/components/ui/card"

const plans = [
  {
    name: "Basic",
    price: "Free",
    features: ["Access to public study groups", "Limited resource sharing", "Community forums"],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "$9.99/month",
    features: ["Unlimited study groups", "Full resource access", "1-on-1 mentorship sessions", "Priority support"],
    cta: "Upgrade to Pro",
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Custom integrations", "Dedicated account manager", "Advanced analytics", "Team collaboration tools"],
    cta: "Contact Sales",
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-20 px-6">
      <h2 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <Card key={index} className={index === 1 ? "border-primary" : ""}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription className="text-2xl font-bold">{plan.price}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex}>{feature}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={index === 1 ? "default" : "outline"}>
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}

