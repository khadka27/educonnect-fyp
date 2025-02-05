import Link from "next/link"
import { Button } from "src/components/ui/button"
import { ModeToggle } from "src/components/Landing/mode-toggle"

export function Header() {
  return (
    <header className="py-4 px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b border-border/40">
      <div className="container flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12" y2="20" />
          </svg>
          <span className="font-bold text-xl">EduConnect</span>
        </Link>
        <nav className="hidden md:flex space-x-4">
          <Link href="#features" className="text-foreground/60 hover:text-foreground">
            Features
          </Link>
          <Link href="#testimonials" className="text-foreground/60 hover:text-foreground">
            Testimonials
          </Link>
          <Link href="#pricing" className="text-foreground/60 hover:text-foreground">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <ModeToggle />
          <Button variant="ghost">Log in</Button>
          <Button>Sign up</Button>
        </div>
      </div>
    </header>
  )
}

