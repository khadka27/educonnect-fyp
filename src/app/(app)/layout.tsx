import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "src/components/bar/Navbar/Navbar";
import Providers from "src/app/Providers/page";
import { getServerSession } from "next-auth/next";
import { authOptions } from "src/app/api/auth/[...nextauth]/route";

// Load font only once
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduConnect",
  description: "A platform for students and teachers to connect",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  // Get session for auth provider
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="light">
      <body className={inter.className}>
        <Navbar />
        <main>
          <Providers session={session}>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
