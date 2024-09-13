import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar1 from "@/components/Navbar1";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduConnect",
  description: "A platform for students and teachers to connect",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar1 />
        {children}
      </body>
    </html>
  );
}
