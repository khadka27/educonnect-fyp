import Providers from '@/app/Providers/page'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Edu Connect',
  description: 'Edu connect',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  )
}