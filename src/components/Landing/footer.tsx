import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-6 px-6 bg-muted">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-sm text-muted-foreground">© 2023 EduConnect. All rights reserved.</p>
        </div>
        <nav className="flex space-x-4">
          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
            Terms
          </Link>
          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
            Privacy
          </Link>
          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  )
}

