// layout.tsx (Server Component)

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./Providers/page"; // Move client-side logic here

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduConnect",
  description: "Connecting Education, Empowering Futures!!!!",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers> {/* Use Providers component */}
      </body>
    </html>
  );
}
